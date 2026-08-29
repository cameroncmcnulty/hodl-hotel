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
