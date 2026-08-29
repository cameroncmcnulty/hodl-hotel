import type { AgentJob, AgentSegment } from "./types";

export function helpTitle(prompt: string) {
  const t = prompt.replace(/\s+/g, " ").trim();
  if (t.startsWith("HODL HOTEL — staff briefing")) return "Hotel briefing";
  return t.slice(0, 80) || "Grok help";
}

export function ensureSegments(job: AgentJob): AgentSegment[] {
  if (!job.segments) job.segments = [];
  if (!job.segments.length && job.patches?.length) {
    job.segments.push({
      id: job.id,
      prompt: job.prompt,
      reply: job.reply,
      patches: job.patches,
      status: job.status === "shipped" ? "shipped" : "preview",
      at: job.updatedAt || job.createdAt,
      shipSha: job.shipSha,
    });
  }
  return job.segments;
}

export function allHelp(jobs: AgentJob[]) {
  const out: { job: AgentJob; seg: AgentSegment }[] = [];
  for (const job of jobs) {
    for (const seg of ensureSegments(job)) out.push({ job, seg });
  }
  return out.sort((a, b) => (a.seg.at < b.seg.at ? 1 : -1));
}
