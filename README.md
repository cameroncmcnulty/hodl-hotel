# HODL Hotel

Cartoon social hotel (original — not affiliated with Habbo/Sulake). Decorate rooms, chat, trade furniture, hang NFTs, rent SHILL ZONE boards. Coins are bought with Solana.

## Local

```bash
cd hodl-hotel
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Guest signup: `/join` (13+)
- Play: `/play`
- Hotel desk: `/admin`

Default desk login (change after first run):

- email: `admin@hodlhotel.local`
- password: see `.env.local` → `ADMIN_PASSWORD`

Local coin testing: Wallet app → “Local test: +500 coins” on localhost.

## Solana

Coin packs open a **unique desk wallet** for that purchase. The guest sends the listed SOL to that address. When the hotel sees it on-chain, it forwards the SOL to the treasury and credits the coins.

```
TREASURY_WALLET=DFpam8jgBo1gqJ2aoUs3n7SVaptDEHSBxiZKFg3Fz3JN
NEXT_PUBLIC_TREASURY_WALLET=DFpam8jgBo1gqJ2aoUs3n7SVaptDEHSBxiZKFg3Fz3JN
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PAYMENT_SECRET=long-random-string
```

`PAYMENT_SECRET` encrypts per-ticket deposit keys. Tickets expire after 20 minutes. Purchases require the player to be 18+.

Optional: `HELIUS_API_KEY` (better NFT images).

## Deploy

GitHub + Vercel, same as your other Next apps. Multiplayer presence is in-process (works on a single Node server / local). For many Vercel instances you’ll want a shared store later.

## IP

Original art, names, and UI. Gameplay is in the social-hotel genre; no Habbo assets, characters, or marks.
