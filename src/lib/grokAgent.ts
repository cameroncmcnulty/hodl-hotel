import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { extname, join, relative, resolve, sep } from "path";
import { githubReady, repoList, repoRead, repoReadBlob, repoTree } from "./githubShip";
import { HOTEL_BRIEF } from "./grokBrief";
import type { AgentAttachment, AgentPatch } from "./types";

const ROOT = process.cwd();
const ALLOW_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".md", ".txt", ".svg"]);
const DENY = ["node_modules", ".git", ".env", "data", "dist", ".next"];

export function xaiReady() {
  return { ready: !!process.env.XAI_API_KEY, model: process.env.XAI_MODEL || "grok-4.5" };
}

export function filesReady() {
  const gh = githubReady();
  return {
    local: existsSync(join(ROOT, "src")),
    github: gh.ready,
    repo: gh.repo,
    branch: gh.branch,
    cwd: ROOT,
  };
}

function safePath(rel: string) {
  const clean = rel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean || clean.includes("..")) return null;
  const abs = resolve(ROOT, clean);
  const relTo = relative(ROOT, abs);
  if (relTo.startsWith("..") || relTo.split(sep).some((p) => DENY.includes(p) || p.startsWith(".env"))) return null;
  return { abs, rel: clean };
}

function lockedType(rel: string) {
  const ext = extname(rel);
  if (ALLOW_EXT.has(ext)) return false;
  return !(rel.startsWith("src/") || rel.startsWith("public/"));
}

function readLocalFile(rel: string) {
  const p = safePath(rel);
  if (!p || !existsSync(p.abs) || !statSync(p.abs).isFile()) return { error: "File not found" };
  if (lockedType(p.rel)) return { error: "That file type is locked" };
  const buf = readFileSync(p.abs);
  if (buf.length > 120_000) return { error: "File too large to read" };
  return { path: p.rel, content: buf.toString("utf8"), source: "local" as const };
}

function listLocal(rel = "src") {
  const p = safePath(rel || "src");
  if (!p || !existsSync(p.abs)) return { error: "Folder not found" };
  const names = readdirSync(p.abs).slice(0, 80).map((name) => {
    const abs = join(p.abs, name);
    const st = statSync(abs);
    return { name, dir: st.isDirectory(), path: `${p.rel}/${name}`.replace(/\\/g, "/") };
  });
  return { path: p.rel, entries: names, source: "local" as const };
}

function searchLocal(query: string, folder = "src") {
  const p = safePath(folder);
  if (!p) return { error: "Bad folder" };
  if (!existsSync(p.abs)) return { error: "Folder not found" };
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
  return { hits, source: "local" as const };
}

function noSrcHelp() {
  const gh = githubReady();
  if (!gh.ready) {
    return "Live desk has no local src/ checkout (Vercel). Set GITHUB_TOKEN so tools can read the GitHub repo.";
  }
  return `Live desk has no local src/. Tools should use GitHub ${gh.repo}@${gh.branch}.`;
}

export async function readProjectFile(rel: string) {
  const local = readLocalFile(rel);
  if ("content" in local) return local;
  if (!githubReady().ready) return { error: `${local.error}. ${noSrcHelp()}` };
  const p = safePath(rel);
  if (!p) return { error: "Bad path" };
  if (lockedType(p.rel)) return { error: "That file type is locked" };
  try {
    return await repoRead(p.rel);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "GitHub read failed" };
  }
}

export async function listProject(rel = "src") {
  const folder = !rel || rel === "." ? "src" : rel;
  const local = listLocal(folder);
  if (!("error" in local)) return local;
  if (!githubReady().ready) return { error: `${local.error}. ${noSrcHelp()}` };
  const p = safePath(folder);
  if (!p) return { error: "Bad path" };
  try {
    return await repoList(p.rel);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "GitHub list failed" };
  }
}

async function searchProject(query: string, folder = "src") {
  const local = searchLocal(query, folder);
  if (!("error" in local) && local.hits.length) return local;
  if (!githubReady().ready) {
    return { error: `${"error" in local ? local.error : "No hits"}. ${noSrcHelp()}`, hits: [] as { path: string; line: number; text: string }[] };
  }
  const p = safePath(folder || "src");
  if (!p) return { error: "Bad folder" };
  const q = query.toLowerCase();
  try {
    const tree = await repoTree();
    const prefix = p.rel;
    const blobs = tree.filter((it) => {
      if (it.type !== "blob") return false;
      if (!it.path.startsWith(prefix)) return false;
      if (it.size > 200_000) return false;
      const ext = extname(it.path);
      if (!ALLOW_EXT.has(ext) && !it.path.startsWith("src/") && !it.path.startsWith("public/")) return false;
      const parts = it.path.split("/");
      return !parts.some((part) => DENY.includes(part) || part.startsWith(".env"));
    });
    blobs.sort((a, b) => {
      const ah = a.path.toLowerCase().includes(q) ? 0 : 1;
      const bh = b.path.toLowerCase().includes(q) ? 0 : 1;
      return ah - bh || a.path.localeCompare(b.path);
    });
    const hits: { path: string; line: number; text: string }[] = [];
    const take = blobs.slice(0, 28);
    for (let i = 0; i < take.length && hits.length < 40; i += 7) {
      const chunk = take.slice(i, i + 7);
      const texts = await Promise.all(
        chunk.map(async (it) => {
          try {
            return { path: it.path, text: await repoReadBlob(it.sha) };
          } catch {
            return { path: it.path, text: "" };
          }
        })
      );
      for (const file of texts) {
        file.text.split("\n").forEach((text, line) => {
          if (hits.length < 40 && text.toLowerCase().includes(q)) {
            hits.push({ path: file.path, line: line + 1, text: text.trim().slice(0, 180) });
          }
        });
      }
      if (hits.length >= 12 && take[0]?.path.toLowerCase().includes(q)) break;
    }
    return { hits, source: "github" as const, scanned: take.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "GitHub search failed", hits: [] };
  }
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List a folder in cameroncmcnulty/hodl-hotel on GitHub main (same files as production). Example path: src or src/components.",
      parameters: { type: "object", properties: { path: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a source file from the GitHub repo. Example: src/components/AdminCommand.tsx",
      parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_code",
      description: "Search the GitHub repo for a string. Default folder src.",
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

const SYSTEM = `You are Grok, chatting live with hotel staff in the HODL Hotel command center — same as a normal Grok thread: they hit Enter, you reply, they keep talking.

${HOTEL_BRIEF}

Reply in the thread: short, clear sentences, answer first. Keep the conversation going across follow-ups.
If they want a change, inspect the code, then call propose_files with COMPLETE file contents. Do not propose files for questions, explanations, or "what if" talk. Nothing is applied until staff hits Push.
The live desk has no local git checkout. File tools read GitHub. Never tell staff the repo is missing — call list_files on "src" and read_file on real paths like src/components/AdminCommand.tsx.
Staff can attach pictures, video stills, and files. Look at attached images. Use attached source/text as the thing to inspect or apply.`;

type Msg = { role: string; content?: string | null | unknown; tool_calls?: unknown; tool_call_id?: string; name?: string };

async function runTool(name: string, args: Record<string, unknown>) {
  if (name === "list_files") return listProject(String(args.path || "src"));
  if (name === "read_file") return readProjectFile(String(args.path || ""));
  if (name === "search_code") return searchProject(String(args.query || ""), String(args.folder || "src"));
  if (name === "propose_files") return { ok: true, count: Array.isArray(args.files) ? args.files.length : 0 };
  return { error: "Unknown tool" };
}

export function cleanAttachments(raw: unknown): AgentAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: AgentAttachment[] = [];
  for (const item of raw.slice(0, 4)) {
    if (!item || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    const name = String(a.name || "file").slice(0, 180);
    const mime = String(a.mime || "").slice(0, 80);
    const kind = a.kind === "image" || a.kind === "video" ? a.kind : "file";
    const size = Math.max(0, Number(a.size) || 0);
    const note = a.note ? String(a.note).slice(0, 400) : undefined;
    const text = a.text ? String(a.text).slice(0, 80_000) : undefined;
    let dataUrl = typeof a.dataUrl === "string" ? a.dataUrl : undefined;
    if (dataUrl && (!dataUrl.startsWith("data:image/jpeg") && !dataUrl.startsWith("data:image/png") && !dataUrl.startsWith("data:image/jpg"))) {
      dataUrl = undefined;
    }
    if (dataUrl && dataUrl.length > 4_500_000) dataUrl = undefined;
    out.push({ name, mime, kind, size, note, text, dataUrl });
  }
  return out;
}

function userPayload(prompt: string, attachments: AgentAttachment[]) {
  const extras: string[] = [];
  for (const a of attachments) {
    if (a.text) extras.push(`Attached file ${a.name}:\n\`\`\`\n${a.text}\n\`\`\``);
    else if (a.note) extras.push(`Attached ${a.kind} ${a.name}: ${a.note}`);
    else if (a.kind !== "image") extras.push(`Attached ${a.kind}: ${a.name}`);
  }
  const text = [prompt, ...extras].filter(Boolean).join("\n\n") || "Please look at the attached files.";
  const images = attachments.filter((a) => a.dataUrl);
  if (!images.length) return text;
  return [
    { type: "text", text },
    ...images.map((img) => ({ type: "image_url", image_url: { url: img.dataUrl, detail: "high" as const } })),
  ];
}

export async function runGrok(opts: {
  prompt: string;
  history?: { role: "user" | "assistant"; content: string }[];
  mode?: "preview" | "build" | "chat";
  attachments?: AgentAttachment[];
}) {
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
  const mode = opts.mode || "chat";
  const modeNote =
    mode === "preview"
      ? "Inspect and explain. Propose files only if they asked for a change."
      : mode === "build"
        ? "Inspect, then propose_files with complete files for the requested change."
        : "Live chat. Answer in the thread. Propose files only when they ask you to change, fix, or ship something.";
  const files = filesReady();
  const fileNote = files.local
    ? "File tools read the local checkout, then GitHub if needed."
    : files.github
      ? `File tools read GitHub ${files.repo}@${files.branch}. There is no local src/ on this server. list_files("src") works.`
      : "WARNING: no local src/ and no GITHUB_TOKEN — file tools will fail until GitHub is configured.";
  const attachments = cleanAttachments(opts.attachments);
  const patches: AgentPatch[] = [];
  const log: string[] = [];
  if (attachments.length) log.push(`attachments ${attachments.map((a) => a.name).join(", ")}`);
  const messages: Msg[] = [
    { role: "system", content: SYSTEM + `\n${modeNote}\n${fileNote}` },
    ...(opts.history || []).slice(-8),
    { role: "user", content: userPayload(opts.prompt, attachments) },
  ];
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
        const result = await runTool(call.function.name, args);
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

export async function currentFile(rel: string) {
  const got = await readProjectFile(rel);
  return "content" in got ? got.content : "";
}
