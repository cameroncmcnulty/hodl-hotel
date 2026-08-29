const API = "https://api.github.com";

function repo() {
  return process.env.GITHUB_REPO || "cameroncmcnulty/hodl-hotel";
}

function branch() {
  return process.env.GITHUB_BRANCH || "main";
}

function token() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
}

export function githubReady() {
  return { ready: !!token(), repo: repo(), branch: branch() };
}

export function githubRepoName() {
  return repo();
}

export function githubBranchName() {
  return branch();
}

type RepoNode = { path: string; type: "blob" | "tree"; sha: string; size: number };

const g = globalThis as typeof globalThis & { __hodlTree?: { at: number; key: string; items: RepoNode[] } };

export async function repoTree(): Promise<RepoNode[]> {
  const key = `${repo()}@${branch()}`;
  const now = Date.now();
  if (g.__hodlTree && g.__hodlTree.key === key && now - g.__hodlTree.at < 45_000) return g.__hodlTree.items;
  const [owner, name] = repo().split("/");
  if (!owner || !name) throw new Error("GITHUB_REPO must be owner/name");
  const ref = (await gh(`/repos/${owner}/${name}/git/ref/heads/${branch()}`)) as { object: { sha: string } };
  const commit = (await gh(`/repos/${owner}/${name}/git/commits/${ref.object.sha}`)) as { tree: { sha: string } };
  const tree = (await gh(`/repos/${owner}/${name}/git/trees/${commit.tree.sha}?recursive=1`)) as {
    tree?: { path?: string; type?: string; sha?: string; size?: number }[];
  };
  const items: RepoNode[] = (tree.tree || [])
    .filter((t) => t.path && t.sha)
    .map((t) => ({
      path: t.path!,
      type: t.type === "tree" ? "tree" : "blob",
      sha: t.sha!,
      size: t.size || 0,
    }));
  g.__hodlTree = { at: now, key, items };
  return items;
}

export async function repoList(rel: string) {
  const prefix = rel.replace(/^\/+|\/+$/g, "");
  const items = await repoTree();
  const seen = new Set<string>();
  const entries: { name: string; dir: boolean; path: string }[] = [];
  for (const it of items) {
    if (prefix && it.path !== prefix && !it.path.startsWith(`${prefix}/`)) continue;
    if (it.path === prefix) continue;
    const rest = prefix ? it.path.slice(prefix.length + 1) : it.path;
    const name = rest.split("/")[0];
    if (!name || seen.has(name)) continue;
    seen.add(name);
    entries.push({ name, dir: rest.includes("/") || it.type === "tree", path: prefix ? `${prefix}/${name}` : name });
    if (entries.length >= 250) break;
  }
  return { path: prefix || ".", entries, source: "github" as const, repo: repo(), branch: branch() };
}

export async function repoRead(rel: string) {
  const [owner, name] = repo().split("/");
  const encoded = rel
    .split("/")
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join("/");
  const json = (await gh(`/repos/${owner}/${name}/contents/${encoded}?ref=${encodeURIComponent(branch())}`)) as {
    type?: string;
    content?: string;
    path?: string;
  };
  if (json.type === "dir") return { error: "That path is a folder" };
  if (!json.content) return { error: "File not found on GitHub" };
  const content = Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
  return { path: json.path || rel, content, source: "github" as const };
}

export async function repoReadBlob(sha: string) {
  const [owner, name] = repo().split("/");
  const json = (await gh(`/repos/${owner}/${name}/git/blobs/${sha}`)) as { content?: string };
  if (!json.content) return "";
  return Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
}

export async function repoReadBinary(rel: string) {
  const [owner, name] = repo().split("/");
  const encoded = rel
    .split("/")
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join("/");
  const json = (await gh(`/repos/${owner}/${name}/contents/${encoded}?ref=${encodeURIComponent(branch())}`)) as {
    type?: string;
    content?: string;
    path?: string;
    size?: number;
  };
  if (json.type === "dir") return { error: "That path is a folder" };
  if (!json.content) return { error: "File not found on GitHub" };
  return { path: json.path || rel, base64: json.content.replace(/\n/g, ""), size: json.size || 0 };
}

export async function repoMapPaths() {
  const items = await repoTree();
  return items.filter((it) => it.type === "blob").map((it) => it.path);
}

async function gh(path: string, init: RequestInit = {}) {
  const t = token();
  if (!t) throw new Error("GITHUB_TOKEN is not set");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${t}`,
      "x-github-api-version": "2022-11-28",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = typeof json === "object" && json && "message" in json ? String((json as { message: string }).message) : text.slice(0, 240);
    throw new Error(`GitHub ${res.status}: ${msg}`);
  }
  return json as Record<string, unknown>;
}

export async function shipFiles(files: { path: string; content: string }[], message: string) {
  if (!files.length) throw new Error("Nothing to ship");
  const [owner, name] = repo().split("/");
  if (!owner || !name) throw new Error("GITHUB_REPO must be owner/name");
  const br = branch();
  const ref = (await gh(`/repos/${owner}/${name}/git/ref/heads/${br}`)) as { object: { sha: string } };
  const parent = ref.object.sha;
  const commit = (await gh(`/repos/${owner}/${name}/git/commits/${parent}`)) as { tree: { sha: string } };
  const blobs = [];
  for (const f of files) {
    const blob = (await gh(`/repos/${owner}/${name}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
    })) as { sha: string };
    blobs.push({ path: f.path.replace(/^\/+/, ""), mode: "100644", type: "blob", sha: blob.sha });
  }
  const tree = (await gh(`/repos/${owner}/${name}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: blobs }),
  })) as { sha: string };
  const made = (await gh(`/repos/${owner}/${name}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [parent],
    }),
  })) as { sha: string; html_url?: string };
  await gh(`/repos/${owner}/${name}/git/refs/heads/${br}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: made.sha }),
  });
  return { sha: made.sha, url: made.html_url || `https://github.com/${owner}/${name}/commit/${made.sha}`, repo: repo(), branch: br };
}
