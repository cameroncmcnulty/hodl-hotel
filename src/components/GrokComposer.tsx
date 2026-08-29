"use client";

import { clipboardFiles, filesToAttachments, MAX_ATTACH } from "@/lib/attachClient";
import type { AgentAttachment } from "@/lib/types";
import { ClipboardPaste, Paperclip, Send, X } from "lucide-react";
import { useRef, useState, type RefObject } from "react";

export function GrokComposer({
  draft,
  setDraft,
  busy,
  onSend,
  boxRef,
}: {
  draft: string;
  setDraft: (v: string) => void;
  busy: boolean;
  onSend: (text: string, attachments: AgentAttachment[]) => void;
  boxRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const [atts, setAtts] = useState<AgentAttachment[]>([]);
  const [hint, setHint] = useState("");
  const [drop, setDrop] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: File[]) {
    if (!files.length) return;
    setHint("");
    try {
      const { items, error } = await filesToAttachments(files, atts.length);
      if (items.length) setAtts((cur) => [...cur, ...items].slice(0, MAX_ATTACH));
      if (error) setHint(error);
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Could not attach that");
    }
  }

  async function pasteClip() {
    setHint("");
    try {
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        const files: File[] = [];
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith("image/") || type.startsWith("video/")) {
              const blob = await item.getType(type);
              const ext = type.split("/")[1] || "png";
              files.push(new File([blob], `paste.${ext}`, { type }));
            } else if (type === "text/plain") {
              const blob = await item.getType(type);
              const t = (await blob.text()).trim();
              if (t) setDraft(draft ? `${draft}\n${t}` : t);
            }
          }
        }
        if (files.length) await addFiles(files);
        else if (!draft) boxRef.current?.focus();
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      const t = await navigator.clipboard.readText();
      if (t) setDraft(draft ? `${draft}\n${t}` : t);
      else setHint("Click the box and press Ctrl+V to paste a picture or text.");
    } catch {
      setHint("Click the box and press Ctrl+V to paste.");
      boxRef.current?.focus();
    }
  }

  function send() {
    if (busy) return;
    const text = draft.trim();
    if (!text && !atts.length) return;
    onSend(text, atts);
    setAtts([]);
    setHint("");
  }

  return (
    <form
      className="relative border-t border-white/10 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDrop(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrop(true);
      }}
      onDragLeave={() => setDrop(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrop(false);
        addFiles(Array.from(e.dataTransfer.files || []));
      }}
    >
      {drop && (
        <div className="pointer-events-none absolute inset-2 z-10 grid place-items-center rounded-2xl border border-dashed border-mint/50 bg-mint/10 text-sm font-medium text-mint">
          Drop pictures, videos, or files
        </div>
      )}
      {!!atts.length && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {atts.map((a, i) => (
            <span key={`${a.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 py-1 pl-1 pr-2 text-[11px]">
              {a.dataUrl ? <img src={a.dataUrl} alt="" className="h-8 w-8 rounded-lg object-cover" /> : <span className="px-1 text-white/50">{a.kind}</span>}
              <span className="max-w-[9rem] truncate">{a.name}</span>
              <button type="button" className="text-white/40 hover:text-coral" aria-label={`Remove ${a.name}`} onClick={() => setAtts((cur) => cur.filter((_, j) => j !== i))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/5 px-2 py-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,.ts,.tsx,.js,.json,.md,.txt,.css,.svg,.html,.csv"
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        <button type="button" className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Attach" title="Attach picture, video, or file" onClick={() => fileRef.current?.click()}>
          <Paperclip size={16} />
        </button>
        <button type="button" className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Paste" title="Paste from clipboard" onClick={pasteClip}>
          <ClipboardPaste size={16} />
        </button>
        <textarea
          ref={boxRef}
          className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-white/35"
          rows={1}
          value={draft}
          placeholder="Message Grok… paste or attach a file"
          onChange={(e) => {
            setDraft(e.target.value);
            const el = e.currentTarget;
            el.style.height = "0px";
            el.style.height = `${Math.min(160, Math.max(44, el.scrollHeight))}px`;
          }}
          onPaste={(e) => {
            const files = clipboardFiles(e.clipboardData);
            if (!files.length) return;
            e.preventDefault();
            const text = e.clipboardData.getData("text");
            if (text) setDraft(draft ? `${draft}${draft.endsWith("\n") ? "" : "\n"}${text}` : text);
            addFiles(files);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="submit" className="rounded-xl bg-mint p-2 text-ink disabled:opacity-40" disabled={busy || (!draft.trim() && !atts.length)} aria-label="Send">
          <Send size={16} />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-white/35">
        Enter to send · attach a screenshot of the bug if you have one
        {hint ? <span className="text-coral"> · {hint}</span> : null}
      </p>
    </form>
  );
}
