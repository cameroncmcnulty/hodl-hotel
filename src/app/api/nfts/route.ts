import { NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { findUser, loadDB } from "@/lib/store";

export async function GET(req: Request) {
  const id = await sessionUserId();
  if (!id) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const db = loadDB();
  const u = findUser(db, id);
  const wallet = new URL(req.url).searchParams.get("wallet") || u?.wallet || "";
  if (!wallet) return NextResponse.json({ nfts: [] });

  const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const helius = process.env.HELIUS_API_KEY;
  if (helius) {
    const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${helius}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "nfts",
        method: "getAssetsByOwner",
        params: { ownerAddress: wallet, page: 1, limit: 40 },
      }),
    });
    const j = await r.json();
    const nfts = (j.result?.items || []).map((a: { id: string; content?: { json_uri?: string; links?: { image?: string }; metadata?: { name?: string } } }) => ({
      mint: a.id,
      name: a.content?.metadata?.name || "NFT",
      image: a.content?.links?.image || "",
    }));
    return NextResponse.json({ nfts });
  }

  const r = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getParsedTokenAccountsByOwner",
      params: [wallet, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }],
    }),
  });
  const j = await r.json();
  const nfts = (j.result?.value || [])
    .map((v: { account: { data: { parsed: { info: { tokenAmount: { decimals: number; uiAmount: number }; mint: string } } } } }) => {
      const info = v.account.data.parsed.info;
      if (info.tokenAmount.decimals !== 0 || info.tokenAmount.uiAmount !== 1) return null;
      return { mint: info.mint, name: "Solana NFT", image: "" };
    })
    .filter(Boolean)
    .slice(0, 40);
  return NextResponse.json({ nfts });
}
