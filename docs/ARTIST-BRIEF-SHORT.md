# HODL Hotel — art job (copy & send)

**Game:** browser hotel (Habbo-like rooms). Original art only — do **not** copy Habbo/Sulake sprites.

**Tool:** Aseprite (or LibreSprite). Deliver `.aseprite` + transparent PNGs.

---

## Style
- Early-2000s isometric hotel look
- 2:1 floor (2 px over, 1 px down)
- Big head, small body, black-dot eyes, cute
- Thick black outline (`#0C080E`)
- Flat colours, 3 tones (light top, mid left, dark right)
- No gradients, blur, shadows, or anti-alias
- Transparent background — **no floor diamond drawn under the object**

---

## Floor grid (engine)
- 1 tile = **64 × 32 px** diamond
- Height step = **16 px**
- Furniture occupies **whole tiles** (1×1, 2×1, 2×2…). No L-shapes that cut a corner

**How big to draw**
- 1×1 **stool** — small, ~28–36 px wide, **centred** on the tile (does not fill it)
- 1×1 **chair** — ~40–48 px wide
- 1×1 **lamp / plant** — skinny and tall
- 2×1 **sofa** — straight 2-seater, base ~88–96 px wide (fills two tiles). **Not an L-sofa**
- Bottom-centre of the PNG = feet. We plant that on the tile centre

**Rotations (furniture with a front):** `se` `sw` `nw` `ne`  
Symmetric stuff (round stool, plant) = 1 view is enough

---

## Characters
- Canvas **64 × 88**. Feet on **y = 78**
- 2 bodies: boy + girl (same size / same foot line)
- Poses: **stand, sit, lay**
- Dirs: **se** (front ¾) + **nw** (back). We can flip for the other two
- Sit = legs bent, looks **on** a chair, not standing in it

**Layers** (same skeleton so clothes swap):
- body (skin only)
- hair
- top
- bottom
- shoes

**Boy hair:** messy, side, afro, spikes, mohawk  
**Girl hair:** pony, bob, long, pigtails, bun  
**Tops:** hoodie, tee, jacket, tank  
**Boy bottoms:** pants, shorts, jeans  
**Girl bottoms:** skirt, pants, shorts  
**Shoes:** sneakers, boots, slides

Paint clothes/hair in **mid grey** (`#8C8C8C` + darker/lighter greys) so we can recolour in game. Keep black outlines and white highlights.

**Style lock (coloured preview sheets only):**
- Boy: brown messy hair, yellow hoodie, black pants, grey sneakers
- Girl: black bob, pink tank, black skirt, white sneakers

---

## Phase 1 only (quote this)

**Characters:** boy + girl, stand / sit / lay, se + nw, all layers above

**Furniture (10):**
- `stool_mint` — 1×1, small
- `chair_coral` — 1×1
- `armchair_teal` — 1×1
- `sofa_mint` — 2×1 straight sofa
- `bean_gold` — 1×1 small
- `bed_twin` — 1×2, sit + lay
- `table_coffee` — 1×1 low
- `lamp_floor` — 1×1 tall
- `plant_palm` — 1×1
- `rug_small` — 2×2 flat rug that covers the tiles

Then we do the rest of the shop if Phase 1 plants clean.

---

## Files
```
avatars/m/stand/se/body.png
avatars/m/stand/se/hair-messy.png
avatars/m/stand/se/top-hoodie.png
…same for sit/lay, nw, girl
furn/stool_mint/stool_mint_se.png
```
+ `.aseprite` sources

PNG = transparent, no magenta, no JPEG.

---

## Paid test (do this first)
1. mint stool  
2. coral chair  
3. boy stand SE, layered (body + 1 hair + hoodie + pants + shoes)

If those sit on a 64×32 diamond and the boy is 64×88 with feet at y=78, we hire for Phase 1.

---

## Message to the artist

> Hi — original Aseprite pixel art for a browser hotel game (dimetric 2:1, Habbo-inspired, not a clone).  
> Spec: https://github.com/cameroncmcnulty/hodl-hotel/blob/main/docs/ARTIST-BRIEF-SHORT.md  
> Need: layered 64×88 boy/girl (stand, sit, lay) + 10 furniture items on 64×32 tiles. Transparent PNG + .aseprite.  
> Please send 2–3 iso pieces from your portfolio, a quote for Phase 1, and if the style fits a paid test (stool + chair + boy stand).
