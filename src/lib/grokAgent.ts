import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { extname, join, normalize, relative, resolve, sep } from "path";
import type { AgentPatch } from "./types";

const ROOT = process.cwd();
const ALLOW_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".md", ".txt", ".svg"]);
const DENY = ["node_modules", ".git", ".env", "data", "dist", ".next"];

export function xaiReady() {
  return { ready: !!process.env.XAI_API_KEY, model: process.env.XAI_MODEL || "grok-4.5" };
}

function safePath(rel: string) {
  const clean = rel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean || clean.includes("..")) return null;
  const abs = resolve(ROOT, clean);
  const relTo = relative(ROOT, abs);
  if (relTo.startsWith("..") || relTo.split(sep).some((p) => DENY.includes(p) || p.startsWith(".env"))) return null;
  return { abs, rel: clean };
}

export function readProjectFile(rel: string) {
  const p = safePath(rel);
  if (!p || !existsSync(p.abs) || !statSync(p.abs).isFile()) return { error: "File not found" };
  if (![...ALLOW_EXT].includes(extname(p.abs)) && !p.rel.startsWith("src/") && !p.rel.startsWith("public/")) {
    return { error: "That file type is locked" };
  }
  const buf = readFileSync(p.abs);
  if (buf.length > 120_000) return { error: "File too large to read" };
  return { path: p.rel, content: buf.toString("utf8") };
}

export function listProject(rel = "src") {
  const p = safePath(rel || "src");
  if (!p || !existsSync(p.abs)) return { error: "Folder not found" };
  const names = readdirSync(p.abs).slice(0, 80).map((name) => {
    const abs = join(p.abs, name);
    const st = statSync(abs);
    return { name, dir: st.isDirectory(), path: `${p.rel}/${name}`.replace(/\\/g, "/") };
  });
  return { path: p.rel, entries: names };
}

function searchProject(query: string, folder = "src") {
  const p = safePath(folder);
  if (!p) return { error: "Bad folder" };
  const hits: { path: string; line: number; text: string }[] = [];
  const q = query.toLowerCase();
  function walk(dir: string, rel: string) {
    if (hits.length >= 40) return;
    let names: string[] = [];
    try {
      names = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of names) {
      if (DENY.includes(name)) continue;
      const abs = join(dir, name);
      const st = statSync(abs);
      const r = `${rel}/${name}`.replace(/\\/g, "/");
      if (st.isDirectory()) walk(abs, r);
      else if (ALLOW_EXT.has(extname(name)) && st.size < 200_000) {
        const lines = readFileSync(abs, "utf8").split("\n");
        lines.forEach((text, i) => {
          if (hits.length < 40 && text.toLowerCase().includes(q)) hits.push({ path: r, line: i + 1, text: text.trim().slice(0, 180) });
        });
      }
    }
  }
  walk(p.abs, p.rel);
  return { hits };
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List a folder in the HODL Hotel repo.",
      parameters: { type: "object", properties: { path: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a source file.",
      parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_code",
      description: "Search src for a string.",
      parameters: { type: "object", properties: { query: { type: "string" }, folder: { type: "string" } }, required: ["query"] },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_files",
      description: "Propose full-file replacements to preview or ship. Always send complete file contents.",
      parameters: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: {
              type: "object",
              properties: { path: { type: "string" }, content: { type: "string" }, note: { type: "string" } },
              required: ["path", "content"],
            },
          },
        },
        required: ["files"],
      },
    },
  },
];

const SYSTEM = `You are Grok, the staff engineer inside HODL Hotel's command center.
This is a Next.js 15 cartoon social hotel on Solana (hodlhotel.app). Original branding, treasury DFpam8jgBo1gqJ2aoUs3n7SVaptDEHSBxiZKFg3Fz3JN, no sports rebrand, no soccer, no generic mascots.

Key paths:
- src/app/play, src/components/GameClient.tsx — in-game client
- src/lib/game/avatar.ts, public/art/avatars — character layers (base + hair/top/bot/shoe, never overlay leftover clothes)
- src/lib/catalog.ts, src/lib/seed.ts, src/lib/layouts.ts — furniture and public rooms (unique hotel-only items)
- src/lib/store.ts, src/lib/game/world.ts — persistence and actions
- src/app/admin — this desk

When asked to change the product:
1. Read the relevant files first.
2. Propose a short plan.
3. Call propose_files with COMPLETE file contents for every file you change.
4. Do not invent env secrets. Do not touch .env files.
5. Keep diffs focused.

If the mode is preview, you only plan and propose — nothing is applied until staff hits Ship.`;

type Msg = { role: string; content?: string | null; tool_calls?: unknown; tool_call_id?: string; name?: string };

function runTool(name: string, args: Record<string, unknown>) {
  if (name === "list_files") return listProject(String(args.path || "src"));
  if (name === "read_file") return readProjectFile(String(args.path || ""));
  if (name === "search_code") return searchProject(String(args.query || ""), String(args.folder || "src"));
  if (name === "propose_files") return { ok: true, count: Array.isArray(args.files) ? args.files.length : 0 };
  return { error: "Unknown tool" };
}

export async function runGrok(opts: { prompt: string; history?: { role: "user" | "assistant"; content: string }[]; mode: "preview" | "build" }) {
  const key = process.env.XAI_API_KEY;
  const model = process.env.XAI_MODEL || "grok-4.5";
  if (!key) {
    return {
      reply: "Set XAI_API_KEY on the server (console.x.ai) so the desk can call Grok.",
      plan: "",
      patches: [] as AgentPatch[],
      log: ["missing XAI_API_KEY"],
    };
  }
  const messages: Msg[] = [
    { role: "system", content: SYSTEM + `\nMode: ${opts.mode}.` },
    ...(opts.history || []).slice(-8),
    { role: "user", content: opts.prompt },
  ];
  const patches: AgentPatch[] = [];
  const log: string[] = [];
  let reply = "";
  for (let i = 0; i < 8; i++) {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model, messages, tools: TOOLS, temperature: 0.2 }),
    });
    const json = (await res.json()) as {
      error?: { message?: string };
      choices?: { message?: { content?: string; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[];
    };
    if (!res.ok) throw new Error(json.error?.message || `xAI ${res.status}`);
    const msg = json.choices?.[0]?.message;
    if (!msg) break;
    if (msg.tool_calls?.length) {
      messages.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });
      for (const call of msg.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = {};
        }
        log.push(`${call.function.name} ${String(args.path || args.query || "")}`.trim());
        if (call.function.name === "propose_files" && Array.isArray(args.files)) {
          for (const f of args.files as AgentPatch[]) {
            if (f?.path && typeof f.content === "string") {
              const p = safePath(f.path);
              if (p) patches.push({ path: p.rel, content: f.content, note: f.note });
            }
          }
        }
        const result = runTool(call.function.name, args);
        messages.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: JSON.stringify(result).slice(0, 24_000) });
      }
      continue;
    }
    reply = msg.content || "";
    break;
  }
  const plan = reply.split("\n").slice(0, 24).join("\n");
  return { reply, plan, patches, log };
}

export function applyLocal(patches: AgentPatch[]) {
  const wrote: string[] = [];
  for (const f of patches) {
    const p = safePath(f.path);
    if (!p) throw new Error(`Blocked path ${f.path}`);
    writeFileSync(p.abs, f.content, "utf8");
    wrote.push(p.rel);
  }
  return wrote;
}

export function currentFile(rel: string) {
  const got = readProjectFile(rel);
  return "content" in got ? got.content : "";
}
