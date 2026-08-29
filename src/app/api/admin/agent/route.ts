import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { githubReady } from "@/lib/githubShip";
import { applyLocal, currentFile, runGrok, xaiReady } from "@/lib/grokAgent";
import { loadDB, log, saveDB } from "@/lib/store";
import type { AgentJob } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 401 });
  const db = loadDB();
  return NextResponse.json({
    grok: xaiReady(),
    github: githubReady(),
    jobs: (db.agentJobs || []).slice(0, 24),
    localApply: process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCAL_APPLY === "1",
  });
}

export async function POST(req: Request) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const op = String(body.op || "preview");
  const db = loadDB();
  if (!db.agentJobs) db.agentJobs = [];

  if (op === "file") {
    const content = currentFile(String(body.path || ""));
    return NextResponse.json({ path: body.path, content });
  }

  if (op === "apply-local") {
    const job = db.agentJobs.find((j) => j.id === body.jobId);
    if (!job?.patches.length) return NextResponse.json({ error: "No patches on that job" }, { status: 400 });
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_APPLY !== "1") {
      return NextResponse.json({ error: "Local apply is off in production. Use Ship." }, { status: 400 });
    }
    const wrote = applyLocal(job.patches);
    job.status = "ready";
    job.log.push(`applied locally: ${wrote.join(", ")}`);
    job.updatedAt = new Date().toISOString();
    log(db, "agent", `${a.user.username} applied ${job.id} locally`);
    saveDB(db);
    return NextResponse.json({ ok: true, wrote, job });
  }

  const prompt = String(body.prompt || "").trim();
  if (!prompt) return NextResponse.json({ error: "Write a prompt first" }, { status: 400 });
  const mode = op === "build" ? "build" : "preview";
  const job: AgentJob = {
    id: crypto.randomUUID(),
    prompt,
    mode,
    status: "running",
    plan: "",
    reply: "",
    patches: [],
    log: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.agentJobs.unshift(job);
  db.agentJobs = db.agentJobs.slice(0, 40);
  saveDB(db);

  try {
    const out = await runGrok({
      prompt,
      mode,
      history: Array.isArray(body.history) ? body.history : [],
    });
    job.reply = out.reply;
    job.plan = out.plan || out.reply;
    job.patches = out.patches;
    job.log = out.log;
    job.status = out.patches.length ? "preview" : "ready";
    job.updatedAt = new Date().toISOString();
    log(db, "agent", `${a.user.username} ${mode}: ${prompt.slice(0, 80)}`);
    saveDB(db);
    return NextResponse.json({ job, grok: xaiReady(), github: githubReady() });
  } catch (e) {
    job.status = "error";
    job.error = e instanceof Error ? e.message : "Grok failed";
    job.updatedAt = new Date().toISOString();
    saveDB(db);
    return NextResponse.json({ error: job.error, job }, { status: 500 });
  }
}
