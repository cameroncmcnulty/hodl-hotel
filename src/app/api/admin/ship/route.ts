import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { githubReady, shipFiles } from "@/lib/githubShip";
import { loadDB, log, saveDB } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = loadDB();
  const job = (db.agentJobs || []).find((j) => j.id === body.jobId);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (!job.patches.length) return NextResponse.json({ error: "That job has no files to ship" }, { status: 400 });
  const gh = githubReady();
  if (!gh.ready) {
    return NextResponse.json(
      { error: "Set GITHUB_TOKEN (repo contents:write) and GITHUB_REPO=owner/name to push production." },
      { status: 400 }
    );
  }
  try {
    const message = String(body.message || "").trim() || `desk: ${job.prompt.slice(0, 72)}`;
    const result = await shipFiles(
      job.patches.map((p) => ({ path: p.path, content: p.content })),
      `${message}\n\nPrompt: ${job.prompt.slice(0, 240)}`
    );
    job.status = "shipped";
    job.shippedAt = new Date().toISOString();
    job.shipSha = result.sha;
    job.log.push(`shipped ${result.sha.slice(0, 8)} to ${result.branch}`);
    job.updatedAt = new Date().toISOString();
    log(db, "agent", `${a.user.username} shipped ${job.id} → ${result.sha.slice(0, 8)}`);
    saveDB(db);
    return NextResponse.json({ ok: true, result, job });
  } catch (e) {
    const error = e instanceof Error ? e.message : "Ship failed";
    job.error = error;
    job.log.push(error);
    job.updatedAt = new Date().toISOString();
    saveDB(db);
    return NextResponse.json({ error, job }, { status: 500 });
  }
}
