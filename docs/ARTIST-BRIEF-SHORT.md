# HODL Hotel — art job (copy & send)

**Game:** browser hotel (Habbo-like rooms). Original art only. Do **not** copy Habbo/Sulake sprites.

**Tool:** Aseprite (or LibreSprite)  
**Deliver:** `.aseprite` sources + transparent PNGs

---

## Style
- 2:1 isometric (2 px over, 1 px down)
- Big head, small body, black-dot eyes, cute
- Thick black outline (`#0C080E`)
- Flat colours, 3 tones (light top / mid left / dark right)
- No gradients, blur, shadows, or anti-alias
- Transparent background — **no floor diamond under the object, no full wall baked behind wall art**

---

## Floor grid
- 1 tile = **64 × 32 px** diamond
- Slope: **2 px across, 1 px down**
- Height step = **16 px**
- Next tile is **32 px across and 16 px down**, not 64 across. Diamonds **share edges** (no gaps). A 64×32 box around one tile **overlaps** its neighbours — do not lay diamonds in a non-overlapping 64×32 rectangle grid
- Pieces occupy **whole tiles** only (1×1, 2×1, 2×2…). **No L-shapes** that cut a tile corner
- PNG **bottom-centre = feet**. We plant that on the centre of the occupied tiles
- Guide only: never bake the floor diamond into a furniture PNG

**How big to draw (visual, not the collision box)**
- 1×1 **stool / bean / pad** — small, ~28–36 px wide, **centred** (does not fill the tile)
- 1×1 **chair** — ~40–48 px wide
- 1×1 **lamp / plant / column** — skinny, tall
- 2×1 **sofa / desk / bench** — base ~88–96 px wide (fills two tiles). Straight, not L
- 2×2 **bed / table / rug** — covers the full 2×2 diamond
- 1×3 **runner rug** — long thin diamond

**Floor rotations:** `se` `sw` `nw` `ne`  
Round/symmetric (stool, plant, column, orb): 1 view is enough

---

## Wall art — snap + size (read this)

Wall pieces **only hang on the two back walls** of a room:
- **North wall** (along X) → file `_n.png`
- **West wall** (along Y) → file `_w.png`

The player’s cursor picks a floor tile **against that wall**, then one of **4 hang heights**:

| Height | Name | Rough px above floor |
|---|---|---|
| 0 | low (skirting) | ~17 |
| 1 | mid | ~42 |
| 2 | high | ~66 |
| 3 | near ceiling | ~91 |

You draw **one plaque per wall face**. We slide it up/down. Do **not** draw the hotel wall or the floor in the PNG.

**Canvas (transparent)**
- 1-tile wall piece (frame, mirror, dartboard, poster): **40 × 56 px**
- 2-tile wall piece (shillboard, neon bar, billboard): **72 × 48 px**
- Width must match the wall run: 1 tile ≈ **32 px** of wall, 2 tiles ≈ **64 px**. A little overhang is OK
- Anchor = **centre of the plaque** (not the feet)

**NFT frames:** empty inner rectangle (dark or wood inset). We paste the player’s NFT into that hole. Leave the hole **empty**.

---

## Shillboard (digital ticker) — special

This is a **2-tile wall board**. Player types letters; the **`$` never moves**.

Draw:
- Mint/purple LED cabinet, 2 tiles wide
- A **dark empty screen** in the middle (solid `#0B1220`, no letters drawn)
- We overlay in-game: **`$` fixed on the left of the screen**, then the letters they type (`BTC`, `SOL`, `HODL`…) in mint `#14F195`

Optional extra (nice, not required): a tiny pixel font sheet `ticker_font.png` — `$` plus A–Z and 0–9, each on a 7×9 cell, same mint colour. If you skip this, we use our own font on the empty screen.

Files: `shillboard_n.png` + `shillboard_w.png` (and optional `ticker_font.png`)

---

## Characters
- Canvas **64 × 88**. Feet on **y = 78**
- Boy + girl, same size
- Poses: stand, sit, lay
- Dirs: se (front ¾) + nw (back). We can flip the other two
- Sit = on the chair, not standing in it

**Layers:** body, hair, top, bottom, shoes  
Paint clothes/hair in mid-grey (`#8C8C8C` + shade greys) so we recolour. Keep black outlines + white highlights.

- Boy hair: messy, side, afro, spikes, mohawk
- Girl hair: pony, bob, long, pigtails, bun
- Tops: hoodie, tee, jacket, tank
- Boy bottoms: pants, shorts, jeans
- Girl bottoms: skirt, pants, shorts
- Shoes: sneakers, boots, slides

**Style lock (coloured preview sheets only):**
- Boy: brown messy hair, yellow hoodie, black pants, grey sneakers
- Girl: black bob, pink tank, black skirt, white sneakers

---

## Tiers
- **common** — starter hotel junk
- **uncommon** — a bit nicer
- **rare** — club / lobby flex
- **elite** — dark / special
- **gold** — gilt suite
- **crypto** — on-theme sculptures (not real logos if you can avoid trademark; stylised is fine)

---

## Phase 1 (quote this first)

Characters: boy + girl, stand/sit/lay, se+nw, all layers

Furniture:
- stool_mint 1×1 small
- chair_coral 1×1
- armchair_teal 1×1
- sofa_mint 2×1 straight sofa
- bean_gold 1×1 small
- bed_twin 1×2 sit+lay
- table_coffee 1×1 low
- lamp_floor 1×1 tall
- plant_palm 1×1
- rug_small 2×2
- marble_column 1×1
- marble_rail 1×1 (matches the column)
- shillboard 2×1 **wall** (empty screen, see above)
- frame_basic 1×1 **wall** (empty hole for NFT)

Paid test: mint stool + coral chair + boy stand (layered)

---

## Full shop list (draw all of these)

Format: `id` — name — tiles — notes. Floor unless it says **WALL**.

### Seating
- stool_mint — Mint Stool — 1×1 — small, centred
- stool_bar — Bar Stool — 1×1 — taller
- ottoman_cream — Cream Ottoman — 1×1 — small
- chair_fold — Fold Chair — 1×1 — cheap
- chair_coral — Coral Chair — 1×1
- chair_director — Director Chair — 1×1 — wood + canvas
- armchair_teal — Teal Armchair — 1×1
- recliner_navy — Navy Recliner — 1×1
- chair_gamer — Gamer Seat — 1×1 — mint piping, dark
- chair_wing — Plum Wingback — 1×1 — rare, high back
- throne_obsidian — Obsidian Throne — 1×1 — elite, gold bits
- bean_gold — Gold Beanbag — 1×1 — small
- bench_oak — Oak Bench — 2×1
- sofa_sunset — Sunset Sofa — 2×1 — straight 2-seat
- sofa_mint — Mint Club Sofa — 2×1
- loveseat_violet — Violet Loveseat — 2×1
- sofa_corner — Teal Sofa — 2×1 — **straight 2-seat, not L**
- sofa_gold — Gold Chesterfield — 2×1 — tufted
- lounger_pool — Deck Lounger — 1×2

### Beds
- bed_twin — Twin Cloud Bed — 1×2 — sit + lay
- bed_day — Daybed — 2×1
- bed_double — Double Drift Bed — 2×2 — sit + lay
- bed_canopy — Canopy Orbit Bed — 2×2 — four-poster
- bed_king_gold — King Gilt Bed — 2×2 — gold

### Tables
- table_coffee — Coffee Block — 1×1 — low
- table_glass — Glass Coffee — 1×1
- table_round — Cafe Round — 1×1
- nightstand — Nightstand — 1×1
- bar_table — High Bar — 1×1 — tall
- podium_sol — Mint Podium — 1×1
- table_desk — Builder Desk — 2×1
- console_gold — Gilt Console — 2×1
- table_picnic — Picnic Slab — 2×1
- table_dining — Dining Slab — 2×2

### Lighting
- lamp_desk — Desk Glow — 1×1 — short
- lamp_floor — Floor Lamp — 1×1
- lamp_lava — Lava Column — 1×1
- lantern_paper — Paper Lantern — 1×1
- lamp_sol — Solana Glow — 1×1
- chandelier — Chunk Chandelier — 1×1 — hangs (draw hanging, we plant on tile)
- neon_strip — Neon Bar — 2×1 **WALL** — thin bar
- lamp_gold — Gilt Torchere — 1×1
- candle_gold — Gilt Candelabra — 1×1 — 3 flames
- lamp_neon_tower — Neon Tower — 1×1 — tall

### Electronics
- radio_retro — Retro Radio — 1×1 — small
- laptop_mint — Mint Laptop — 1×1 — small, open
- computer — Build Box PC — 1×1
- projector_club — Club Projector — 1×1
- tv_block — Block TV — 2×1
- jukebox — Juke Tower — 1×1
- speaker_tower — Tower Speakers — 1×1
- disco_ball — Disco Orb — 1×1
- dj_booth — DJ Booth — 2×1

### Plants
- plant_flower — Flower Box — 1×1
- plant_cactus — Block Cactus — 1×1
- plant_hedge — Hedge Tile — 1×1 — fills tile
- plant_orchid — Orchid Pot — 1×1
- plant_monstera — Monstera Pot — 1×1
- plant_palm — Potted Palm — 1×1
- plant_bamboo — Bamboo Stand — 1×1 — tall
- bonsai_gold — Gold Bonsai — 1×1

### Rugs (flat, cover the diamonds, walkable)
- rug_small — Tile Rug — 2×2
- rug_large — Grand Rug — 3×3
- rug_neon — Runway Rug — 1×3
- rug_gold — Gold Runner — 1×3

### Kitchen
- toaster_chrome — Chrome Toaster — 1×1 — small
- ice_bucket — Ice Bucket — 1×1
- sink_block — Block Sink — 1×1
- coffee_machine — Espresso Block — 1×1
- fridge — Mini Fridge — 1×1
- minibar — Minibar — 2×1
- stove_suite — Suite Range — 2×1

### Structure / architecture
- crate_storage — Storage Crate — 1×1
- coat_rack — Coat Rack — 1×1 — tall, skinny
- locker_gym — Gym Locker — 1×1
- divider — Screen Divider — 2×1
- wardrobe — Wardrobe — 2×1
- bookshelf — Block Books — 2×1 — visible book spines
- safe_vault — Suite Safe — 1×1
- marble_column — Marble Column — 1×1 — tall, white stone (this is the pillar)
- **marble_rail — Marble Railing — 1×1 — SAME stone as the column, low fence, sits on one tile edge so you can chain them into a balcony**
- **marble_rail_long — Marble Rail Run — 2×1 — same style, two tiles**
- **gold_rail — Gilt Railing — 1×1 — matches gold suite**
- **gold_rail_long — Gilt Rail Run — 2×1**
- **wood_rail — Oak Railing — 1×1**
- **neon_rail — Neon Railing — 1×1 — mint/purple, club**
- pillar_neon — Neon Pillar — 1×1 — matches neon rail
- fireplace_gold — Gilt Hearth — 2×1

### Crypto / flex
- statue_btc — Orange Diamond — 1×1 — stylised, not the real logo if you can avoid it
- statue_sol — Mint Prism — 1×1
- nft_plinth — NFT Plinth — 1×1 — empty stand
- gold_stack — Gold Stack — 1×1 — 3 bars
- moon_bag — Moon Bag — 1×1 — sittable
- hologram_orb — Hologram Orb — 1×1
- satoshi_bust — Founder Bust — 1×1
- laser_eyes — Laser Pedestal — 1×1
- whale_plush — Whale Plush — 2×1 — sittable
- mining_rig — Mining Rig — 2×1
- crystal_tree — Crystal Tree — 2×2
- ledger_altar — Ledger Altar — 1×1
- sol_obelisk — Sol Obelisk — 1×1 — very tall
- bitcoin_furnace — Hash Furnace — 2×1
- **shillboard — Shillboard — 2×1 WALL — empty LED screen, `$` is overlaid in engine (see above)**

### Decor
- clock_block — Block Clock — 1×1
- globe_desk — Desk Globe — 1×1
- statue_cat — Lobby Cat — 1×1
- vase_rare — Mint Vase — 1×1
- trophy_cup — Hotel Cup — 1×1
- velvet_rope — Velvet Rope — 2×1 — two posts + rope
- fountain — Courtyard Fountain — 2×2
- mirror_suite — Suite Mirror — 1×1 **WALL**

### Games
- chess_table — Chess Block — 1×1
- dice_machine — Dice Machine — 1×1
- dart_board — Dart Board — 1×1 **WALL**
- arcade_cab — Cabinet — 1×1
- foosball — Foos Table — 2×1
- poker_table — Felt Table — 2×2
- pool_table — Pool Table — 2×2

### Utility
- teleporter — Pad Teleporter — 1×1 — walkable pad
- ad_board — Billboard — 2×1 **WALL** — empty ad face (hotel uses it; keep a blank screen)

### Wall frames (NFT hole empty)
- frame_basic — Plain Frame — 1×1 **WALL**
- frame_teak — Teak Frame — 1×1 **WALL**
- frame_neon — Neon Frame — 1×1 **WALL**
- frame_gold — Gold Frame — 1×1 **WALL**
- frame_obsidian — Obsidian Frame — 1×1 **WALL**

### Outdoor
- pool_float — Pool Float — 1×1 — small ring
- umbrella — Deck Umbrella — 1×1
- grill_deck — Deck Grill — 1×1
- hammock — Palm Hammock — 2×1
- firepit — Fire Pit — 1×1
- cabana_bed — Cabana Daybed — 2×2

### Skip (not sprites)
- Wallpaper + floor *finishes* (`paper_*`, `floor_*`) — we tint the room, no PNG

---

## Files
```
avatars/m/stand/se/body.png
avatars/m/stand/se/top-hoodie.png
furn/stool_mint/stool_mint_se.png
furn/shillboard/shillboard_n.png
furn/shillboard/shillboard_w.png
furn/frame_basic/frame_basic_n.png
furn/marble_rail/marble_rail_se.png
```

PNG = transparent, no magenta, no JPEG.

---

## Message to the artist

> Hi — original Aseprite pixel art for a browser hotel game (dimetric 2:1, Habbo-inspired, not a clone).  
> Spec: https://github.com/cameroncmcnulty/hodl-hotel/blob/main/docs/ARTIST-BRIEF-SHORT.md  
> Need layered 64×88 boy/girl (stand, sit, lay) plus the full furniture list in that doc (start with Phase 1). Wall items have special snap/size rules. Shillboard is a 2-tile wall LED with an empty screen — we overlay a fixed $ and player letters. Transparent PNG + .aseprite.  
> Please send 2–3 iso pieces from your portfolio, a quote for Phase 1, and if the style fits a paid test (stool + chair + boy stand).
