"use client";

import { FigureEditor } from "@/components/CharacterPreview";
import { FurnIcon } from "@/components/FurnIcon";
import { LayoutPreview } from "@/components/LayoutPreview";
import { CATALOG, CATS, furn, RARITY_LABEL, RARITY_TONE, type Rarity } from "@/lib/catalog";
import { FREE_LAYOUT_IDS, layoutById, PREMIUM_LAYOUTS, USER_LAYOUTS, walkable } from "@/lib/layouts";
import { COIN_PACKS } from "@/lib/constants";
import { drawRoom, tileAt } from "@/lib/game/draw";
import { astar, canPlaceFurn, furnAt } from "@/lib/game/path";
import { iso } from "@/lib/game/iso";
import { face, motAt, setPath, tickMot, type Mot } from "@/lib/game/motion";
import { clampFigure, loadAvatars } from "@/lib/game/avatar";
import { loadSprites, spriteCache } from "@/lib/game/sprites";
import { api, authInit, clearClientToken } from "@/lib/clientAuth";
import type { Ad, ChatLine, Figure, Occupant, Placed, Room } from "@/lib/types";
import {
  Backpack,
  Flag,
  Handshake,
  Map,
  MessageCircle,
  MessagesSquare,
  ShoppingBag,
  UserRound,
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
  const [menu, setMenu] = useState<{ x: number; y: number; tile?: { x: number; y: number }; furn?: Placed; user?: Occupant } | null>(null);
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
  const [look, setLook] = useState<Figure>(() => clampFigure(me.figure));
  const tRef = useRef(0);
  const cam = useRef({ x: 400, y: 200 });
  const zoomRef = useRef(1);
  const pinchRef = useRef<{ dist: number; z: number } | null>(null);
  const holdRef = useRef<{ t: number; x: number; y: number } | null>(null);
  const skipClickRef = useRef(false);
  const lastTouchAt = useRef(0);
  const spritesRef = useRef<Record<string, HTMLCanvasElement>>({});
  const motions = useRef<Record<string, Mot>>({});
  const lastTs = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const keys = useRef(new Set<string>());
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const meIdRef = useRef(meState.id);
  meIdRef.current = meState.id;
  const menuRef = useRef(menu);
  menuRef.current = menu;

  const furnKey = (snap?.room.furniture || []).map((f) => f.catalogId).join(",");
  useEffect(() => {
    const ids = furnKey ? furnKey.split(",") : [];
    loadSprites(ids).then((s) => {
      spritesRef.current = s;
    });
  }, [snap?.room?.id, furnKey]);

  useEffect(() => {
    loadAvatars();
  }, []);

  useEffect(() => {
    if (panel !== "shop") return;
    const ids = CATALOG.filter((f) => f.category === shopCat && f.id !== "ad_board").map((f) => f.id);
    loadSprites(ids).then((s) => {
      spritesRef.current = { ...spritesRef.current, ...s };
    });
  }, [panel, shopCat]);

  const act = useCallback(async (body: { type: string; [k: string]: unknown }) => {
    const { res, j } = await api("/api/game", { method: "POST", body: JSON.stringify(body) });
    if (res.status === 401 || /sign in|session expired/i.test(String(j.error || ""))) {
      if (body.type === "ping") return j;
      const me = await api("/api/auth/me");
      if (me.j?.user) {
        setMe((prev) => ({ ...prev, ...me.j.user }));
        if (body.type === "join") {
          const retry = await api("/api/game", { method: "POST", body: JSON.stringify(body) });
          if (retry.j?.room) {
            setSnap(retry.j);
            setRoomId(retry.j.room.id);
            return retry.j;
          }
        }
        setStatus("Couldn't save that — try once more.");
        return j;
      }
      setStatus("Session expired — sending you to login");
      setTimeout(() => {
        clearClientToken();
        location.href = "/login";
      }, 900);
      return j;
    }
    if (j.error && body.type !== "ping") setStatus(j.error);
    if (j.room) {
      if (body.type === "join") motions.current = {};
      setSnap(j);
      setRoomId(j.room.id);
      for (const o of j.occupants as Occupant[]) {
        let m = motions.current[o.userId];
        if (!m) {
          m = motAt(o.x, o.y, o.dir);
          motions.current[o.userId] = m;
        }
        if (o.userId === me.id && m.queue.length) {
          /* keep optimistic local path */
        } else if (o.path?.length) setPath(m, o.path);
        else if (o.userId !== me.id && Math.hypot(o.x - m.x, o.y - m.y) > 0.45) {
          setPath(m, [{ x: o.x, y: o.y }]);
        }
        if (o.userId !== me.id && !m.queue.length) m.dir = o.dir;
      }
    }
    return j;
  }, []);

  const walkTo = useCallback(
    (tx: number, ty: number) => {
      const s = snapRef.current;
      if (!s?.room) {
        act({ type: "walk", x: tx, y: ty });
        return;
      }
      const m = motions.current[meState.id] || motAt(tx, ty);
      motions.current[meState.id] = m;
      const sx = Math.round(m.x);
      const sy = Math.round(m.y);
      if (sx === tx && sy === ty) {
        face(m, tx, ty);
        act({ type: "walk", x: tx, y: ty });
        return;
      }
      const path = astar(s.room.layoutId, s.room.furniture, sx, sy, tx, ty);
      if (path.length) setPath(m, path);
      else face(m, tx, ty);
      act({ type: "walk", x: tx, y: ty });
    },
    [act, meState.id]
  );

  useEffect(() => {
    act({ type: "join", roomId: homeRoomId });
    return () => {
      fetch("/api/game", authInit({ method: "POST", body: JSON.stringify({ type: "leave" }) }));
    };
  }, [act, homeRoomId]);

  useEffect(() => {
    if (!snap?.room) return;
    const id = setInterval(() => {
      const m = motions.current[meState.id];
      act({ type: "ping", x: m?.x, y: m?.y, dir: m?.dir });
    }, 280);
    return () => clearInterval(id);
  }, [act, snap?.room?.id]);

  useEffect(() => {
    const stepOf = (k: string): [number, number] | null => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        a: [-1, 0],
        s: [0, 1],
        d: [1, 0],
      };
      return map[k] || map[k.toLowerCase()] || null;
    };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === " ") {
        e.preventDefault();
        act({ type: "dance" });
        return;
      }
      const delta = stepOf(e.key);
      if (delta) {
        e.preventDefault();
        keys.current.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
        if (e.repeat) return;
        const m = motions.current[meState.id];
        if (m?.moving) return;
        const x = Math.round(m?.x ?? 0);
        const y = Math.round(m?.y ?? 0);
        walkTo(x + delta[0], y + delta[1]);
        return;
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
    const onUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key);
      keys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [act, place, meState.id, walkTo]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(48, now - lastTs.current);
      lastTs.current = now;
      tRef.current += dt / 1000;
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
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = "#050508";
          ctx.fillRect(0, 0, w, h);
          const z = zoomRef.current;
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.scale(z, z);
          ctx.translate(-w / 2, -h / 2);
          const meMot = motions.current[meState.id];
          const held = keys.current;
          let hx = 0;
          let hy = 0;
          if (held.has("w") || held.has("ArrowUp")) hy -= 1;
          if (held.has("s") || held.has("ArrowDown")) hy += 1;
          if (held.has("a") || held.has("ArrowLeft")) hx -= 1;
          if (held.has("d") || held.has("ArrowRight")) hx += 1;
          if (meMot && (hx || hy)) {
            const layout = layoutById(s.room.layoutId);
            if (!meMot.moving) {
              const nx = Math.round(meMot.x) + hx;
              const ny = Math.round(meMot.y) + hy;
              if (walkable(layout, nx, ny) || furn(furnAt(s.room.furniture, nx, ny)?.catalogId || "")?.sittable) walkTo(nx, ny);
              else face(meMot, nx, ny);
            } else if (meMot.queue.length <= 1) {
              const last = meMot.queue[meMot.queue.length - 1] || { x: Math.round(meMot.x), y: Math.round(meMot.y) };
              const rem = meMot.queue.length ? Math.hypot(meMot.queue[0].x - meMot.x, meMot.queue[0].y - meMot.y) : 0;
              if (rem < 0.42) {
                const nx = last.x + hx;
                const ny = last.y + hy;
                if (
                  (walkable(layout, nx, ny) || furn(furnAt(s.room.furniture, nx, ny)?.catalogId || "")?.sittable) &&
                  !meMot.queue.some((p) => p.x === nx && p.y === ny)
                ) {
                  meMot.queue.push({ x: nx, y: ny });
                }
              }
            }
          }
          for (const o of s.occupants) {
            if (!motions.current[o.userId]) motions.current[o.userId] = motAt(o.x, o.y, o.dir);
            tickMot(motions.current[o.userId], dt);
          }
          const vis = s.occupants.map((o) => {
            const m = motions.current[o.userId];
            if (!m) return o;
            const tx = Math.round(m.x);
            const ty = Math.round(m.y);
            const seat = !m.moving ? furnAt(s.room.furniture, tx, ty) : undefined;
            const sitting = !!(seat && furn(seat.catalogId)?.sittable);
            return {
              ...o,
              x: m.x,
              y: m.y,
              dir: sitting ? seat!.rot : m.dir,
              moving: m.moving,
              dist: m.dist,
              sitUid: sitting ? seat!.uid : undefined,
            };
          });
          const you = vis.find((o) => o.userId === meState.id);
          if (you) {
            const p = iso(you.x + 0.5, you.y + 0.5);
            cam.current.x += (w / 2 - p.sx - cam.current.x) * 0.2;
            cam.current.y += (h / 2 - p.sy - cam.current.y) * 0.2;
          }
          const gdef = place ? furn(place.catalogId) : undefined;
          drawRoom(ctx, {
            room: s.room,
            occupants: vis,
            ads: s.ads,
            cam: cam.current,
            t: tRef.current,
            hover: hover || undefined,
            ghost:
              gdef && hover
                ? {
                    def: gdef,
                    x: hover.x,
                    y: hover.y,
                    rot: place!.rot,
                    ok: canPlaceFurn(s.room, place!.catalogId, hover.x, hover.y, place!.rot),
                  }
                : undefined,
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
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [snap, hover, place, meState.id, walkTo]);

  function localTile(e: { clientX: number; clientY: number }) {
    const r = canvasRef.current!.getBoundingClientRect();
    const layout = snapRef.current ? layoutById(snapRef.current.room.layoutId) : undefined;
    return tileAt(
      { ...cam.current, z: zoomRef.current },
      e.clientX - r.left,
      e.clientY - r.top,
      layout,
      { w: r.width, h: r.height }
    );
  }

  function clampZoom(z: number) {
    return Math.max(0.55, Math.min(2.6, z));
  }

  function zoomAt(mx: number, my: number, nextZ: number) {
    const c = canvasRef.current;
    if (!c) {
      zoomRef.current = clampZoom(nextZ);
      return;
    }
    const r = c.getBoundingClientRect();
    const z0 = zoomRef.current;
    const z1 = clampZoom(nextZ);
    if (z0 === z1) return;
    const cx = r.width / 2;
    const cy = r.height / 2;
    cam.current.x += (mx - cx) * (1 / z1 - 1 / z0);
    cam.current.y += (my - cy) * (1 / z1 - 1 / z0);
    zoomRef.current = z1;
  }

  function openFurnMenu(clientX: number, clientY: number) {
    const s = snapRef.current;
    if (!s) return;
    const meId = meIdRef.current;
    const t = localTile({ clientX, clientY });
    const furnHit = furnAt(s.room.furniture, t.x, t.y);
    const userHit = s.occupants.find((o) => Math.round(o.x) === t.x && Math.round(o.y) === t.y && o.userId !== meId);
    const ownRoom = s.room.ownerId === meId;
    const ownFurn = !!(furnHit && ownRoom && furnHit.ownerId === meId);
    if (furnHit && !ownFurn) {
      setStatus("You can only pick up, rotate, or use furniture in your own suite.");
      if (userHit) setMenu({ x: clientX, y: clientY, tile: t, user: userHit });
      else setMenu(null);
      return;
    }
    if (!ownFurn && !userHit) {
      setMenu(null);
      return;
    }
    setMenu({ x: clientX, y: clientY, tile: t, furn: ownFurn ? furnHit : undefined, user: userHit });
  }

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const HOLD_MS = 2000;
    const pinchDist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const clearHold = () => {
      if (holdRef.current) {
        window.clearTimeout(holdRef.current.t);
        holdRef.current = null;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, zoomRef.current * Math.exp(-e.deltaY * 0.0016));
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        clearHold();
        skipClickRef.current = true;
        pinchRef.current = { dist: pinchDist(e.touches[0], e.touches[1]), z: zoomRef.current };
        return;
      }
      lastTouchAt.current = Date.now();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        holdRef.current = {
          t: window.setTimeout(() => {
            skipClickRef.current = true;
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);
            openFurnMenu(t.clientX, t.clientY);
            holdRef.current = null;
          }, HOLD_MS),
          x: t.clientX,
          y: t.clientY,
        };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 && pinchRef.current) {
        e.preventDefault();
        skipClickRef.current = true;
        const d = pinchDist(e.touches[0], e.touches[1]);
        const r = c.getBoundingClientRect();
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        zoomAt(mx, my, pinchRef.current.z * (d / Math.max(1, pinchRef.current.dist)));
        return;
      }
      const hold = holdRef.current;
      if (hold && e.touches[0]) {
        const dx = e.touches[0].clientX - hold.x;
        const dy = e.touches[0].clientY - hold.y;
        if (dx * dx + dy * dy > 140) clearHold();
      }
    };
    const onTouchEnd = () => {
      pinchRef.current = null;
      clearHold();
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    c.addEventListener("touchstart", onTouchStart, { passive: false });
    c.addEventListener("touchmove", onTouchMove, { passive: false });
    c.addEventListener("touchend", onTouchEnd);
    c.addEventListener("touchcancel", onTouchEnd);
    return () => {
      clearHold();
      c.removeEventListener("wheel", onWheel);
      c.removeEventListener("touchstart", onTouchStart);
      c.removeEventListener("touchmove", onTouchMove);
      c.removeEventListener("touchend", onTouchEnd);
      c.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  async function joinRoom(id: string, password?: string) {
    const j = await act({ type: "join", roomId: id, password });
    if (j.error === "Room is locked") {
      setJoinTarget(id);
      setLockPass("");
      setPanel("lock");
    } else setPanel(null);
    return j;
  }

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 4500);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (!place) return;
    if (snap?.room && snap.room.ownerId !== meState.id) {
      setPlace(null);
      setStatus("You can only place furniture in your own suite.");
    }
  }, [place, snap?.room?.ownerId, meState.id]);

  async function refreshMe() {
    const { j } = await api("/api/auth/me");
    if (j.user) setMe((prev) => ({ ...prev, ...j.user }));
    return j.user as Me | null;
  }

  async function openNav() {
    setPanel("nav");
    setNav(await fetch("/api/nav", { credentials: "include" }).then((r) => r.json()));
  }
  async function openSocial() {
    setPanel(panel === "friends" ? "friends" : "friends");
    setSocial(await fetch("/api/social", { credentials: "include" }).then((r) => r.json()));
  }
  async function openMsgs() {
    setPanel("msgs");
    setSocial(await fetch("/api/social", { credentials: "include" }).then((r) => r.json()));
  }
  async function openAds() {
    setPanel("ads");
    setAds(await fetch("/api/ads", { credentials: "include" }).then((r) => r.json()));
  }

  async function buyPlan(id: string) {
    const { j } = await api("/api/shop", { method: "POST", body: JSON.stringify({ layoutId: id }) });
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
    const def = furn(id);
    if (def && meState.coins < def.price) {
      setStatus(`Need ${def.price.toLocaleString()} coins — you have ${meState.coins.toLocaleString()}`);
      return;
    }
    const { res, j } = await api("/api/shop", { method: "POST", body: JSON.stringify({ catalogId: id }) });
    if (res.status === 401 || /sign in|session expired/i.test(String(j.error || ""))) {
      const me = await api("/api/auth/me");
      if (me.j?.user) {
        setMe((prev) => ({ ...prev, ...me.j.user }));
        setStatus("Shop hiccup — tap Buy again.");
        return;
      }
      setStatus("Session expired — sending you to login");
      setTimeout(() => {
        clearClientToken();
        location.href = "/login";
      }, 900);
      return;
    }
    if (j.error) {
      setStatus(j.error);
      return;
    }
    if (j.user) setMe((prev) => ({ ...prev, ...j.user }));
    setStatus(j.message || `Purchase successful — ${j.item?.name || "item"} is in your backpack.`);
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
              await fetch("/api/auth/logout", authInit({ method: "POST" }));
              clearClientToken();
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
        className="h-full w-full cursor-pointer touch-none select-none"
        style={{ imageRendering: "pixelated", touchAction: "none" }}
        onMouseMove={(e) => setHover(localTile(e))}
        onContextMenu={(e) => {
          e.preventDefault();
          if (Date.now() - lastTouchAt.current < 2500) return;
          skipClickRef.current = true;
          openFurnMenu(e.clientX, e.clientY);
        }}
        onClick={async (e) => {
          if (skipClickRef.current) {
            skipClickRef.current = false;
            return;
          }
          if (menuRef.current) {
            setMenu(null);
            return;
          }
          const t = localTile(e);
          if (place) {
            if (snap?.room.ownerId !== meState.id) {
              setStatus("You can only place furniture in your own suite.");
              setPlace(null);
              return;
            }
            const j = await act({ type: "place", uid: place.uid, x: t.x, y: t.y, rot: place.rot });
            if (!j.error) {
              setPlace(null);
              setStatus("Placed. Hold ~2s or right-click it to pick up, rotate, sit, or use.");
              refreshMe();
            }
            return;
          }
          walkTo(t.x, t.y);
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
            { id: "look", Icon: UserRound, fn: () => { setLook(clampFigure(meState.figure)); setPanel(panel === "look" ? null : "look"); } },
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
        <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl bg-black/80 px-4 py-2 text-sm shadow-lg" onClick={() => setStatus("")}>
          {status}
        </div>
      )}

      {place && (
        <div className="absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-white/15 bg-night/95 px-3 py-2 text-sm">
          <span className="max-w-[40vw] truncate text-white/80">Placing {furn(place.catalogId)?.name}</span>
          <button
            className="rounded bg-white/10 px-2 py-1"
            onClick={() => setPlace({ ...place, rot: (((place.rot + 3) % 4) as 0 | 1 | 2 | 3) })}
          >
            ↶
          </button>
          <button
            className="rounded bg-white/10 px-2 py-1"
            onClick={() => setPlace({ ...place, rot: (((place.rot + 1) % 4) as 0 | 1 | 2 | 3) })}
          >
            ↷
          </button>
          <button className="rounded bg-coral/80 px-2 py-1 text-white" onClick={() => setPlace(null)}>
            Cancel
          </button>
        </div>
      )}

      {panel === "look" && (
        <Hud title="Look" onClose={() => setPanel(null)} wide>
          <FigureEditor figure={look} onChange={setLook} />
          <button
            className="btn-sol mt-3 w-full"
            onClick={async () => {
              const j = await act({ type: "look", figure: look });
              if (!j.error) {
                setMe((p) => ({ ...p, figure: look }));
                setPanel(null);
                setStatus("Look saved");
              }
            }}
          >
            Save look
          </button>
        </Hud>
      )}

      {panel === "pack" && (
        <Hud title="Backpack — 30 slots" onClose={() => setPanel(null)}>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {meState.backpack.map((slot, i) => (
              <button
                key={i}
                onClick={async () => {
                  if (!slot) return;
                  if (snap?.room.ownerId !== meState.id) {
                    setStatus("You can only place furniture in your suite — heading there.");
                    const j = await joinRoom(homeRoomId);
                    if (j?.room?.ownerId !== meState.id) {
                      setStatus("You can only put furniture down in your own suite.");
                      return;
                    }
                  }
                  setPlace({ uid: slot.uid, catalogId: slot.catalogId, rot: 0 });
                  setPanel(null);
                  setStatus("Rotate, then tap a tile in your suite to place.");
                }}
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
          <p className="mt-2 text-xs text-white/50">Place only in your suite. Right-click (or hold ~2s on phone) your pieces to pick up, rotate, sit, or use them.</p>
        </Hud>
      )}

      {panel === "shop" && (
        <Hud title="Furniture shop" onClose={() => setPanel(null)} wide>
          <div className="mb-2 flex flex-wrap gap-1">
            {[...CATS, "plans"].map((c) => (
              <button key={c} className={`rounded-full px-2 py-1 text-xs capitalize ${shopCat === c ? "bg-mint text-ink" : "bg-white/10"}`} onClick={() => setShopCat(c)}>
                {c}
              </button>
            ))}
          </div>
          {shopCat !== "plans" && (
            <div className="mb-2 flex flex-wrap gap-1 text-[9px] font-bold uppercase tracking-wide">
              {(["uncommon", "rare", "elite", "gold", "crypto"] as Rarity[]).map((r) => (
                <span key={r} className={`rounded-full px-1.5 py-0.5 ${RARITY_TONE[r]}`}>
                  {RARITY_LABEL[r]}
                </span>
              ))}
            </div>
          )}
          {shopCat === "plans" ? (
            <div className="grid max-h-[56vh] grid-cols-2 gap-2 overflow-auto">
              {[...USER_LAYOUTS, ...PREMIUM_LAYOUTS].map((l) => (
                <div key={l.id} className="rounded-xl border border-white/10 bg-black/25 p-2">
                  <LayoutPreview layoutId={l.id} />
                  <div className="mt-1 font-semibold leading-tight">
                    {l.name} {l.premium && <span className="text-gold">gold</span>}
                  </div>
                  <div className="text-xs text-white/60">{l.blurb}</div>
                  {ownsPlan(l.id) ? (
                    <button
                      className="btn-sol mt-2 w-full text-xs"
                      onClick={() => {
                        if (snap?.room.ownerId !== meState.id) {
                          setStatus("You can only change the floor plan in your own suite.");
                          return;
                        }
                        applyPlan(l.id);
                      }}
                    >
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
          <div className="grid max-h-[56vh] grid-cols-2 gap-2 overflow-auto md:grid-cols-3">
            {CATALOG.filter((f) => f.category === shopCat && f.id !== "ad_board")
              .slice()
              .sort((a, b) => a.price - b.price)
              .map((f) => {
                const rarity = (f.rarity || (f.rare ? "rare" : "common")) as Rarity;
                return (
              <div key={f.id} className="rounded-xl border border-white/10 bg-black/25 p-2">
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#7ec8ea]">
                  <FurnIcon id={f.id} className="h-28 w-full" />
                  {rarity !== "common" && (
                    <span className={`absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${RARITY_TONE[rarity]}`}>
                      {RARITY_LABEL[rarity]}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 font-semibold leading-tight">{f.name}</div>
                <div className="text-[10px] text-white/45">
                  {f.w}×{f.d} tile{f.w * f.d > 1 ? "s" : ""} · {f.sittable ? "sit" : f.walkable ? "walk" : f.slot === "wall" ? "wall" : "place"}
                </div>
                <div className="text-xs text-white/60">{f.desc}</div>
                <button className="btn-sol mt-2 w-full text-xs" onClick={() => buy(f.id)}>
                  {f.price === 0 ? "Get free" : meState.coins < f.price ? `Need ${f.price.toLocaleString()}c` : `Buy · ${f.price.toLocaleString()}c`}
                </button>
              </div>
                );
              })}
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
        <div
          className="fixed z-50 min-w-[160px] rounded-xl border border-white/15 bg-night p-2 text-sm shadow-xl"
          style={{
            left: Math.max(8, Math.min(menu.x + 8, (typeof window !== "undefined" ? window.innerWidth : 400) - 176)),
            top: Math.max(8, Math.min(menu.y + 8, (typeof window !== "undefined" ? window.innerHeight : 400) - 280)),
          }}
        >
          {menu.furn && (
            <>
              <div className="px-2 pb-1 text-xs text-white/50">{furn(menu.furn.catalogId)?.name}</div>
              {furn(menu.furn.catalogId)?.sittable && (
                <Btn
                  onClick={() => {
                    const t = menu.tile || { x: menu.furn!.x, y: menu.furn!.y };
                    walkTo(t.x, t.y);
                    setMenu(null);
                  }}
                >
                  Sit
                </Btn>
              )}
              {furn(menu.furn.catalogId)?.use === "dice" && (
                <Btn onClick={() => { act({ type: "use", uid: menu.furn!.uid }); setMenu(null); }}>Roll</Btn>
              )}
              {furn(menu.furn.catalogId)?.use === "arcade" && (
                <Btn onClick={() => { act({ type: "use", uid: menu.furn!.uid }); setMenu(null); }}>Play</Btn>
              )}
              {furn(menu.furn.catalogId)?.use === "dance" && (
                <Btn onClick={() => { act({ type: "use", uid: menu.furn!.uid }); setMenu(null); }}>Dance</Btn>
              )}
              {furn(menu.furn.catalogId)?.use === "teleport" && (
                <Btn onClick={() => { act({ type: "use", uid: menu.furn!.uid }); setMenu(null); }}>Use pad</Btn>
              )}
              {furn(menu.furn.catalogId)?.use === "frame" && (
                <Btn
                  onClick={async () => {
                    const w = prompt("Wallet address that holds the NFT (or leave blank to use linked wallet)");
                    const n = await fetch("/api/nfts" + (w ? `?wallet=${w}` : "")).then((r) => r.json());
                    const pick = n.nfts?.[0];
                    if (pick) act({ type: "setFrame", uid: menu.furn!.uid, nftMint: pick.mint, nftUrl: pick.image });
                    setMenu(null);
                  }}
                >
                  Hang NFT
                </Btn>
              )}
              <Btn onClick={() => { act({ type: "rotate", uid: menu.furn!.uid }); setMenu(null); }}>Rotate</Btn>
              <Btn
                onClick={async () => {
                  await act({ type: "pickup", uid: menu.furn!.uid });
                  setMenu(null);
                  refreshMe();
                  setStatus("Picked up — it's back in your backpack.");
                }}
              >
                Pick up
              </Btn>
              <Btn
                onClick={async () => {
                  const p = menu.furn!;
                  const j = await act({ type: "pickup", uid: p.uid });
                  setMenu(null);
                  if (j.error) return;
                  await refreshMe();
                  setPlace({ uid: p.uid, catalogId: p.catalogId, rot: p.rot });
                  setStatus("Moving — rotate, then click a new tile in your suite.");
                }}
              >
                Move
              </Btn>
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

      <p className="pointer-events-none absolute bottom-[4.5rem] left-3 text-[10px] text-white/70">
        Scroll or pinch to zoom · click to walk/sit · hold ~2s or right-click your furniture · Space to dance
      </p>
    </div>
  );
}

function Hud({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`absolute left-1/2 top-24 z-40 max-h-[70vh] -translate-x-1/2 overflow-auto p-4 panel ${wide ? "w-[min(860px,94vw)]" : "w-[min(420px,94vw)]"}`}>
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
