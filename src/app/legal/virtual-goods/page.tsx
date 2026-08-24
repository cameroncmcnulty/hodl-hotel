import { Legal } from "@/components/Legal";

export default function Page() {
  return (
    <Legal title="Virtual Goods Policy">
      <p>HODL Coins and furniture are licensed entertainment items. They do not represent ownership of the company, a claim on SOL held in treasury, or a right to cash out.</p>
      <p>Starter coins are a gift so you can furnish a first room. Purchased coins are delivered after we confirm your Solana transfer to the published treasury address. Wrong network, wrong amount, or spoofed signatures will not credit.</p>
      <p>Chargebacks and chain reorgs: if a credited payment later fails, we may remove coins or items. We do not reverse SOL ourselves.</p>
      <p>Trading items with other players is at your risk. We do not restore scammed furniture except in clear exploits we caused.</p>
      <p>Dice, arcade cabinets, and quests never convert winnings into withdrawable money.</p>
    </Legal>
  );
}
