import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { extname, join, relative, resolve, sep } from "path";
import { githubReady, repoList, repoMapPaths, repoRead, repoReadBinary, repoReadBlob, repoTree, shipFiles } from "./githubShip";
import { HOTEL_BRIEF } from "./grokBrief";
import type { AgentAttachment, AgentPatch } from "./types";

const ROOT = process.cwd();
const ALLOW_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".json",
  ".md",
  ".txt",
  ".svg",
  ".html",
  ".yml",
  ".yaml",
  ".toml",
  ".csv",
  ".map",
]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const DENY = ["node_modules", ".git", ".env", "data", "dist", ".next"];
const ROOT_FILES = new Set(["package.json", "package-lock.json", "next.config.ts", "next.config.js", "tsconfig.json", "vercel.json", "railway.json", "server.js", "README.md", "nixpacks.toml"]);

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

function allowedRel(rel: string) {
  const parts = rel.split("/");
  if (parts.some((p) => DENY.includes(p) || p.startsWith(".env"))) return false;
  if (rel.startsWith("src/") || rel.startsWith("public/") || rel.startsWith("scripts/")) return true;
  if (ROOT_FILES.has(rel)) return true;
  if (ALLOW_EXT.has(extname(rel)) || IMAGE_EXT.has(extname(rel))) return true;
  return false;
}

function lockedType(rel: string) {
  return !allowedRel(rel);
}

function imageMime(rel: string) {
  const ext = extname(rel).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
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
  const names = readdirSync(p.abs).slice(0, 250).map((name) => {
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
  const p = safePath(rel);
  if (!p) return { error: "Bad path" };
  if (lockedType(p.rel)) return { error: "That path is locked" };
  const ext = extname(p.rel).toLowerCase();
  if (IMAGE_EXT.has(ext)) {
    if (existsSync(p.abs) && statSync(p.abs).isFile()) {
      const buf = readFileSync(p.abs);
      if (buf.length > 1_500_000) return { error: "Image too large" };
      return { path: p.rel, kind: "image" as const, dataUrl: `data:${imageMime(p.rel)};base64,${buf.toString("base64")}`, source: "local" as const };
    }
    if (!githubReady().ready) return { error: `Image not on this server. ${noSrcHelp()}` };
    try {
      const bin = await repoReadBinary(p.rel);
      if ("error" in bin) return bin;
      if (bin.size > 1_500_000) return { error: "Image too large" };
      return { path: bin.path, kind: "image" as const, dataUrl: `data:${imageMime(p.rel)};base64,${bin.base64}`, source: "github" as const };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "GitHub image read failed" };
    }
  }
  const local = readLocalFile(rel);
  if ("content" in local) return local;
  if (!githubReady().ready) return { error: `${local.error}. ${noSrcHelp()}` };
  try {
    return await repoRead(p.rel);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "GitHub read failed" };
  }
}

export async function listProject(rel = "") {
  const folder = !rel || rel === "." || rel === "/" ? "" : rel;
  if (!folder) {
    if (existsSync(join(ROOT, "src"))) {
      const names = readdirSync(ROOT)
        .filter((name) => !DENY.includes(name) && !name.startsWith(".env"))
        .slice(0, 80);
      return {
        path: ".",
        entries: names.map((name) => {
          const abs = join(ROOT, name);
          return { name, dir: existsSync(abs) && statSync(abs).isDirectory(), path: name };
        }),
        source: "local" as const,
      };
    }
    if (!githubReady().ready) return { error: noSrcHelp() };
    try {
      return await repoList("");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "GitHub list failed" };
    }
  }
  const local = listLocal(folder);
  if (!("error" in local)) return { ...local, entries: local.entries.slice(0, 250) };
  if (!githubReady().ready) return { error: `${local.error}. ${noSrcHelp()}` };
  const p = safePath(folder);
  if (!p) return { error: "Bad path" };
  try {
    const listed = await repoList(p.rel);
    return { ...listed, entries: listed.entries.slice(0, 250) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "GitHub list failed" };
  }
}

async function repoMap() {
  if (githubReady().ready) {
    try {
      const paths = (await repoMapPaths()).filter((p) => allowedRel(p));
      return { source: "github" as const, count: paths.length, files: paths };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "repo map failed" };
    }
  }
  return { error: noSrcHelp() };
}

async function openUrl(raw: string) {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { error: "Bad URL" };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { error: "http(s) only" };
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host === "0.0.0.0" || host.startsWith("127.") || host.startsWith("169.254.") || host.startsWith("10.") || host.startsWith("192.168.")) {
    return { error: "That host is blocked" };
  }
  const res = await fetch(u.toString(), { redirect: "follow", headers: { "user-agent": "HODL-Hotel-Desk/1" } });
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 14_000);
  return { url: u.toString(), status: res.status, text };
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
    const take = blobs.slice(0, 90);
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
      name: "repo_map",
      description: "List every allowed file path in the live GitHub hotel repo (src, public art, scripts, config).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List a folder in the live GitHub repo. Empty path lists the repo root. Examples: src, src/lib/game, public/art/avatars, scripts.",
      parameters: { type: "object", properties: { path: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a source or text file from the live repo. Example: src/components/GameClient.tsx",
      parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
    },
  },
  {
    type: "function",
    function: {
      name: "read_image",
      description: "Open a PNG/JPG from the repo (avatars, furniture sprites) so you can actually see it.",
      parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_code",
      description: "Search the live repo for a string. Default folder src. Use folder public or scripts when needed.",
      parameters: { type: "object", properties: { query: { type: "string" }, folder: { type: "string" } }, required: ["query"] },
    },
  },
  {
    type: "function",
    function: {
      name: "open_url",
      description: "Fetch a public https page and return its text.",
      parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    },
  },
  {
    type: "function",
    function: {
      name: "check_live",
      description: "Hit the live hotel (hodlhotel.app health, home, play, join) and return status codes.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_files",
      description: "Write complete file replacements for a bugfix. These are pushed to production automatically after you finish.",
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

const SYSTEM = `You keep HODL Hotel online. Staff types what's wrong (or hits check). You inspect the live repo, patch the bug, and the desk pushes it to GitHub main so Vercel deploys.

${HOTEL_BRIEF}

Reply in short sentences. Answer first. Use tools. If you change files, propose_files with complete contents — production push happens automatically. Do not ask staff to copy files or hit Push. Screenshots in the chat are bug reports: look at them.`;

type Msg = { role: string; content?: string | null | unknown; tool_calls?: unknown; tool_call_id?: string; name?: string };

async function runTool(name: string, args: Record<string, unknown>) {
  if (name === "repo_map") return repoMap();
  if (name === "list_files") return listProject(String(args.path || ""));
  if (name === "read_file" || name === "read_image") return readProjectFile(String(args.path || ""));
  if (name === "search_code") return searchProject(String(args.query || ""), String(args.folder || "src"));
  if (name === "open_url") return openUrl(String(args.url || ""));
  if (name === "check_live") return checkLive();
  if (name === "propose_files") return { ok: true, count: Array.isArray(args.files) ? args.files.length : 0 };
  return { error: "Unknown tool" };
}

async function checkLive() {
  const urls = ["https://hodlhotel.app/api/health", "https://hodlhotel.app/", "https://hodlhotel.app/play", "https://hodlhotel.app/join"];
  const live: { url: string; status?: number; ms?: number; ok?: boolean; error?: string }[] = [];
  for (const url of urls) {
    const t = Date.now();
    try {
      const r = await fetch(url, { redirect: "follow" });
      live.push({ url, status: r.status, ms: Date.now() - t, ok: r.ok });
    } catch (e) {
      live.push({ url, ms: Date.now() - t, error: e instanceof Error ? e.message : "fetch failed" });
    }
  }
  return { live };
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
  const files = filesReady();
  const fileNote = files.github
    ? `GitHub ${files.repo}@${files.branch} is the live game. After propose_files, the desk pushes to main.`
    : "GITHUB_TOKEN is missing — you can inspect only if src exists locally; you cannot push.";
  const attachments = cleanAttachments(opts.attachments);
  const patches: AgentPatch[] = [];
  const log: string[] = [];
  if (attachments.length) log.push(`attachments ${attachments.map((a) => a.name).join(", ")}`);
  const messages: Msg[] = [
    { role: "system", content: SYSTEM + `\n${fileNote}` },
    ...(opts.history || []).slice(-16),
    { role: "user", content: userPayload(opts.prompt, attachments) },
  ];
  let reply = "";
  for (let i = 0; i < 16; i++) {
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
        const vision: { path: string; url: string }[] = [];
        let payload: unknown = result;
        if (result && typeof result === "object" && "kind" in result && (result as { kind?: string }).kind === "image" && "dataUrl" in result) {
          const img = result as { path?: string; dataUrl?: string };
          if (img.dataUrl) vision.push({ path: img.path || String(args.path || ""), url: img.dataUrl });
          payload = { path: img.path, kind: "image", loaded: true };
        }
        messages.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: JSON.stringify(payload).slice(0, 24_000) });
        if (vision.length) {
          messages.push({
            role: "user",
            content: [
              { type: "text", text: `Repo image you opened:\n${vision.map((v) => v.path).join("\n")}` },
              ...vision.slice(0, 3).map((v) => ({ type: "image_url", image_url: { url: v.url, detail: "high" as const } })),
            ],
          });
        }
      }
      continue;
    }
    reply = msg.content || "";
    break;
  }
  const plan = reply.split("\n").slice(0, 24).join("\n");
  const unique = new Map<string, AgentPatch>();
  for (const p of patches) unique.set(p.path, p);
  const finalPatches = [...unique.values()];
  let shipped: { sha: string; url: string } | undefined;
  if (finalPatches.length && githubReady().ready) {
    try {
      const result = await shipFiles(
        finalPatches.map((p) => ({ path: p.path, content: p.content })),
        `desk grok fix: ${opts.prompt.replace(/\s+/g, " ").slice(0, 72)}`
      );
      shipped = { sha: result.sha, url: result.url };
      log.push(`shipped ${result.sha.slice(0, 8)}`);
      reply = `${reply || "Fix is in."}\n\nPushed to production ${result.sha.slice(0, 8)}. Vercel will deploy hodlhotel.app.`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "push failed";
      log.push(`ship failed ${msg}`);
      reply = `${reply || "I have a patch."}\n\nCould not push: ${msg}`;
    }
  }
  return { reply, plan, patches: finalPatches, log, shipped };
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
