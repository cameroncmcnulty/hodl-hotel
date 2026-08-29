import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { githubReady } from "@/lib/githubShip";
import { applyLocal, currentFile, filesReady, runGrok, xaiReady } from "@/lib/grokAgent";
import { ensureSegments } from "@/lib/grokHelp";
import { loadDB, log, saveDB } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 401 });
  const db = loadDB();
  return NextResponse.json({
    grok: xaiReady(),
    github: githubReady(),
    files: filesReady(),
    jobs: (db.agentJobs || []).slice(0, 40).map((j) => {
      ensureSegments(j);
      return j;
    }),
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
    const content = await currentFile(String(body.path || ""));
    return NextResponse.json({ path: body.path, content });
  }

  if (op === "apply-local") {
    const job = db.agentJobs.find((j) => j.id === body.jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    ensureSegments(job);
    const seg = body.segmentId ? job.segments?.find((s) => s.id === body.segmentId) : null;
    const patches = seg?.patches?.length ? seg.patches : job.patches;
    if (!patches.length) return NextResponse.json({ error: "No patches on that job" }, { status: 400 });
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_APPLY !== "1") {
      return NextResponse.json({ error: "Local apply is off in production. Use Push." }, { status: 400 });
    }
    const wrote = applyLocal(patches);
    job.status = "ready";
    if (seg) seg.status = "ready";
    job.log.push(`applied locally: ${wrote.join(", ")}`);
    job.updatedAt = new Date().toISOString();
    log(db, "agent", `${a.user.username} applied ${job.id} locally`);
    saveDB(db);
    return NextResponse.json({ ok: true, wrote, job });
  }

  if (op === "delete-job") {
    const before = db.agentJobs.length;
    db.agentJobs = db.agentJobs.filter((j) => j.id !== body.jobId);
    if (db.agentJobs.length === before) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    log(db, "agent", `${a.user.username} deleted chat ${String(body.jobId).slice(0, 8)}`);
    saveDB(db);
    return NextResponse.json({ ok: true, jobs: db.agentJobs.slice(0, 40) });
  }

  if (op === "delete-segment") {
    const job = db.agentJobs.find((j) => j.id === body.jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    ensureSegments(job);
    const sid = String(body.segmentId || "");
    job.segments = (job.segments || []).filter((s) => s.id !== sid);
    if (job.messages) job.messages = job.messages.filter((m) => m.segmentId !== sid);
    const last = job.segments[job.segments.length - 1];
    job.patches = last?.patches || [];
    job.status = last?.status || "ready";
    job.shipSha = last?.shipSha;
    job.updatedAt = new Date().toISOString();
    log(db, "agent", `${a.user.username} deleted Grok help ${sid.slice(0, 8)}`);
    saveDB(db);
    return NextResponse.json({ ok: true, job });
  }

  if (op === "delete-message") {
    const job = db.agentJobs.find((j) => j.id === body.jobId);
    if (!job?.messages) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    const idx = Number(body.index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= job.messages.length) {
      return NextResponse.json({ error: "Message not found" }, { status: 400 });
    }
    const removed = job.messages.splice(idx, 1)[0];
    if (removed.role === "user" && job.messages[idx]?.role === "assistant") {
      const asst = job.messages.splice(idx, 1)[0];
      if (asst.segmentId) job.segments = (job.segments || []).filter((s) => s.id !== asst.segmentId);
    }
    if (removed.segmentId) job.segments = (job.segments || []).filter((s) => s.id !== removed.segmentId);
    const last = (job.segments || [])[(job.segments || []).length - 1];
    job.patches = last?.patches || [];
    job.prompt = [...(job.messages || [])].reverse().find((m) => m.role === "user")?.content || job.prompt;
    job.updatedAt = new Date().toISOString();
    saveDB(db);
    return NextResponse.json({ ok: true, job });
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
      segments: [],
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
    ensureSegments(job);
    let segmentId: string | undefined;
    if (out.patches.length) {
      const segment = {
        id: crypto.randomUUID(),
        prompt,
        reply: out.reply,
        patches: out.patches,
        status: "preview" as const,
        at: new Date().toISOString(),
      };
      job.segments = [...(job.segments || []), segment];
      job.patches = out.patches;
      segmentId = segment.id;
    }
    job.log = [...(job.log || []), ...out.log];
    job.messages.push({
      role: "assistant",
      content: out.reply || (out.patches.length ? "I have file changes ready. Preview, then Push when you want them live." : "Done."),
      at: new Date().toISOString(),
      segmentId,
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
