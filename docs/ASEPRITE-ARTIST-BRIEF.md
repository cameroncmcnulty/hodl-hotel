# HODL Hotel — Pixel Art Brief (Aseprite)

Send this whole file to the artist. It is the contract for how sprites must be built so they drop into the game without rework.

**Project:** HODL Hotel — a browser social hotel (Habbo-like rooms, mix-and-match guests, placeable furniture).  
**Engine:** PixiJS. We plant PNGs on a dimetric floor. We do **not** scale X and Y independently. If the drawing is the wrong size, it looks wrong in-game.  
**Style reference (look, do not copy):** early-2000s isometric hotel avatars — large head, small body, 2:1 floor diamonds, thick black outline, flat bright colors, no gradients, no anti-alias. **Do not copy official Sulake/Habbo sprites, names, or logos.** Original designs only.

**Tool:** Aseprite (or LibreSprite). Deliver `.aseprite` sources **and** transparent PNGs.

---

## 1. Style rules (non-negotiable)

- **Projection:** dimetric / “2:1 iso.” Floor lines are 2 pixels over, 1 pixel down. Not true 30° isometric, not ¾ top-down.
- **Outline:** 1–2 px solid ink `#0C080E`. Closed silhouette. No gaps.
- **Color:** flat fills, 3 tones per material (light top, mid left, dark right). No gradients, no blur, no drop shadows, no baked-in floor tile, no room background.
- **Pixels:** nearest-neighbor. No anti-alias, no JPEG, no magenta/green key background.
- **Background:** **transparent**. Never draw the floor diamond under the object.
- **Shading:** lighting from the top-left of the iso (the “top” face of a cube is lightest).

If a piece looks like a screenshot of a room, it will be rejected.

---

## 2. Floor grid (this is how the game measures)

| Constant | Pixels | Meaning |
|---|---|---|
| Tile width | **64** | Screen width of one floor diamond |
| Tile height | **32** | Screen height of one floor diamond |
| Height step | **16** | One “block” of object height |

A piece occupies a **rectangle of whole tiles**: `w` by `d`. Never an L that cuts a tile corner.

**Sprite canvas for a floor item** (transparent padding allowed):

```
canvas width  = (w + d) × 32 + 4
canvas height = (w + d) × 16 + (h × 16) + 4
```

`h` is height in tile-steps (see list). Example:

| Occupancy | Typical h | Canvas (W×H) | What the object should look like |
|---|---|---|---|
| 1×1 stool | 1.0 | **68 × 52** | Small round seat, **~28–36 px wide**, centered. Does **not** fill the diamond. |
| 1×1 chair | 1.4 | **68 × 60** | Chair ~40–48 px wide, centered on the diamond. |
| 1×1 lamp | 2.2 | **68 × 72** | Narrow (~22–28 px), tall. |
| 1×1 plant | 2.0 | **68 × 68** | Pot on the diamond, leaves may overhang up. |
| 2×1 sofa | 1.4 | **100 × 76** | Two-seat sofa. Base spans **two tiles** (~88–96 px wide). Straight sofa, **not L-shaped**. |
| 1×2 bed | 0.8 | **100 × 68** | Twin bed along two tiles. |
| 2×2 bed | 0.9 | **132 × 84** | Double/king. Rectangle, not L. |
| 2×2 rug | 0.05 | **132 × 52** | Flat diamond that **exactly** covers 2×2 tiles. |

**Planting:** bottom-center of the PNG is the feet. We put that point on the center of the occupied tiles. Keep the object’s visual feet in the **bottom-center** of the canvas, not stuck in a corner.

**Small vs large:** occupancy is collision (you sit on that tile). Visual size is separate. A stool occupies 1×1 but must look smaller than a chair, which must look smaller than a 2-tile sofa.

---

## 3. Furniture rotations

Name files:

```
{id}_se.png    facing south-east (default, “front-right”)
{id}_sw.png    south-west
{id}_nw.png    north-west (back)
{id}_ne.png    north-east
```

- **Must have 4 unique drawings** if the object has a front (sofa, chair, bed, TV, fridge, desk).
- **1 drawing** is enough if it is radially symmetric (round stool, round plant pot, sphere). We can reuse it.
- Do **not** rely on a horizontal flip for iso furniture: left and right faces are different brightness.

Also deliver the `.aseprite` with frames or layers named `se sw nw ne`.

**Wall items** (frames, mirrors, neon, dartboard): hang on the back wall. Draw as a flat-ish plaque, ~1 tile wide, ~1.2–2.0 tile-heights tall. Files: `{id}_n.png` (north wall) and `{id}_w.png` (west wall).

---

## 4. Characters (mix-and-match rig)

Guests must **share one skeleton** so clothes swap without moving the head.

### Canvas and feet

- Canvas: **64 × 88 px**
- Shoe soles / plant line: **y = 78** (10 px of empty under the feet is fine)
- Standing guest: about **one tile wide at the feet**, **~two tiles tall** (head can overlap the tile behind)
- Head is large (about 26–30 px), body small. Black-dot eyes. Cute, not realistic.

### Genders

Two bodies: **boy**, **girl**. Same canvas, same foot line, same head size. Girl may have slightly different torso/hips; feet still on y=78.

### Directions (same names as furniture)

`se` (default), `sw`, `nw` (back), `ne`.  
`sw` / `ne` may be flips of `se` / `nw` **only if** the character is drawn ¾ and lighting still reads. Prefer unique `se` and `nw`; flips are acceptable for v1.

### Poses (all on the same rig)

| Pose | File token | Notes |
|---|---|---|
| Stand | `stand` | Idle. Optional 2-frame walk: `walk0`, `walk1` (swap every step). |
| Sit | `sit` | Legs bent. **Hip/seat at about y = 58–62.** We lift the sprite onto furniture by ~8–10 px. Guest must look **on** the chair, not standing in it. |
| Lay | `lay` | On their side/back. Head left or toward camera. Used on beds. Wider than tall is OK; still 64×88 canvas, body in the middle, “feet” conceptually still around y=78. |

### Layers (this is how mix-and-match works)

Draw **separate layers** in Aseprite, same origin. Export each layer as PNG.

**Boy**

| Layer | Tokens | Notes |
|---|---|---|
| body | `body` | Skin only: head, ears, neck, arms, hands, legs. No clothes. |
| hair | `messy`, `side`, `afro`, `spikes`, `mohawk` | Behind + front hair can be two layers (`hair_back`, `hair_front`) if bangs overlap the face. |
| top | `hoodie`, `tee`, `jacket`, `tank` | Must fit the same torso. Hoodie can have a hood behind the head. |
| bottom | `pants`, `shorts`, `jeans` | Same hip line. Shorts show more leg (body layer). |
| shoes | `sneakers`, `boots`, `slides` | Soles on y=78. |

**Girl** — same slots:

| Layer | Tokens |
|---|---|
| body | `body` |
| hair | `pony`, `bob`, `long`, `pigtails`, `bun` |
| top | `hoodie`, `tee`, `jacket`, `tank` |
| bottom | `skirt`, `pants`, `shorts` |
| shoes | `sneakers`, `boots`, `slides` |

**Palette-swap (important):** paint clothes and hair in **mid-tone gray** `#8C8C8C` (plus darker/lighter grays for shade). We recolor in engine. **Do not** bake yellow hoodies as the only shirt unless you also supply a gray “dye” version.

Skin: paint one default light-medium skin. We have 8 skin tones we tint toward:

`#f3d4c4 #e8c4a8 #d4a574 #c48a56 #b56c3a #8d4e24 #6b3a20 #3a1c10`

**Ink (`#0C080E`) and pure white highlights must stay** when we dye. Keep outlines on their own or as the darkest pixels.

### Character file names

```
avatars/{m|f}/{pose}/{dir}/{layer}-{token}.png

Example:
avatars/m/stand/se/body.png
avatars/m/stand/se/hair-messy.png
avatars/m/stand/se/top-hoodie.png
avatars/m/sit/se/body.png
avatars/f/lay/se/hair-bob.png
```

Also keep one Aseprite file per gender+pose (layers inside), e.g. `avatars/m-stand.aseprite`.

### Hero reference looks (so everyone matches)

After the gray dye layers exist, also export **two fully colored preview sheets** (not used in-engine, for QA):

1. Boy: messy brown hair, yellow hoodie `#F5C542`, black pants, gray sneakers, light skin, black-dot eyes. Stand + sit + lay + back.
2. Girl: black bob, pink tank, black skirt, white sneakers. Stand + sit + lay + back.

These two looks are the style lock.

---

## 5. Furniture list to draw

Start with **Phase 1**. Do not draw the whole shop first.

### Phase 1 — style lock + playable room (draw these first)

Characters (above) + these furniture pieces:

| id | Name | Tiles w×d | h | Sit? | Notes |
|---|---|---|---|---|---|
| stool_mint | Mint Stool | 1×1 | 1.0 | yes | Round, small, centered |
| chair_coral | Coral Chair | 1×1 | 1.4 | yes | Simple 4-leg, visible seat |
| armchair_teal | Teal Armchair | 1×1 | 1.5 | yes | Arms |
| sofa_mint | Mint Club Sofa | 2×1 | 1.4 | yes | Straight 2-seat, not L |
| bean_gold | Gold Beanbag | 1×1 | 0.8 | yes | Soft blob, small |
| bed_twin | Twin Cloud Bed | 1×2 | 0.8 | sit+lay | Pillow at head |
| table_coffee | Coffee Table | 1×1 | 0.6 | no | Low, 4 legs |
| lamp_floor | Floor Lamp | 1×1 | 2.2 | no | Shade + stem + base |
| plant_palm | Potted Palm | 1×1 | 2.0 | no | Pot + trunk + fronds |
| rug_small | Tile Rug | 2×2 | 0.05 | no | Flat, covers diamonds |

Seat cushion height the game uses (keep art matching): stool ~11–16 px up from floor, chair/sofa ~9 px, bean ~7 px, bed ~6–8 px.

### Phase 2 — rest of shop (same style)

Draw remaining catalog ids with the same naming. Occupancy from the name/id:

**Seating:** `chair_director`, `chair_gamer`, `loveseat_violet`, `sofa_sunset`, `sofa_corner` (2×1 **straight** teal sofa, not corner), `sofa_gold`, `bench_oak`, `ottoman_cream`, `lounger_pool` (1×2), `throne_obsidian`, `stool_bar` (tall), `chair_wing`, `recliner_navy`, `chair_fold`

**Beds:** `bed_double` 2×2, `bed_canopy` 2×2 tall, `bed_king_gold` 2×2, `bed_day` 2×1

**Tables:** `table_desk` 2×1, `table_dining` 2×2, `nightstand` 1×1, `bar_table` 1×1 tall, `table_glass`, `podium_sol`, `table_round`, `console_gold` 2×1, `table_picnic` 2×1

**Lighting:** `lamp_lava`, `lamp_sol`, `chandelier`, `neon_strip` 2×1 wall-ish, `lamp_gold`, `lamp_desk`, `candle_gold`, `lantern_paper`, `lamp_neon_tower`

**Electronics:** `tv_block` 2×1, `computer`, `jukebox`, `disco_ball`, `radio_retro`, `dj_booth` 2×1, `speaker_tower`, `laptop_mint`, `projector_club`

**Plants:** `plant_cactus`, `plant_flower`, `plant_hedge`, `plant_monstera`, `bonsai_gold`, `plant_orchid`, `plant_bamboo`

**Rugs:** `rug_large` 3×3, `rug_neon` 1×3, `rug_gold` 1×3

**Kitchen:** `fridge`, `minibar` 2×1, `coffee_machine`, `ice_bucket`, `stove_suite` 2×1, `toaster_chrome`, `sink_block`

**Structure:** `divider` 2×1, `wardrobe` 2×1, `bookshelf` 2×1, `safe_vault`, `crate_storage`, `marble_column`, `fireplace_gold` 2×1, `coat_rack`, `locker_gym`, `pillar_neon`

**Decor / games / outdoor / crypto:** `fountain` 2×2, `clock_block`, `trophy_cup`, `vase_rare`, `velvet_rope` 2×1, `mirror_suite` wall, `globe_desk`, `statue_cat`, `dice_machine`, `arcade_cab`, `chess_table`, `poker_table` 2×2, `pool_table` 2×2, `dart_board` wall, `foosball` 2×1, `teleporter`, `umbrella`, `grill_deck`, `hammock` 2×1, `firepit`, `pool_float`, `cabana_bed` 2×2, plus crypto statues (`statue_btc`, `statue_sol`, `hologram_orb`, etc.)

**Skip for art:** wallpaper/floor *finishes* (`paper_*`, `floor_*`) — those recolor the room, they are not sprites. Skip `ad_board`.

**Hotel-only HQ pieces** (lobby/pool/club, not sold): prefix `hq_` — desk, fountain, chandelier, palms, loungers, umbrellas, sofa, DJ, disco, speakers, arcade cabs, etc. Same rules, can wait until Phase 3.

---

## 6. Delivery

**Folder layout**

```
delivery/
  palettes/hotel.gpl          (Aseprite palette)
  avatars/                    (as in §4)
  furn/{id}/{id}_se.png
  furn/{id}/{id}_sw.png
  ...
  sources/*.aseprite
  preview/boy-sheet.png       (stand sit lay back, one row)
  preview/girl-sheet.png
  preview/furn-phase1.png     (all Phase 1 items on a transparent or magenta-free sheet)
```

**PNG:** 8-bit or 32-bit RGBA, transparent, no premultiplied fringe, no compression artifacts.  
**Aseprite:** indexed or RGB, one file per character pose or per furniture item, layers named.

**Preview sheet:** do **not** put a magenta background in the shipped PNGs. Magenta in a *working* file is OK; export must be transparent.

---

## 7. Aseprite setup (tell the artist)

1. New sprite → exact canvas size from the table.  
2. **Pixel perfect** on. Grid: 2×1 iso (Aseprite: custom grid 64×32 for floor items as a guide layer).  
3. Guide layer: draw the floor diamond(s) in a bright color, **hide/delete before export**.  
4. Palette: keep it small (~32–48 colors). Include ink `#0C080E`, hotel mint `#14F195`, gold `#F5C542`, purple `#9945FF`.  
5. Onion-skin rotations so SE and NW stay the same object.  
6. Export PNG: **Ignore background**, file format PNG.

---

## 8. How to hire (for you)

**Look for:** “isometric pixel art”, “Habbo-style” / “dimetric furniture”, Aseprite in the stack. Portfolio **must** show iso furniture or iso characters, not only 2D side-scrollers.

**Places:** Twitter/X `#pixelart` `#gamedev`, Pixel Joint, Lospec jobs, Upwork (filter pixel isometric), Fiverr (only with a strong iso portfolio — most will be wrong), art-station / freelance Discords (Pixel Prospector, r/gameDevClassifieds).

**Ask in the first message:**  
“Can you draw original dimetric 2:1 furniture that sits on 64×32 tiles, plus a layered 64×88 avatar rig (stand/sit/lay)? No copying Habbo sprites. Quote Phase 1 only.”

**Phase 1 quote (typical):** characters (2 bodies × 3 poses × 2 dirs + layers) + 10 furniture items × 2–4 rotations. Expect several hundred to a couple thousand USD depending on seniority. Pay a **small paid test** first: **mint stool + coral chair + boy stand SE (layered)** against this spec. If that test plants on a 64×32 diamond and the guest is ~64×88, hire for the rest.

**Revisions:** 2 rounds per piece included. Reject: anti-alias, baked floors, L-shaped 2×1 sofas, characters whose feet are not on y=78, clothes that don’t share the same torso.

---

## 9. What we will do on our side

Once files land in `public/art/`:

- Pixi draws the PNG (no stretching on X vs Y beyond fitting occupancy).  
- 1×1 small items stay small; 2×1 sofas span two tiles.  
- Sit pose + seat height so the guest sits **on** the furniture.  
- Recolor gray clothes/hair/skin from the in-game mixer.

Do not invent extra sizes. If a sofa is 2×1, draw a 2×1 sofa.

---

## 10. Contact line you can paste

> Hi — I need original Aseprite pixel art for a browser hotel game (dimetric 2:1, Habbo-*inspired* not a clone). Spec attached. Phase 1 is a layered 64×88 boy/girl rig (stand, sit, lay) plus 10 furniture items that snap to 64×32 floor tiles. Transparent PNG + .aseprite sources. Please send 2–3 iso pieces from your portfolio and a quote for Phase 1, plus a paid test (stool + chair + boy stand) if the style matches.
