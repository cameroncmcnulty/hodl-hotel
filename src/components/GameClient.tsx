"use client";

import { FurnIcon } from "@/components/FurnIcon";
import { HotelBackdrop } from "@/components/HotelBackdrop";
import { LayoutPreview } from "@/components/LayoutPreview";
import { AppIcon, PhoneApp, PhoneClock, PhoneShell } from "@/components/PhoneShell";
import { CATALOG, CATS, furn, RARITY_LABEL, RARITY_TONE, type Rarity } from "@/lib/catalog";
import { FREE_LAYOUT_IDS, isDoor, layoutById, PREMIUM_LAYOUTS, USER_LAYOUTS, walkable } from "@/lib/layouts";
import { COIN_PACKS } from "@/lib/constants";
import { pointerWorld, tileAt, wallLiftAt } from "@/lib/game/draw";
import { camToFit } from "@/lib/game/iso";
import { HotelPixi } from "@/lib/game/pixi/HotelPixi";
import { astar, canPlaceFurn, furnAt, wallAutoRot } from "@/lib/game/path";
import { face, motAt, setPath, tickMot, type Mot } from "@/lib/game/motion";
import { loadAvatars, loadLookSprites } from "@/lib/game/avatar";
import { loadSprites, spriteCache } from "@/lib/game/sprites";
import { api, authInit, clearClientToken } from "@/lib/clientAuth";
import type { Ad, ChatLine, Occupant, Placed, Room } from "@/lib/types";
import {
  Backpack,
  Briefcase,
  Coins,
  Copy,
  Crown,
  Gem,
  Handshake,
  LogOut,
  Map,
  Minus,
  MessageCircle,
  MessagesSquare,
  Send,
  Settings,
  Plus,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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

let leaveTimer: ReturnType<typeof setTimeout> | undefined;

const PACK_META: Record<string, { Icon: typeof Coins; tint: string; blurb: string }> = {
  pocket: { Icon: Coins, tint: "from-zinc-300 to-zinc-500", blurb: "Starter stack" },
  carry: { Icon: Briefcase, tint: "from-sky-400 to-blue-600", blurb: "Studio kit" },
  suite: { Icon: Sparkles, tint: "from-[#14F195] to-[#9945FF]", blurb: "Most popular" },
  penthouse: { Icon: Crown, tint: "from-amber-300 to-orange-500", blurb: "Decorator crate" },
  whale: { Icon: Gem, tint: "from-violet-400 to-fuchsia-600", blurb: "Diamond hands" },
};

function SolMark({ className = "h-4 w-4" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 397.7 311.7" className={className} aria-hidden>
      <linearGradient id={id} x1="360.8" y1="351.4" x2="141.3" y2="-69.3" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
      <path fill={`url(#${id})`} d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
      <path fill={`url(#${id})`} d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
      <path fill={`url(#${id})`} d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
    </svg>
  );
}

export function GameClient({ me, homeRoomId }: { me: Me; homeRoomId: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const pixiRef = useRef<HotelPixi | null>(null);
  const [snap, setSnap] = useState<Snap | null>(null);
  const [meState, setMe] = useState(me);
  const [roomId, setRoomId] = useState(homeRoomId);
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneMin, setPhoneMin] = useState(false);
  const [lobby, setLobby] = useState(false);
  const [myRooms, setMyRooms] = useState<{ id: string; name: string; layoutId: string }[]>([]);
  const [chat, setChat] = useState("");
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; tile?: { x: number; y: number }; furn?: Placed; user?: Occupant } | null>(null);
  const [place, setPlace] = useState<{ uid: string; catalogId: string; rot: 0 | 1 | 2 | 3; wallLift?: 0 | 1 | 2 | 3 } | null>(null);
  const [tickerEdit, setTickerEdit] = useState<{ uid: string; value: string } | null>(null);
  const [status, setStatus] = useState("");
  const [nav, setNav] = useState<{ popular: Room[]; publicAreas: Room[]; history: Room[]; events: { title: string; roomId: string; desc: string }[] } | null>(null);
  const [social, setSocial] = useState<any>(null);
  const [shopCat, setShopCat] = useState("seating");
  const [dmText, setDmText] = useState("");
  const [dmUser, setDmUser] = useState<string | null>(null);
  const [lockPass, setLockPass] = useState("");
  const [joinTarget, setJoinTarget] = useState<string | null>(null);
  const [trade, setTrade] = useState<any>(null);
  const [pay, setPay] = useState<{
    id: string;
    packId: string;
    coins: number;
    sol: number;
    address: string;
    status: string;
    expiresAt: string;
    error?: string;
  } | null>(null);
  const [payTick, setPayTick] = useState(0);
  const [packId, setPackId] = useState<string>("suite");
  const [buying, setBuying] = useState(false);
  const tRef = useRef(0);
  const cam = useRef({ x: 400, y: 200 });
  const zoomRef = useRef(1.35);
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
    const host = canvasRef.current;
    if (!host) return;
    const engine = new HotelPixi();
    let dead = false;
    engine.mount(host).then(() => {
      if (dead) {
        engine.destroy();
        return;
      }
      pixiRef.current = engine;
    });
    return () => {
      dead = true;
      pixiRef.current = null;
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    loadAvatars();
    loadLookSprites(meState.figure, 1);
    for (const o of snap?.occupants || []) loadLookSprites(o.figure, o.dir ?? 1);
  }, [meState.figure, snap]);

  useEffect(() => {
    if (phone !== "shop") return;
    const ids = CATALOG.filter((f) => f.category === shopCat && f.id !== "ad_board").map((f) => f.id);
    loadSprites(ids).then((s) => {
      spritesRef.current = { ...spritesRef.current, ...s };
    });
  }, [phone, shopCat]);

  const act = useCallback(async (body: { type: string; [k: string]: unknown }) => {
    const { res, j } = await api("/api/game", { method: "POST", body: JSON.stringify(body) });
    if (res.status === 401) {
      if (body.type === "ping") return j;
      const me = await api("/api/auth/me");
      if (me.j?.user) {
        setMe((prev) => ({ ...prev, ...me.j.user }));
        const rid = String(body.roomId || snapRef.current?.room?.id || homeRoomId);
        const retryJoin = await api("/api/game", { method: "POST", body: JSON.stringify({ type: "join", roomId: rid }) });
        if (retryJoin.j?.room) {
          setSnap(retryJoin.j);
          setRoomId(retryJoin.j.room.id);
        }
        if (body.type !== "join") {
          const retry = await api("/api/game", { method: "POST", body: JSON.stringify(body) });
          return retry.j;
        }
        return retryJoin.j;
      }
      setStatus("Session expired — sending you to login");
      setTimeout(() => {
        clearClientToken();
        location.href = "/login";
      }, 900);
      return j;
    }
    if (j.error === "Join a room first" && body.type !== "leave" && body.type !== "join") {
      const rid = snapRef.current?.room?.id || homeRoomId;
      await api("/api/game", { method: "POST", body: JSON.stringify({ type: "join", roomId: rid }) });
      const retry = await api("/api/game", { method: "POST", body: JSON.stringify(body) });
      if (retry.j?.room) {
        setSnap(retry.j);
        setRoomId(retry.j.room.id);
      }
      return retry.j;
    }
    if (j.error && body.type !== "ping") setStatus(j.error);
    if (j.lobby) {
      setSnap(null);
      setPhone("home");
      setPhoneMin(false);
      return j;
    }
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
  }, [homeRoomId]);

  const walkTo = useCallback(
    (tx: number, ty: number) => {
      const s = snapRef.current;
      if (!s?.room) {
        act({ type: "walk", x: tx, y: ty });
        return;
      }
      if (isDoor(layoutById(s.room.layoutId), tx, ty)) {
        act({ type: "leave" });
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
    if (leaveTimer) clearTimeout(leaveTimer);
    act({ type: "join", roomId: homeRoomId });
    return () => {
      leaveTimer = setTimeout(() => {
        fetch("/api/game", authInit({ method: "POST", body: JSON.stringify({ type: "leave" }) }));
      }, 2500);
    };
  }, [act, homeRoomId]);

  useEffect(() => {
    if (!snap?.room) return;
    let busy = false;
    const id = setInterval(() => {
      if (busy) return;
      busy = true;
      const m = motions.current[meIdRef.current];
      Promise.resolve(act({ type: "ping", x: m?.x, y: m?.y, dir: m?.dir })).finally(() => {
        busy = false;
      });
    }, 4000);
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
        setMenu(null);
        setTickerEdit(null);
        setPhone((p) => (p && p !== "home" ? "home" : null));
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
      const host = canvasRef.current;
      const engine = pixiRef.current;
      const s = snap;
      if (host && s) {
          const w = host.clientWidth;
          const h = host.clientHeight;
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
            const seatDef = seat ? furn(seat.catalogId) : undefined;
            const resting = !!(seatDef && (seatDef.sittable || seatDef.layable));
            return {
              ...o,
              x: m.x,
              y: m.y,
              dir: resting ? seat!.rot : m.dir,
              moving: m.moving,
              dist: m.dist,
              sitUid: resting ? seat!.uid : undefined,
              lay: !!(resting && seatDef?.layable),
            };
          });
          const layoutFit = layoutById(s.room.layoutId);
          const fit = camToFit(layoutFit, w, h);
          cam.current.x = fit.ox;
          cam.current.y = fit.oy;
          zoomRef.current = fit.scale;
          const gdef = place ? furn(place.catalogId) : undefined;
          if (engine?.ready) {
            engine.draw({
              room: s.room,
              occupants: vis,
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
                      wallLift: place!.wallLift,
                    }
                  : undefined,
              view: { w, h },
              zoom: fit.scale,
              sprites: spritesRef.current,
            });
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
    const clearHold = () => {
      if (holdRef.current) {
        window.clearTimeout(holdRef.current.t);
        holdRef.current = null;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        clearHold();
        skipClickRef.current = true;
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
      if (e.touches.length >= 2) {
        e.preventDefault();
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
    } else {
      setJoinTarget(null);
      setPhone(null);
    }
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

  async function authedPost(url: string, body: Record<string, unknown>) {
    const send = () => api(url, { method: "POST", body: JSON.stringify(body) });
    let { res, j } = await send();
    if (res.status === 401) {
      const user = await refreshMe();
      if (user) {
        ({ res, j } = await send());
      } else {
        setStatus("Session expired — sending you to login");
        setTimeout(() => {
          clearClientToken();
          location.href = "/login";
        }, 900);
        return { res, j, dead: true as const };
      }
    }
    if (res.status === 409 && /desk is busy|tap buy again/i.test(String(j.error || ""))) {
      ({ res, j } = await send());
    }
    return { res, j, dead: false as const };
  }

  async function openNav() {
    setPhone("nav");
    setNav((await api("/api/nav")).j);
  }
  async function openSocial() {
    setPhone("friends");
    setSocial((await api("/api/social")).j);
  }
  async function openMsgs() {
    setPhone("msgs");
    setSocial((await api("/api/social")).j);
  }


  async function buyPlan(id: string) {
    const { j, dead } = await authedPost("/api/shop", { layoutId: id });
    if (dead) return;
    if (j.error) setStatus(j.error);
    else {
      setStatus(`Unlocked ${j.plan.name}`);
      if (j.user) setMe((prev) => ({ ...prev, ...j.user }));
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
    const { j, dead } = await authedPost("/api/shop", { catalogId: id });
    if (dead) return;
    if (j.error) {
      setStatus(j.error);
      return;
    }
    if (j.user) setMe((prev) => ({ ...prev, ...j.user }));
    setStatus(j.message || `Purchase successful — ${j.item?.name || "item"} is in your backpack.`);
  }

  async function buyCoins() {
    const pack = COIN_PACKS.find((p) => p.id === packId);
    if (!pack) {
      setStatus("Pick a coin pack first");
      return;
    }
    setBuying(true);
    const { j, dead } = await authedPost("/api/solana", { op: "invoice", packId: pack.id });
    setBuying(false);
    if (dead) return;
    if (j.error) {
      setStatus(j.error);
      return;
    }
    setPay(j.invoice);
    setStatus(`Send ${pack.sol} SOL to the desk wallet.`);
  }

  async function pollPay(invoiceId: string) {
    const { j } = await api("/api/solana", { method: "POST", body: JSON.stringify({ op: "check", invoiceId }) });
    if (j.invoice) setPay(j.invoice);
    if (j.user?.coins != null) setMe((prev) => ({ ...prev, coins: j.user.coins }));
    if (j.invoice?.status === "credited") setStatus(`+${j.invoice.coins} coins credited`);
    if (j.error) setStatus(j.error);
  }

  useEffect(() => {
    if (!pay || pay.status === "credited" || pay.status === "expired" || pay.status === "failed") return;
    const t = setInterval(() => pollPay(pay.id), 3500);
    const clock = setInterval(() => setPayTick((n) => n + 1), 1000);
    return () => {
      clearInterval(t);
      clearInterval(clock);
    };
  }, [pay?.id, pay?.status]);

  function payRemain() {
    if (!pay) return "";
    const ms = Math.max(0, new Date(pay.expiresAt).getTime() - Date.now());
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`${label} copied`);
    } catch {
      setStatus("Copy failed — select it yourself");
    }
  }

  const you = snap?.occupants.find((o) => o.userId === meState.id);
  const unread = (social?.threads || []).reduce((n: number, t: any) => n + (Number(t.unread) || 0), 0);
  const goHome = () => setPhone("home");

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#050508]" style={{ overscrollBehavior: "none" }}>
      {snap?.room === undefined && (
        <div className="absolute inset-0 z-10">
          <HotelBackdrop>
            <div className="relative z-20 flex h-full items-end justify-center pb-28 text-white">
              <p className="rounded-full bg-black/40 px-4 py-2 text-sm">Hotel lobby — open your phone to pick a room.</p>
            </div>
          </HotelBackdrop>
        </div>
      )}
      <div
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-pointer touch-none select-none"
        style={{ imageRendering: "pixelated", touchAction: "none" }}
        onMouseMove={(e) => {
          const t = localTile(e);
          setHover(t);
          const p = place;
          if (!p) return;
          const def = furn(p.catalogId);
          if (def?.slot !== "wall") return;
          const s = snapRef.current;
          const canvas = canvasRef.current;
          if (!s || !canvas) return;
          const r = canvas.getBoundingClientRect();
          const layout = layoutById(s.room.layoutId);
          const world = pointerWorld({ ...cam.current, z: zoomRef.current }, e.clientX - r.left, e.clientY - r.top, {
            w: r.width,
            h: r.height,
          });
          const rot = wallAutoRot(s.room.layoutId, t.x, t.y);
          const lift = wallLiftAt(layout, t.x, t.y, world.sy);
          if (rot !== p.rot || lift !== p.wallLift) setPlace({ ...p, rot, wallLift: lift });
        }}
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
            const j = await act({ type: "place", uid: place.uid, x: t.x, y: t.y, rot: place.rot, wallLift: place.wallLift });
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

      <button
        type="button"
        onClick={openNav}
        className="glass-chip absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white/90"
      >
        {snap?.room.name || "HODL Hotel"}
        <span className="ml-2 text-white/45">{snap?.occupants.length || 0} here</span>
      </button>

      <div className="pointer-events-none absolute bottom-[5.6rem] left-3 right-3 z-20 mx-auto max-w-md space-y-1.5">
        {(snap?.chat || []).slice(-4).map((c) => (
          <div
            key={c.id}
            className={`pointer-events-none max-w-[88%] rounded-[18px] px-3 py-1.5 text-[13px] leading-snug shadow-lg backdrop-blur-md ${
              c.userId === meState.id
                ? "ml-auto bg-[#14F195]/90 text-[#12121c]"
                : "bg-black/55 text-white"
            }`}
          >
            {c.userId !== meState.id && (
              <span className={`mr-1.5 font-semibold ${c.kind === "roll" ? "text-gold" : "text-mint"}`}>{c.username}</span>
            )}
            {c.text}
          </div>
        ))}
      </div>

      <form
        className="absolute inset-x-0 bottom-0 z-30 mx-auto flex max-w-xl items-center gap-2 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (chat.trim()) act({ type: "chat", text: chat });
          setChat("");
        }}
      >
        <input
          className="h-11 min-w-0 flex-1 rounded-full border border-white/15 bg-black/55 px-4 text-sm text-white outline-none placeholder:text-white/40 backdrop-blur-xl focus:border-mint/50"
          placeholder={`Say something, ${meState.username}…`}
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          maxLength={80}
        />
        <button
          type="submit"
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#14F195] text-[#12121c] shadow-[0_8px_24px_rgba(20,241,149,0.35)] transition active:scale-95"
        >
          <Send size={18} />
        </button>
        <button
          type="button"
          aria-label={phone ? "Close phone" : "Open phone"}
          onClick={() => {
            if (phone) setPhone(null);
            else {
              setPhone("home");
              fetch("/api/social", { credentials: "include" })
                .then((r) => r.json())
                .then(setSocial)
                .catch(() => {});
            }
          }}
          className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white shadow-[0_8px_28px_rgba(153,69,255,0.45)] transition active:scale-95 ${phone ? "ring-2 ring-white/80" : ""}`}
        >
          <Smartphone size={18} />
          {!!unread && !phone && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[9px] font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </form>

      {status && (
        <div className="glass-chip absolute left-1/2 top-14 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm text-white" onClick={() => setStatus("")}>
          {status}
        </div>
      )}

      {place && (
        <div className="glass-chip absolute bottom-[5.7rem] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-2 text-sm">
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

      {phone && phoneMin && (
        <button
          type="button"
          className="absolute bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm text-white ring-1 ring-white/20"
          onClick={() => setPhoneMin(false)}
        >
          Phone
        </button>
      )}
      {phone && !phoneMin && (
        <PhoneShell onBackdrop={() => setPhone(null)} onHomeBar={() => (phone === "home" ? setPhone(null) : goHome())}>
          {phone === "home" && (
            <div className="flex min-h-0 flex-1 flex-col px-5 pt-1">
              <div className="mb-3 flex items-center justify-between text-[12px] font-semibold text-white/75">
                <PhoneClock />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPhoneMin(true)} className="rounded-full bg-white/10 p-1" aria-label="Minimize phone">
                    <Minus size={14} />
                  </button>
                  <button type="button" onClick={() => setPhone("coins")} className="rounded-full bg-white/10 px-2.5 py-0.5 text-mint">
                    {meState.coins.toLocaleString()}c
                  </button>
                </div>
              </div>
              <div className="mb-5">
                <p className="font-display text-[22px] leading-tight">Hi, {meState.username}</p>
                <p className="text-[12px] text-white/45">Your hotel phone</p>
              </div>
              <div className="grid grid-cols-4 gap-x-2 gap-y-5">
                <AppIcon label="Inbox" tint="from-[#22d3ee] to-[#2563eb]" badge={unread} onClick={openMsgs}>
                  <MessagesSquare size={26} />
                </AppIcon>
                <AppIcon label="Chat" tint="from-[#a3e635] to-[#16a34a]" onClick={() => setPhone("chat")}>
                  <MessageCircle size={26} />
                </AppIcon>
                <AppIcon label="Wallet" tint="from-[#facc15] to-[#f97316]" onClick={() => setPhone("coins")}>
                  <Wallet size={26} />
                </AppIcon>
                <AppIcon
                  label="Rooms"
                  tint="from-[#fb7185] to-[#be123c]"
                  onClick={() => {
                    setPhone("rooms");
                    act({ type: "listRooms" }).then((j) => {
                      if (j.rooms) setMyRooms(j.rooms);
                    });
                  }}
                >
                  <Plus size={26} />
                </AppIcon>
              </div>
              <div className="mt-auto mb-1 grid grid-cols-4 justify-items-center gap-2 rounded-[22px] bg-white/12 p-2.5 backdrop-blur-md">
                {[
                  { tint: "from-[#38bdf8] to-[#1d4ed8]", Icon: Map, fn: openNav, label: "Navigator" },
                  { tint: "from-[#fbbf24] to-[#ea580c]", Icon: Backpack, fn: () => setPhone("pack"), label: "Bag" },
                  { tint: "from-[#14F195] to-[#0f766e]", Icon: ShoppingBag, fn: () => setPhone("shop"), label: "Shop" },
                  { tint: "from-[#c084fc] to-[#7c3aed]", Icon: Users, fn: openSocial, label: "Friends" },
                ].map(({ tint, Icon, fn, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    onClick={fn}
                    className={`grid h-[52px] w-[52px] place-items-center rounded-[15px] bg-gradient-to-br text-white shadow-[0_8px_18px_rgba(0,0,0,0.3)] transition active:scale-95 ${tint}`}
                  >
                    <Icon size={24} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {phone === "rooms" && (
            <PhoneApp title="Your rooms" onBack={goHome}>
              <p className="mb-3 text-xs text-white/50">{myRooms.length}/50 private suites</p>
              <button
                type="button"
                className="mb-3 w-full rounded-xl bg-[#14F195] py-2 text-sm font-bold text-black"
                onClick={async () => {
                  const j = await act({ type: "createRoom", name: `${meState.username}'s pad` });
                  if (j.room) {
                    setMyRooms((r) => [...r, j.room]);
                    await act({ type: "join", roomId: j.room.id });
                    setPhone(null);
                  }
                }}
              >
                + Add room
              </button>
              <div className="grid gap-2">
                {myRooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="rounded-xl bg-white/10 px-3 py-2 text-left"
                    onClick={async () => {
                      await act({ type: "join", roomId: r.id });
                      setPhone(null);
                    }}
                  >
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-[11px] text-white/45">{r.layoutId}</div>
                  </button>
                ))}
              </div>
            </PhoneApp>
          )}

          {phone === "pack" && (
            <PhoneApp title="Backpack" extra={<span className="pr-2 text-[11px] text-white/40">{meState.backpack.filter(Boolean).length}/30</span>} onBack={goHome}>
              <div className="grid grid-cols-4 gap-2">
                {meState.backpack.map((slot, i) => (
                  <button
                    key={i}
                    onClick={async () => {
                      if (!slot) return;
                      const def = furn(slot.catalogId);
                      if (def?.finish) {
                        const j = await act({ type: "applyFinish", catalogId: slot.catalogId });
                        if (!j.error) {
                          setStatus(def.finish === "paper" ? "Wallpaper applied." : "Floor applied.");
                          refreshMe();
                        }
                        return;
                      }
                      if (snap?.room.ownerId !== meState.id) {
                        setStatus("You can only place furniture in your suite — heading there.");
                        const j = await joinRoom(homeRoomId);
                        if (j?.room?.ownerId !== meState.id) {
                          setStatus("You can only put furniture down in your own suite.");
                          return;
                        }
                      }
                      setPlace({ uid: slot.uid, catalogId: slot.catalogId, rot: 0 });
                      setPhone(null);
                      setStatus("Rotate, then tap a tile in your suite to place.");
                    }}
                    className={`flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border text-[9px] leading-tight ${slot ? "border-white/15 bg-white/10" : "border-white/5 bg-black/25"}`}
                  >
                    {slot ? (
                      <>
                        <FurnIcon id={slot.catalogId} className="h-12 w-full" />
                        <span className="px-0.5 pb-0.5 text-center text-white/80">{furn(slot.catalogId)?.name}</span>
                      </>
                    ) : null}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/40">Place only in your suite. Right-click or hold ~2s on your pieces to pick up, rotate, sit, or use them.</p>
            </PhoneApp>
          )}

          {phone === "shop" && (
            <PhoneApp title="Shop" extra={<span className="pr-2 text-[11px] text-mint">{meState.coins.toLocaleString()}c</span>} onBack={goHome}>
              <div className="mb-2 flex flex-wrap gap-1">
                {[...CATS, "plans"].map((c) => (
                  <button key={c} className={`rounded-full px-2.5 py-1 text-[11px] capitalize ${shopCat === c ? "bg-mint text-ink" : "bg-white/10 text-white/80"}`} onClick={() => setShopCat(c)}>
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
                <div className="grid grid-cols-1 gap-2">
                  {[...USER_LAYOUTS, ...PREMIUM_LAYOUTS].map((l) => (
                    <div key={l.id} className="rounded-2xl border border-white/10 bg-white/5 p-2">
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
                <div className="grid grid-cols-2 gap-2">
                  {CATALOG.filter((f) => f.category === shopCat && !f.hotelOnly && f.id !== "ad_board")
                    .slice()
                    .sort((a, b) => a.price - b.price)
                    .map((f) => {
                      const rarity = (f.rarity || (f.rare ? "rare" : "common")) as Rarity;
                      return (
                        <div key={f.id} className="rounded-2xl border border-white/10 bg-white/5 p-2">
                          <div className="relative aspect-[8/7] w-full rounded-xl bg-[#7ec8ea]">
                            <FurnIcon id={f.id} className="h-full w-full" />
                            {rarity !== "common" && (
                              <span className={`absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${RARITY_TONE[rarity]}`}>
                                {RARITY_LABEL[rarity]}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 text-[13px] font-semibold leading-tight">{f.name}</div>
                          <div className="text-[10px] text-white/45">
                            {f.w}×{f.d} · {f.sittable ? "sit" : f.walkable ? "walk" : f.slot === "wall" ? "wall" : "place"}
                          </div>
                          <button className="btn-sol mt-2 w-full text-[11px]" onClick={() => buy(f.id)}>
                            {f.price === 0 ? "Get free" : meState.coins < f.price ? `Need ${f.price.toLocaleString()}c` : `Buy · ${f.price.toLocaleString()}c`}
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </PhoneApp>
          )}

          {phone === "coins" && (
            <PhoneApp
              title="Wallet"
              extra={
                <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] text-mint">
                  <Coins size={12} /> {meState.coins.toLocaleString()}c
                </span>
              }
              onBack={() => {
                if (pay && pay.status === "waiting") {
                  api("/api/solana", { method: "POST", body: JSON.stringify({ op: "cancel", invoiceId: pay.id }) });
                  setPay(null);
                  return;
                }
                if (pay) {
                  setPay(null);
                  return;
                }
                goHome();
              }}
            >
              {pay ? (
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-mint/30 bg-mint/10 px-3 py-2">
                    <SolMark className="h-7 w-7" />
                    <div>
                      <p className="text-sm font-semibold">
                        Send {pay.sol} SOL
                      </p>
                      <p className="text-[11px] text-white/60">for {pay.coins.toLocaleString()} coins</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">
                    {pay.status === "waiting" && `Waiting on chain · ${payRemain()} left`}
                    {pay.status === "received" && "Payment seen — forwarding to treasury…"}
                    {pay.status === "credited" && "Credited. Coins are in your wallet."}
                    {pay.status === "expired" && "This ticket expired. Pick a pack again."}
                    {pay.status === "failed" && (pay.error || "Forward failed — the desk will retry.")}
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-white/40">Desk wallet</p>
                    <p className="break-all font-mono text-xs leading-5">{pay.address}</p>
                    <button type="button" className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px]" onClick={() => copyText(pay.address, "Address")}>
                      <Copy size={12} /> Copy address
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs" onClick={() => copyText(String(pay.sol), "Amount")}>
                      <SolMark className="h-3.5 w-3.5" /> Copy {pay.sol} SOL
                    </button>
                    <a className="inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1.5 text-xs font-semibold text-black" href={`solana:${pay.address}?amount=${pay.sol}&label=HODL%20Hotel`} >
                      <Wallet size={12} /> Open wallet
                    </a>
                    {pay.status === "waiting" || pay.status === "received" ? (
                      <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 text-xs" onClick={() => pollPay(pay.id)}>
                        I sent it
                      </button>
                    ) : null}
                    {pay.status === "credited" || pay.status === "expired" || pay.status === "failed" ? (
                      <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 text-xs" onClick={() => setPay(null)}>
                        Back to packs
                      </button>
                    ) : null}
                  </div>
                  {pay.error && pay.status !== "expired" ? <p className="text-xs text-coral">{pay.error}</p> : null}
                </div>
              ) : (
                <div className="flex min-h-full flex-col">
                  <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#9945FF]/25 to-[#14F195]/15 px-3 py-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/30">
                      <SolMark className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="font-display text-2xl font-semibold text-mint">{meState.coins.toLocaleString()}c</p>
                      <p className="text-[11px] text-white/55">Hotel coins · 18+ Solana checkout</p>
                    </div>
                  </div>
                  <p className="mb-2 text-[11px] leading-relaxed text-white/45">Pick a pack, then tap Buy. SOL goes to a one-time desk wallet and is forwarded to the treasury.</p>
                  {typeof window !== "undefined" && window.location.hostname === "localhost" ? (
                    <button
                      type="button"
                      className="mb-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/70"
                      onClick={async () => {
                        const { j } = await authedPost("/api/solana", { op: "faucet" });
                        if (j.user) setMe((prev) => ({ ...prev, coins: j.user.coins }));
                        setStatus(j.error || "Local faucet: +500 coins");
                      }}
                    >
                      Local test: +500 coins
                    </button>
                  ) : null}
                  <div className="grid gap-2">
                    {COIN_PACKS.map((p) => {
                      const meta = PACK_META[p.id] || PACK_META.pocket;
                      const Icon = meta.Icon;
                      const on = packId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPackId(p.id)}
                          className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                            on ? "border-mint bg-mint/15 ring-1 ring-mint" : "border-white/10 bg-white/5 hover:border-white/25"
                          }`}
                        >
                          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${meta.tint}`}>
                            <Icon size={20} />
                          </div>
                          <span className="min-w-0 flex-1">
                            <b className="block truncate">{p.name}</b>
                            <span className="text-[11px] text-white/50">{p.tag}</span>
                          </span>
                          <span className="text-right">
                            <span className="block text-sm font-semibold text-mint">{p.coins.toLocaleString()}c</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-white/70">
                              <SolMark className="h-3 w-3" /> {p.sol} SOL
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={buying || !packId}
                    onClick={() => buyCoins()}
                    className="btn-sol mt-3 sticky bottom-0 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-60"
                  >
                    <SolMark className="h-4 w-4" />
                    {buying
                      ? "Opening desk…"
                      : `Buy ${COIN_PACKS.find((p) => p.id === packId)?.name || "pack"} · ${COIN_PACKS.find((p) => p.id === packId)?.sol ?? ""} SOL`}
                  </button>
                </div>
              )}
            </PhoneApp>
          )}

          {phone === "nav" && (
            <PhoneApp title="Navigator" extra={<button type="button" className="mr-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-mint" onClick={() => joinRoom(homeRoomId)}>My suite</button>} onBack={goHome}>
              {!nav ? (
                <p className="text-sm text-white/50">Finding rooms…</p>
              ) : (
                <>
                  <Tabs
                    tabs={[
                      { id: "pop", label: "Popular", node: <RoomList rooms={nav.popular} onJoin={joinRoom} /> },
                      {
                        id: "pub",
                        label: "Public",
                        node: (
                          <div>
                            <div className="mb-3 grid gap-2">
                              {[
                                ["public-lobby", "Grand Lobby", "/art/lobby.jpg"],
                                ["public-pool", "Roof Pool", "/art/pool.jpg"],
                                ["public-shill-zone", "SHILL ZONE", "/art/shill-zone.jpg"],
                                ["public-cook-room", "The Cook Room", "/art/cook-room.jpg"],
                                ["public-arcade", "Signal Arcade", "/art/arcade.jpg"],
                              ].map(([id, name, src]) => (
                                <button key={id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left" onClick={() => joinRoom(id)}>
                                  <img src={src} alt={name} className="h-20 w-full object-cover" />
                                  <div className="p-2 text-sm font-semibold">{name}</div>
                                </button>
                              ))}
                            </div>
                            <RoomList rooms={nav.publicAreas} onJoin={joinRoom} />
                          </div>
                        ),
                      },
                      { id: "hist", label: "History", node: <RoomList rooms={nav.history} onJoin={joinRoom} /> },
                    ]}
                  />
                  {nav.events?.length > 0 && (
                    <div className="mt-3 rounded-2xl bg-mint/10 px-3 py-2 text-xs text-mint">
                      {nav.events[0].title} — {nav.events[0].desc}
                    </div>
                  )}
                </>
              )}
            </PhoneApp>
          )}

          {phone === "chat" && (
            <PhoneApp title="Room chat" onBack={goHome}>
              <div className="space-y-2 text-sm">
                {(snap?.chat || []).length === 0 && <p className="text-white/40">No messages yet.</p>}
                {(snap?.chat || []).map((c) => (
                  <div key={c.id} className="rounded-2xl bg-white/5 px-3 py-2">
                    <b className={c.kind === "roll" ? "text-gold" : "text-mint"}>{c.username}</b>
                    <div className="text-white/80">{c.text}</div>
                  </div>
                ))}
              </div>
            </PhoneApp>
          )}

          {phone === "friends" && (
            <PhoneApp title="Friends" onBack={goHome}>
              {!social ? (
                <p className="text-sm text-white/50">Loading…</p>
              ) : (
                <FriendBox
                  social={social}
                  onJoin={joinRoom}
                  onRefresh={openSocial}
                  onMsg={(id: string) => { setDmUser(id); setPhone("msgs"); }}
                  onTrade={async (id: string) => {
                    const j = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "open", userId: id, roomId }) }).then((r) => r.json());
                    setTrade(j.trade);
                    setPhone("trade");
                  }}
                />
              )}
            </PhoneApp>
          )}

          {phone === "msgs" && (
            <PhoneApp title="Inbox" onBack={goHome}>
              {!social ? (
                <p className="text-sm text-white/50">Loading…</p>
              ) : (
                <div className="grid gap-2">
                  {(social.threads || []).length === 0 && <p className="text-white/40">No messages yet.</p>}
                  {(social.threads || []).map((t: any) => (
                    <button key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left" onClick={() => setDmUser(t.other?.id)}>
                      <b>{t.other?.username}</b> {t.unread > 0 && <span className="text-coral">({t.unread})</span>}
                      <div className="text-xs text-white/50">{t.last?.text}</div>
                    </button>
                  ))}
                  {dmUser && (
                    <form
                      className="mt-1"
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
              )}
            </PhoneApp>
          )}

          {phone === "trade" && trade && (
            <PhoneApp title="Trade" onBack={goHome}>
              <p className="text-xs text-white/50">Offer backpack items. Both ready, then both confirm.</p>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {meState.backpack.map((s, i) => (
                  <button
                    key={i}
                    className="flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[9px]"
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
              <div className="mt-3 flex gap-2">
                <button className="btn-ink flex-1" onClick={async () => setTrade((await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "ready", tradeId: trade.id }) }).then((r) => r.json())).trade)}>
                  Ready
                </button>
                <button className="btn-sol flex-1" onClick={async () => { const j = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "confirm", tradeId: trade.id }) }).then((r) => r.json()); setTrade(j.trade); refreshMe(); }}>
                  Confirm
                </button>
              </div>
            </PhoneApp>
          )}

          {phone === "settings" && (
            <PhoneApp title="Settings" onBack={goHome}>
              <div className="grid gap-2 text-sm">
                <button className="rounded-2xl bg-white/10 px-4 py-3 text-left hover:bg-white/15" onClick={() => joinRoom(homeRoomId)}>
                  My suite
                </button>
                <button className="rounded-2xl bg-white/10 px-4 py-3 text-left hover:bg-white/15" onClick={() => setPhone("coins")}>
                  Wallet · {meState.coins.toLocaleString()}c
                </button>
                {meState.role === "admin" && (
                  <a className="rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/15" href="/admin">
                    Front desk
                  </a>
                )}
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-[12px] leading-relaxed text-white/55">
                  The room stays locked on screen. Click a tile to walk. Hold ~2s (phone) or right-click (mouse). Space to dance.
                </div>
                <button
                  className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-coral/80 px-4 py-3 font-semibold text-white"
                  onClick={async () => {
                    await fetch("/api/auth/logout", authInit({ method: "POST" }));
                    clearClientToken();
                    location.href = "/";
                  }}
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </PhoneApp>
          )}
        </PhoneShell>
      )}

      {tickerEdit && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setTickerEdit(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-night p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg">Display ticker</h2>
            <p className="mt-1 text-xs text-white/50">The $ stays on the Shillboard. Type up to 10 letters or numbers after it.</p>
            <label className="mt-4 flex items-center rounded-2xl border border-white/15 bg-black/40 px-3 py-2 focus-within:border-mint/60">
              <span className="pr-1 font-display text-xl font-bold text-mint">$</span>
              <input
                autoFocus
                className="min-w-0 flex-1 bg-transparent font-display text-xl font-semibold uppercase tracking-wide text-white outline-none placeholder:text-white/25"
                value={tickerEdit.value}
                maxLength={10}
                placeholder="PURPE"
                onChange={(e) =>
                  setTickerEdit({
                    ...tickerEdit,
                    value: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
                  })
                }
              />
            </label>
            <p className="mt-2 text-center font-display text-sm text-mint/80">${tickerEdit.value || ""}</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-ink flex-1" onClick={() => setTickerEdit(null)}>
                Cancel
              </button>
              <button
                className="btn-sol flex-1"
                onClick={async () => {
                  const j = await act({ type: "setTicker", uid: tickerEdit.uid, ticker: tickerEdit.value });
                  if (!j.error) {
                    setTickerEdit(null);
                    setStatus(`Shillboard set to $${tickerEdit.value || ""}`);
                  }
                }}
              >
                Display
              </button>
            </div>
          </div>
        </div>
      )}

      {joinTarget && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setJoinTarget(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-night p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg">Locked room</h2>
            <p className="mt-1 text-xs text-white/50">This suite needs a password.</p>
            <input className="field mt-3" placeholder="Password" value={lockPass} onChange={(e) => setLockPass(e.target.value)} />
            <button className="btn-sol mt-3 w-full" onClick={() => joinRoom(joinTarget, lockPass)}>
              Knock
            </button>
          </div>
        </div>
      )}

      {menu && (
        <div
          className="glass-chip fixed z-50 min-w-[168px] rounded-2xl p-1.5 text-sm"
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
              {furn(menu.furn.catalogId)?.use === "ticker" && (
                <Btn
                  onClick={() => {
                    setTickerEdit({ uid: menu.furn!.uid, value: (menu.furn!.ticker || "").slice(0, 10) });
                    setMenu(null);
                  }}
                >
                  Display
                </Btn>
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
              <Btn onClick={async () => { const j = await fetch("/api/trade", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "open", userId: menu.user!.userId, roomId }) }).then((r) => r.json()); setTrade(j.trade); setPhone("trade"); setMenu(null); }}><Handshake size={12} /> Trade</Btn>
              <Btn onClick={async () => { const reason = prompt("Why report?") || "report"; await fetch("/api/social", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "report", userId: menu.user!.userId, reason }) }); setMenu(null); }}>Report</Btn>
            </>
          )}
          {!menu.furn && !menu.user && <div className="px-2 text-white/50">Nothing here</div>}
        </div>
      )}

      {you?.dance && <div className="pointer-events-none absolute bottom-[5.7rem] right-4 text-2xl">💃</div>}
    </div>
  );
}

function Btn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-white/90 hover:bg-white/10" onClick={onClick}>
      {children}
    </button>
  );
}

function RoomList({ rooms, onJoin }: { rooms: any[]; onJoin: (id: string) => void }) {
  if (!rooms?.length) return <p className="text-sm text-white/40">No rooms yet.</p>;
  return (
    <div className="grid gap-1.5">
      {rooms.map((r) => (
        <button key={r.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2.5 text-left hover:bg-white/10" onClick={() => onJoin(r.id)}>
          <span className="font-medium">{r.name}</span>
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
          <button key={t.id} className={`rounded-full px-3 py-1.5 text-xs font-medium ${id === t.id ? "bg-mint text-ink" : "bg-white/10 text-white/70"}`} onClick={() => setId(t.id)}>
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
        <button className="btn-sol shrink-0 px-3">Add</button>
      </form>
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">Requests</div>
        {(social.incoming || []).length === 0 && <p className="text-xs text-white/35">None right now.</p>}
        {(social.incoming || []).map((f: any) => (
          <div key={f.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
            {f.username}
            <button className="text-mint" onClick={async () => { await fetch("/api/social", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "accept", userId: f.id }) }); onRefresh(); }}>
              Accept
            </button>
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">Friends</div>
        {(social.friends || []).map((f: any) => (
          <div key={f.id} className="flex items-center justify-between gap-2 rounded-2xl bg-white/5 px-3 py-2">
            <span>
              {f.username} <span className={f.online ? "text-mint" : "text-white/30"}>{f.online ? "online" : "offline"}</span>
            </span>
            <span className="flex shrink-0 gap-2 text-xs text-mint">
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
