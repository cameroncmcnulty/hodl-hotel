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
  if (!prompt) return NextResponse.json({ error: "Write a message first" }, { status: 400 });
  const mode = op === "preview" ? "preview" : op === "build" ? "build" : "chat";
  const now = new Date().toISOString();
  let job = db.agentJobs.find((j) => j.id === body.jobId);
  if (!job) {
    job = {
      id: crypto.randomUUID(),
      prompt,
      mode,
      status: "running",
      plan: "",
      reply: "",
      patches: [],
      messages: [],
      log: [],
      createdAt: now,
      updatedAt: now,
    };
    db.agentJobs.unshift(job);
    db.agentJobs = db.agentJobs.slice(0, 40);
  }
  if (!job.messages) job.messages = [];
  job.messages.push({ role: "user", content: prompt, at: now });
  job.prompt = prompt;
  job.status = "running";
  job.error = undefined;
  job.updatedAt = now;
  saveDB(db);

  try {
    const history = job.messages
      .slice(0, -1)
      .filter((m) => m.content)
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));
    const out = await runGrok({ prompt, mode, history });
    job.reply = out.reply;
    job.plan = out.plan || out.reply;
    if (out.patches.length) job.patches = out.patches;
    job.log = [...(job.log || []), ...out.log];
    job.messages.push({
      role: "assistant",
      content: out.reply || (out.patches.length ? "I have file changes ready. Review them, then hit Ship when you want them live." : "Done."),
      at: new Date().toISOString(),
    });
    job.status = out.patches.length ? "preview" : "ready";
    job.updatedAt = new Date().toISOString();
    log(db, "agent", `${a.user.username} chat: ${prompt.slice(0, 80)}`);
    saveDB(db);
    return NextResponse.json({ job, grok: xaiReady(), github: githubReady() });
  } catch (e) {
    job.status = "error";
    job.error = e instanceof Error ? e.message : "Grok failed";
    job.messages.push({ role: "assistant", content: job.error, at: new Date().toISOString() });
    job.updatedAt = new Date().toISOString();
    saveDB(db);
    return NextResponse.json({ error: job.error, job }, { status: 500 });
  }
}
