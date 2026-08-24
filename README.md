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

Local coin testing: if no treasury wallet is set, the coin desk on localhost credits +500 test coins.

## Solana

Put your receiving address in `.env.local`:

```
TREASURY_WALLET=YourSolanaAddress
NEXT_PUBLIC_TREASURY_WALLET=YourSolanaAddress
```

Optional: `SOLANA_RPC_URL`, `HELIUS_API_KEY` (better NFT images).

Purchases require the player to be 18+ and a wallet (Phantom supported).

## Deploy

GitHub + Vercel, same as your other Next apps. Multiplayer presence is in-process (works on a single Node server / local). For many Vercel instances you’ll want a shared store later.

## IP

Original art, names, and UI. Gameplay is in the social-hotel genre; no Habbo assets, characters, or marks.
