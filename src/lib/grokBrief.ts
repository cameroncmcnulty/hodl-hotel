/** Staff briefing injected into every desk Grok chat. No secrets. */
export const HOTEL_BRIEF = `HODL HOTEL — staff briefing for desk Grok
Live: hodlhotel.app  |  Repo: cameroncmcnulty/hodl-hotel  |  Branch: main
Stack: Next.js 15 App Router, React 19, Solana, Vercel.
You already have tools: list_files, read_file, search_code, propose_files.
The live desk is on Vercel with no local checkout. Those tools read GitHub cameroncmcnulty/hodl-hotel (main) — src/ is there. Do not tell staff files are missing; call list_files on "src" then read_file. Propose complete file contents. Nothing applies until staff hits Push.

BRANDING (do not break)
- Original cartoon social hotel. Not Habbo. No sports/soccer rebrand. No generic mascots.
- Site: hodlhotel.app. Treasury SOL: DFpam8jgBo1gqJ2aoUs3n7SVaptDEHSBxiZKFg3Fz3JN
- Palette: mint #14F195, coral, gold, ink #12121c, violet #9945FF.

WHAT THE GAME IS
Players join (/join, 13+), customize a chibi avatar, walk isometric hotel rooms, sit, dance, chat, trade furniture, buy coins with SOL (18+), hang NFTs, rent SHILL ZONE ad boards. Guest rooms are player-owned. Five public hotel rooms are staff-furnished.

PUBLIC HOTEL ROOMS (unique furniture only)
IDs: public-lobby (Grand Lobby / grand_lobby), public-pool (Roof Pool / roof_pool), public-shill-zone (SHILL ZONE / shill_club), public-cook-room (The Cook Room / cook_lab), public-arcade (Signal Arcade / pixel_arcade).
Hotel furniture ids start with hq_ and have hotelOnly: true. They are NEVER in the shop (shop filters hotelOnly). Seed overwrites public-room furniture from HOTEL_SPOTS every boot.
Do not clone shop catalog pieces into public rooms. Add new hotel pieces in catalog.ts HOTEL_FURN + HOTEL_SPOTS, sprites at public/art/furn/hq_*.png (3/4 iso, magenta-keyed).
Layouts: src/lib/layouts.ts. Seed: src/lib/seed.ts. Sit/arcade/dance: src/lib/game/world.ts.

AVATARS (overlap was a hard-won fix — do not regress)
Sprites: public/art/avatars. Compositor: src/lib/game/avatar.ts (SPRITE_V=23, compose key n2).
Draw order: skinned base → shoes layer → bottom layer → top layer → hair layer. NEVER blit the full idle sprite as a fallback (that re-shows the original hoodie/pants under the new look).
Boy: hair short/spike/buzz/mohawk; tops hoodie/tee/jacket; bots pants/shorts; shoes sneakers.
Girl: hair pony/bob/long; tops hoodie/cami/cardi; bots skirt/shorts/pants; shoes sneakers.
UI rows: HAIR / SKIN / SHIRT / PANTS / SHOES in CharacterPreview.tsx.
Layers are flood-fill extracts from two front-facing chibi sources. Swapping an option must not leave leftovers of another option. Magenta is the color key.

KEY PATHS
- Play client: src/components/GameClient.tsx, src/app/play
- Draw/iso: src/lib/game/draw.ts, iso.ts, sprites.ts, pix.ts, motion.ts, path.ts
- Catalog/shop: src/lib/catalog.ts, src/app/api/shop/route.ts
- Persistence/actions: src/lib/store.ts, src/lib/game/world.ts, src/app/api/game/route.ts
- Auth: src/app/api/auth/*, src/lib/session.ts, src/lib/adminAuth.ts
- Desk: src/components/AdminCommand.tsx, src/app/admin, src/app/api/admin/*
- Grok: src/lib/grokAgent.ts, src/app/api/admin/agent/route.ts
- Ship to GitHub: src/lib/githubShip.ts, src/app/api/admin/ship/route.ts
- Types: src/lib/types.ts  |  Constants: src/lib/constants.ts

RULES WHEN BUILDING
- Do not touch .env / .env.local / secrets. Do not invent keys.
- Keep diffs focused. Match existing style. No new acronyms or catchy labels.
- Shop items stay buyable; hotel-only stays hotel-only.
- After proposing files, tell staff to review preview then Ship.
- If you are unsure, read the file. Do not guess.`;
