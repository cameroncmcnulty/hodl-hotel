"use client";

import { FurnIcon } from "@/components/FurnIcon";
import { LayoutPreview } from "@/components/LayoutPreview";
import { CATALOG, furn } from "@/lib/catalog";
import { CATS } from "@/lib/catalog";
import { FREE_LAYOUT_IDS, PREMIUM_LAYOUTS, USER_LAYOUTS } from "@/lib/layouts";
import { COIN_PACKS } from "@/lib/constants";
import { drawRoom, tileAt } from "@/lib/game/draw";
import { iso } from "@/lib/game/iso";
import { loadSprites, spriteCache } from "@/lib/game/sprites";
import type { Ad, ChatLine, Occupant, Placed, Room } from "@/lib/types";
import {
  Backpack,
  Flag,
  Handshake,
  Map,
  MessageCircle,
  MessagesSquare,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Me = {
  id: string;
  username: string;
  coins: number;
  figure: Occupant["figure"];
  backpack: ({ uid: string; catalogId: string; pairId?: string; nftUrl?: string } | null)[];
  friends: string[];
  role: string;
  ownedRoomIds: string[];
  ownedLayoutIds?: string[];
};

type Snap = {
  room: Room;
  occupants: Occupant[];
  chat: ChatLine[];
  ads: Ad[];
  error?: string;
};

export function GameClient({ me, homeRoomId }: { me: Me; homeRoomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snap, setSnap] = useState<Snap | null>(null);
  const [meState, setMe] = useState(me);
  const [roomId, setRoomId] = useState(homeRoomId);
  const [panel, setPanel] = useState<string | null>(null);
  const [chat, setChat] = useState("");
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; furn?: Placed; user?: Occupant } | null>(null);
  const [place, setPlace] = useState<{ uid: string; catalogId: string; rot: 0 | 1 | 2 | 3 } | null>(null);
  const [status, setStatus] = useState("");
  const [nav, setNav] = useState<{ popular: Room[]; publicAreas: Room[]; history: Room[]; events: { title: string; roomId: string; desc: string }[] } | null>(null);
  const [social, setSocial] = useState<any>(null);
  const [shopCat, setShopCat] = useState("seating");
  const [ads, setAds] = useState<any>(null);
  const [dmText, setDmText] = useState("");
  const [dmUser, setDmUser] = useState<string | null>(null);
  const [lockPass, setLockPass] = useState("");
  const [joinTarget, setJoinTarget] = useState<string | null>(null);
  const [trade, setTrade] = useState<any>(null);
  const tRef = useRef(0);
  const cam = useRef({ x: 400, y: 200 });
  const spritesRef = useRef<Record<string, HTMLCanvasElement>>({});

  const furnKey = (snap?.room.furniture || []).map((f) => f.catalogId).join(",");
  useEffect(() => {
    const ids = furnKey ? furnKey.split(",") : [];
    loadSprites(ids).then((s) => {
      spritesRef.current = s;
    });
  }, [snap?.room?.id, furnKey]);

  const act = useCallback(async (body: { type: string; [k: string]: unknown }) => {
    const res = await fetch("/api/game", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (j.error && body.type !== "ping") setStatus(j.error);
    if (j.room) {
      setSnap(j);
      setRoomId(j.room.id);
    }
    return j;
  }, []);

  useEffect(() => {
    act({ type: "join", roomId: homeRoomId });
    return () => {
      fetch("/api/game", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "leave" }) });
    };
  }, [act, homeRoomId]);

  useEffect(() => {
    if (!snap?.room) return;
    const id = setInterval(() => {
      act({ type: "ping" });
    }, 900);
    return () => clearInterval(id);
  }, [act, snap?.room?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === " ") {
        e.preventDefault();
        act({ type: "dance" });
      }
      const you = snap?.occupants.find((o) => o.userId === meState.id);
      if (you) {
        const step: Record<string, [number, number]> = {
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
          w: [0, -1],
          a: [-1, 0],
          s: [0, 1],
          d: [1, 0],
        };
        const delta = step[e.key] || step[e.key.toLowerCase()];
        if (delta) {
          e.preventDefault();
          act({ type: "walk", x: Math.round(you.x) + delta[0], y: Math.round(you.y) + delta[1] });
        }
      }
      if ((e.key === "r" || e.key === "R") && place) {
        setPlace({ ...place, rot: (((place.rot + 1) % 4) as 0 | 1 | 2 | 3) });
      }
      if (e.key === "Escape") {
        setPlace(null);
        setPanel(null);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act, place, snap, meState.id]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      tRef.current += 0.016;
      const c = canvasRef.current;
      const s = snap;
      if (c && s) {
        const ctx = c.getContext("2d");
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const w = c.clientWidth;
          const h = c.clientHeight;
          if (c.width !== w * dpr) {
            c.width = w * dpr;
            c.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = "#7ec8ea";
          ctx.fillRect(0, 0, w, h);
          const you = s.occupants.find((o) => o.userId === meState.id);
          if (you) {
            const p = iso(you.x + 0.5, you.y + 0.5);
            cam.current.x += (w / 2 - p.sx - cam.current.x) * 0.12;
            cam.current.y += (h / 2 - p.sy - cam.current.y) * 0.12;
          }
          const gdef = place ? furn(place.catalogId) : undefined;
          drawRoom(ctx, {
            room: s.room,
            occupants: s.occupants,
            ads: s.ads,
            cam: cam.current,
            t: tRef.current,
            hover: hover || undefined,
            ghost: gdef && hover ? { def: gdef, x: hover.x, y: hover.y, rot: place!.rot, ok: true } : undefined,
            sprites: spritesRef.current || spriteCache(),
          });
          if (s.room.id === "public-shill-zone") {
            const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.4, 400);
            const hue = (tRef.current * 40) % 360;
            g.addColorStop(0, `hsla(${hue},90%,60%,0.18)`);
            g.addColorStop(1, "transparent");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [snap, hover, place, meState.id]);

  function localTile(e: React.MouseEvent) {
    const r = canvasRef.current!.getBoundingClientRect();
    return tileAt(cam.current, e.clientX - r.left, e.clientY - r.top);
  }

  async function joinRoom(id: string, password?: string) {
    const j = await act({ type: "join", roomId: id, password });
    if (j.error === "Room is locked") {
      setJoinTarget(id);
      setLockPass("");
      setPanel("lock");
    } else setPanel(null);
  }

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2800);
    return () => clearTimeout(t);
  }, [status]);

  async function refreshMe() {
    const j = await fetch("/api/auth/me").then((r) => r.json());
    if (j.user) setMe((prev) => ({ ...prev, ...j.user }));
  }

  async function openNav() {
    setPanel("nav");
    setNav(await fetch("/api/nav").then((r) => r.json()));
  }
  async function openSocial() {
    setPanel(panel === "friends" ? "friends" : "friends");
    setSocial(await fetch("/api/social").then((r) => r.json()));
  }
  async function openMsgs() {
    setPanel("msgs");
    setSocial(await fetch("/api/social").then((r) => r.json()));
  }
  async function openAds() {
    setPanel("ads");
    setAds(await fetch("/api/ads").then((r) => r.json()));
  }

  async function buyPlan(id: string) {
    const res = await fetch("/api/shop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ layoutId: id }) });
    const j = await res.json();
    if (j.error) setStatus(j.error);
    else {
      setStatus(`Unlocked ${j.plan.name}`);
      refreshMe();
    }
  }

  async function applyPlan(id: string) {
    const j = await act({ type: "setLayout", layoutId: id });
    if (j.error) setStatus(j.error);
    else setStatus("Floor plan applied");
    refreshMe();
  }

  function ownsPlan(id: string) {
    return FREE_LAYOUT_IDS.includes(id) || !!meState.ownedLayoutIds?.includes(id);
  }

  async function buy(id: string) {
    const res = await fetch("/api/shop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ catalogId: id }) });
    const j = await res.json();
    if (j.error) setStatus(j.error);
    else {
      setStatus(`Bought ${j.item.name}`);
      refreshMe();
    }
  }

  async function buyCoins(packId: string) {
    const info = await fetch("/api/solana").then((r) => r.json());
    const pack = COIN_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    if (!info.treasury) {
      if (location.hostname === "localhost") {
        const j = await fetch("/api/solana", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "faucet" }) }).then((r) => r.json());
        if (j.user) setMe({ ...meState, coins: j.user.coins });
        setStatus("Local faucet: +500 coins (treasury wallet not set yet)");
        return;
      }
      setStatus("Treasury wallet not configured. Ask the front desk.");
      return;
    }
    const provider = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; signAndSendTransaction: (t: unknown) => Promise<{ signature: string }> } }).solana;
    if (!provider?.isPhantom) {
      setStatus("Install Phantom (or another Solana wallet) to buy coins.");
      return;
    }
    try {
      const { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } = await import("@solana/web3.js");
      const conn = new Connection(info.network === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com");
      const pk = await provider.connect();
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(pk.publicKey.toString()),
          toPubkey: new PublicKey(info.treasury),
          lamports: Math.round(pack.sol * LAMPORTS_PER_SOL),
        })
      );
      tx.feePayer = new PublicKey(pk.publicKey.toString());
      tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
      const { signature } = await provider.signAndSendTransaction(tx);
      const j = await fetch("/api/solana", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId, sig: signature, wallet: pk.publicKey.toString() }),
      }).then((r) => r.json());
      if (j.error) setStatus(j.error);
      else {
        setMe({ ...meState, coins: j.user.coins });
        setStatus(`+${pack.coins} coins`);
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Wallet cancelled");
    }
  }

  const you = snap?.occupants.find((o) => o.userId === meState.id);

  return (
    <div
      className="relative flex h-[100dvh] flex-col overflow-hidden"
      style={{
        background:
          "repeating-linear-gradient(45deg,#1c4a5c 0 10px,#163e4e 10px 20px)",
      }}
    >
      <div className="z-10 flex items-center justify-between border-b-4 border-[#c48a1a] bg-gradient-to-r from-[#f0b429] to-[#e08932] px-3 py-1 text-sm font-bold text-[#2a1a08]">
        <span className="font-display text-lg">HODL Hotel</span>
        <span>
          {snap?.room.name} · {snap?.occupants.length || 0} in room
        </span>
        <span className="flex items-center gap-2">
          <button className="rounded bg-[#24143d] px-2 py-0.5 text-white" onClick={() => setPanel(panel === "coins" ? null : "coins")}>
            {meState.coins}c
          </button>
          {meState.role === "admin" && (
            <a className="underline" href="/admin">
              Desk
            </a>
          )}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              location.href = "/";
            }}
          >
            Logout
          </button>
        </span>
      </div>
      <div className="relative min-h-0 flex-1 border-x-8 border-[#f0b429] bg-[#7ec8ea]">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-pointer"
        style={{ imageRendering: "pixelated" }}
        onMouseMove={(e) => setHover(localTile(e))}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!snap) return;
          const t = localTile(e);
          const furnHit = snap.room.furniture.find((p) => p.x === t.x && p.y === t.y);
          const userHit = snap.occupants.find((o) => Math.round(o.x) === t.x && Math.round(o.y) === t.y && o.userId !== meState.id);
          setMenu({ x: e.clientX, y: e.clientY, furn: furnHit, user: userHit });
        }}
        onClick={async (e) => {
          setMenu(null);
          const t = localTile(e);
          if (place) {
            const j = await act({ type: "place", uid: place.uid, x: t.x, y: t.y, rot: place.rot });
            if (!j.error) {
              setPlace(null);
              refreshMe();
            }
            return;
          }
          act({ type: "walk", x: t.x, y: t.y });
        }}
      />
      </div>

      <div className="z-10 flex items-center gap-2 border-t-4 border-[#c48a1a] bg-[#2a2218] px-3 py-2">
      <div className="flex gap-1">
        {(
          [
            { id: "nav", Icon: Map, fn: openNav },
            { id: "pack", Icon: Backpack, fn: () => setPanel(panel === "pack" ? null : "pack") },
            { id: "shop", Icon: ShoppingBag, fn: () => setPanel(panel === "shop" ? null : "shop") },
            { id: "chat", Icon: MessageCircle, fn: () => setPanel(panel === "chat" ? null : "chat") },
            { id: "friends", Icon: Users, fn: openSocial },
            { id: "msgs", Icon: MessagesSquare, fn: openMsgs },
            { id: "ads", Icon: Flag, fn: openAds },
          ] as const
        ).map(({ id, Icon, fn }) => (
          <button
            key={id}
            className={`grid h-11 w-11 place-items-center rounded-md border-2 border-[#7a5a20] bg-[#f0b429] text-[#24143d] ${panel === id ? "ring-2 ring-mint" : ""}`}
            onClick={fn}
            title={id}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
      <form
        className="flex min-w-0 flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (chat.trim()) act({ type: "chat", text: chat });
          setChat("");
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-md border-2 border-[#7a5a20] bg-[#f7efe2] px-3 py-2 text-sm text-[#24143d] outline-none"
          placeholder={`Say something, ${meState.username}…`}
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          maxLength={80}
        />
        <button className="rounded-md bg-[#14F195] px-4 font-bold text-[#24143d]">Send</button>
      </form>
      </div>

      {status && (
        <div className="absolute left-1/2 top-20 -translate-x-1/2 rounded-xl bg-black/70 px-4 py-2 text-sm" onClick={() => setStatus("")}>
          {status}
        </div>
      )}

      {panel === "pack" && (
        <Hud title="Backpack — 30 slots" onClose={() => setPanel(null)}>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {meState.backpack.map((slot, i) => (
              <button
                key={i}
                onClick={() => slot && setPlace({ uid: slot.uid, catalogId: slot.catalogId, rot: 0 })}
                className={`flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border text-[9px] leading-tight ${slot ? "border-mint/40 bg-[#8fd4f2]/20" : "border-white/10 bg-black/30"}`}
              >
                {slot ? (
                  <>
                    <FurnIcon id={slot.catalogId} className="h-12 w-full" />
                    <span className="px-0.5 pb-0.5 text-center">{furn(slot.catalogId)?.name}</span>
                  </>
                ) : null}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/50">Click an item, then click the floor to place. R rotates in place mode (keyboard).</p>
        </Hud>
      )}

      {panel === "shop" && (
        <Hud title="Furniture shop" onClose={() => setPanel(null)} wide>
          <div className="mb-3 flex flex-wrap gap-1">
            {[...CATS, "plans"].map((c) => (
              <button key={c} className={`rounded-full px-2 py-1 text-xs ${shopCat === c ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setShopCat(c)}>
                {c}
              </button>
            ))}
          </div>
          {shopCat === "plans" ? (
            <div className="grid max-h-[52vh] grid-cols-2 gap-2 overflow-auto">
              {[...USER_LAYOUTS, ...PREMIUM_LAYOUTS].map((l) => (
                <div key={l.id} className="rounded-xl border border-white/10 bg-black/25 p-2">
                  <LayoutPreview layoutId={l.id} />
                  <div className="mt-1 font-semibold leading-tight">
                    {l.name} {l.premium && <span className="text-gold">gold</span>}
                  </div>
                  <div className="text-xs text-white/60">{l.blurb}</div>
                  {ownsPlan(l.id) ? (
                    <button className="btn-sol mt-2 w-full text-xs" onClick={() => applyPlan(l.id)}>
                      Use in this room
                    </button>
                  ) : (
                    <button className="btn-sol mt-2 w-full text-xs" onClick={() => buyPlan(l.id)}>
                      {l.price} coins
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
          <div className="grid max-h-[52vh] grid-cols-2 gap-2 overflow-auto md:grid-cols-3">
            {CATALOG.filter((f) => f.category === shopCat && f.id !== "ad_board").map((f) => (
              <div key={f.id} className="rounded-xl border border-white/10 bg-black/25 p-2">
                <div className="overflow-hidden rounded-lg border border-white/10 bg-[#7ec8ea]">
                  <FurnIcon id={f.id} className="h-28 w-full" />
                </div>
                <div className="mt-1.5 font-semibold leading-tight">
                  {f.name} {f.rare && <span className="text-gold">rare</span>}
                </div>
                <div className="text-xs text-white/60">{f.desc}</div>
                <button className="btn-sol mt-2 w-full text-xs" onClick={() => buy(f.id)}>
                  {f.price === 0 ? "Free" : `${f.price} coins`}
                </button>
              </div>
            ))}
          </div>
          )}
        </Hud>
      )}

      {panel === "coins" && (
        <Hud title="Coin desk — pay with Solana" onClose={() => setPanel(null)}>
          <p className="mb-3 text-xs text-white/60">Virtual coins have no cash value. 18+ only. Payments go to the hotel treasury wallet.</p>
          <div className="grid gap-2">
            {COIN_PACKS.map((p) => (
              <button key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left hover:border-mint" onClick={() => buyCoins(p.id)}>
                <span>
                  <b>{p.name}</b>
                  <div className="text-xs text-white/50">{p.tag}</div>
                </span>
                <span className="text-mint">
                  {p.coins}c · {p.sol} SOL
                </span>
              </button>
            ))}
          </div>
        </Hud>
      )}

      {panel === "nav" && nav && (
        <Hud title="Navigator" onClose={() => setPanel(null)} wide>
          <Tabs
            tabs={[
              {
                id: "pop",
                label: "Popular Rooms",
                node: (
                  <RoomList rooms={nav.popular} onJoin={joinRoom} />
                ),
              },
              {
                id: "pub",
                label: "Public Areas",
                node: (
                  <div>
                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                      {[
                        ["public-lobby", "Grand Lobby", "/art/lobby.jpg"],
                        ["public-pool", "Roof Pool", "/art/pool.jpg"],
                        ["public-shill-zone", "SHILL ZONE", "/art/shill-zone.jpg"],
                        ["public-cook-room", "The Cook Room", "/art/cook-room.jpg"],
                        ["public-arcade", "Signal Arcade", "/art/arcade.jpg"],
                      ].map(([id, name, src]) => (
                        <button key={id} className="overflow-hidden rounded-xl border border-white/10 text-left" onClick={() => joinRoom(id)}>
                          <img src={src} alt={name} className="h-24 w-full object-cover" />
                          <div className="p-2 text-sm font-semibold">{name}</div>
                        </button>
                      ))}
                    </div>
                    <RoomList rooms={nav.publicAreas} onJoin={joinRoom} />
                  </div>
                ),
              },
              { id: "hist", label: "Room History", node: <RoomList rooms={nav.history} onJoin={joinRoom} /> },
            ]}
          />
          {nav.events?.length > 0 && (
            <div className="mt-3 text-xs text-mint">
              Event: {nav.events[0].title} — {nav.events[0].desc}
            </div>
          )}
          <button className="btn-ink mt-3 text-xs" onClick={() => joinRoom(homeRoomId)}>
            My room
          </button>
        </Hud>
      )}

      {panel === "chat" && (
        <Hud title="Room chat" onClose={() => setPanel(null)}>
          <div className="max-h-64 overflow-auto text-sm">
            {(snap?.chat || []).map((c) => (
              <div key={c.id} className="py-0.5">
                <b className={c.kind === "roll" ? "text-gold" : "text-mint"}>{c.username}</b>: {c.text}
              </div>
            ))}
          </div>
        </Hud>
      )}

      {panel === "friends" && social && (
        <Hud title="Friends" onClose={() => setPanel(null)}>
          <FriendBox social={social} onJoin={joinRoom} onRefresh={openSocial} onMsg={(id: string) => { setDmUser(id); setPanel("msgs"); }} onTrade={async (id: string) => {
            const j = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "open", userId: id, roomId }) }).then((r) => r.json());
            setTrade(j.trade);
            setPanel("trade");
          }} />
        </Hud>
      )}

      {panel === "msgs" && social && (
        <Hud title="Messages" onClose={() => setPanel(null)}>
          <div className="grid gap-2">
            {(social.threads || []).map((t: any) => (
              <button key={t.id} className="rounded-xl border border-white/10 p-2 text-left" onClick={() => setDmUser(t.other?.id)}>
                <b>{t.other?.username}</b> {t.unread > 0 && <span className="text-coral">({t.unread})</span>}
                <div className="text-xs text-white/50">{t.last?.text}</div>
              </button>
            ))}
            {dmUser && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch("/api/social", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "dm", userId: dmUser, text: dmText }) });
                  setDmText("");
                  openMsgs();
                }}
              >
                <input className="field" value={dmText} onChange={(e) => setDmText(e.target.value)} placeholder="Private message" />
              </form>
            )}
          </div>
        </Hud>
      )}

      {panel === "ads" && ads && (
        <Hud title="Rent a board" onClose={() => setPanel(null)}>
          <p className="mb-2 text-xs text-white/60">SHILL ZONE and The Cook Room boards. Upload a 16:9 image. Hotel can take it down.</p>
          {ads.spots.map((s: any) => (
            <AdRow key={s.id} spot={s} plans={ads.plans} onDone={() => { refreshMe(); openAds(); }} />
          ))}
        </Hud>
      )}

      {panel === "lock" && joinTarget && (
        <Hud title="Locked room" onClose={() => setPanel(null)}>
          <input className="field" placeholder="Password" value={lockPass} onChange={(e) => setLockPass(e.target.value)} />
          <button className="btn-sol mt-2" onClick={() => joinRoom(joinTarget, lockPass)}>
            Knock
          </button>
        </Hud>
      )}

      {panel === "trade" && trade && (
        <Hud title="Trade" onClose={() => setPanel(null)}>
          <p className="text-xs text-white/60">Offer backpack items. Both ready, then both confirm.</p>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {meState.backpack.map((s, i) => (
              <button
                key={i}
                className="h-10 rounded border border-white/10 text-[9px]"
                onClick={async () => {
                  if (!s) return;
                  const uids = [...(trade.a === meState.id ? trade.aItems : trade.bItems).map((x: any) => x.uid), s.uid].slice(0, 6);
                  const j = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "offer", tradeId: trade.id, uids }) }).then((r) => r.json());
                  setTrade(j.trade);
                }}
              >
                {s ? furn(s.catalogId)?.name : ""}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button className="btn-ink" onClick={async () => setTrade((await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "ready", tradeId: trade.id }) }).then((r) => r.json())).trade)}>
              Ready
            </button>
            <button className="btn-sol" onClick={async () => { const j = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "confirm", tradeId: trade.id }) }).then((r) => r.json()); setTrade(j.trade); refreshMe(); }}>
              Confirm
            </button>
          </div>
        </Hud>
      )}

      {menu && (
        <div className="absolute z-50 rounded-xl border border-white/15 bg-night p-2 text-sm shadow-xl" style={{ left: menu.x, top: menu.y }}>
          {menu.furn && (
            <>
              <div className="px-2 pb-1 text-xs text-white/50">{furn(menu.furn.catalogId)?.name}</div>
              {furn(menu.furn.catalogId)?.use === "dice" && <Btn onClick={() => { act({ type: "use", uid: menu.furn!.uid }); setMenu(null); }}>Roll</Btn>}
              {furn(menu.furn.catalogId)?.sittable && <Btn onClick={() => { act({ type: "use", uid: menu.furn!.uid }); setMenu(null); }}>Sit</Btn>}
              <Btn onClick={() => { act({ type: "rotate", uid: menu.furn!.uid }); setMenu(null); }}>Rotate</Btn>
              <Btn onClick={() => { act({ type: "pickup", uid: menu.furn!.uid }).then(refreshMe); setMenu(null); }}>Pick up</Btn>
              {furn(menu.furn.catalogId)?.use === "frame" && (
                <Btn onClick={async () => {
                  const w = prompt("Wallet address that holds the NFT (or leave blank to use linked wallet)");
                  const n = await fetch("/api/nfts" + (w ? `?wallet=${w}` : "")).then((r) => r.json());
                  const pick = n.nfts?.[0];
                  if (pick) act({ type: "setFrame", uid: menu.furn!.uid, nftMint: pick.mint, nftUrl: pick.image });
                  setMenu(null);
                }}>Hang NFT</Btn>
              )}
            </>
          )}
          {menu.user && (
            <>
              <div className="px-2 pb-1">{menu.user.username}</div>
              <Btn onClick={async () => { await fetch("/api/social", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "request", userId: menu.user!.userId }) }); setStatus("Request sent"); setMenu(null); }}>Add friend</Btn>
              <Btn onClick={async () => { const j = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "open", userId: menu.user!.userId, roomId }) }).then((r) => r.json()); setTrade(j.trade); setPanel("trade"); setMenu(null); }}><Handshake size={12} /> Trade</Btn>
              <Btn onClick={async () => { const reason = prompt("Why report?") || "report"; await fetch("/api/social", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "report", userId: menu.user!.userId, reason }) }); setMenu(null); }}>Report</Btn>
            </>
          )}
          {!menu.furn && !menu.user && <div className="px-2 text-white/50">Nothing here</div>}
        </div>
      )}

      {you?.dance && <div className="pointer-events-none absolute bottom-28 right-6 text-2xl">💃</div>}

      <p className="pointer-events-none absolute bottom-[4.5rem] left-3 text-[10px] text-white/70">Click or WASD to walk · right-click items · Space to dance · R rotates</p>
    </div>
  );
}

function Hud({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`absolute left-1/2 top-24 z-40 max-h-[70vh] -translate-x-1/2 overflow-auto p-4 panel ${wide ? "w-[min(720px,94vw)]" : "w-[min(420px,94vw)]"}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg">{title}</h2>
        <button onClick={onClose}><X size={16} /></button>
      </div>
      {children}
    </div>
  );
}

function Btn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button className="block w-full rounded-lg px-3 py-1 text-left hover:bg-white/10" onClick={onClick}>
      {children}
    </button>
  );
}

function RoomList({ rooms, onJoin }: { rooms: any[]; onJoin: (id: string) => void }) {
  if (!rooms?.length) return <p className="text-sm text-white/50">Empty.</p>;
  return (
    <div className="grid gap-1">
      {rooms.map((r) => (
        <button key={r.id} className="flex justify-between rounded-lg px-2 py-1 text-left hover:bg-white/10" onClick={() => onJoin(r.id)}>
          <span>{r.name}</span>
          <span className="text-xs text-mint">{r.users ?? 0}/{r.maxUsers ?? 25}</span>
        </button>
      ))}
    </div>
  );
}

function Tabs({ tabs }: { tabs: { id: string; label: string; node: React.ReactNode }[] }) {
  const [id, setId] = useState(tabs[0].id);
  return (
    <div>
      <div className="mb-3 flex gap-1">
        {tabs.map((t) => (
          <button key={t.id} className={`rounded-full px-3 py-1 text-xs ${id === t.id ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setId(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === id)?.node}
    </div>
  );
}

function FriendBox({ social, onJoin, onRefresh, onMsg, onTrade }: any) {
  const [name, setName] = useState("");
  return (
    <div className="grid gap-3 text-sm">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/social", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "request", username: name }) });
          setName("");
          onRefresh();
        }}
        className="flex gap-2"
      >
        <input className="field" placeholder="Add by username" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-sol">Add</button>
      </form>
      <div>
        <div className="text-xs uppercase text-white/40">Requests</div>
        {(social.incoming || []).map((f: any) => (
          <div key={f.id} className="flex justify-between py-1">
            {f.username}
            <button className="text-mint" onClick={async () => { await fetch("/api/social", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "accept", userId: f.id }) }); onRefresh(); }}>
              Accept
            </button>
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs uppercase text-white/40">Friends</div>
        {(social.friends || []).map((f: any) => (
          <div key={f.id} className="flex items-center justify-between py-1">
            <span>
              {f.username} <span className={f.online ? "text-mint" : "text-white/30"}>{f.online ? "online" : "offline"}</span>
            </span>
            <span className="flex gap-2 text-xs">
              {f.online && f.roomId && <button onClick={() => onJoin(f.roomId)}>Visit</button>}
              <button onClick={() => onMsg(f.id)}>DM</button>
              <button onClick={() => onTrade(f.id)}>Trade</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdRow({ spot, plans, onDone }: any) {
  const [plan, setPlan] = useState("day");
  return (
    <div className="mb-2 rounded-xl border border-white/10 p-2 text-sm">
      <div className="flex justify-between">
        <b>{spot.room} · {spot.label}</b>
        <span className="text-xs text-white/50">{spot.live ? "Occupied" : "Open"}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {plans.map((p: any) => (
          <label key={p.id} className="text-xs">
            <input type="radio" checked={plan === p.id} onChange={() => setPlan(p.id)} /> {p.label} ({p.coins}c)
          </label>
        ))}
        <input
          type="file"
          accept="image/*"
          className="text-xs"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const img = await fileToData(file);
            const res = await fetch("/api/ads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slotId: spot.id, plan, image: img }) });
            const j = await res.json();
            if (j.error) alert(j.error);
            else onDone();
          }}
        />
      </div>
    </div>
  );
}

function fileToData(file: File) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 512, 256);
      resolve(c.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}
