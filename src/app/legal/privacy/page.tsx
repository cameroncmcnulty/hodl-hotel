import { Legal } from "@/components/Legal";

export default function Page() {
  return (
    <Legal title="Privacy Policy">
      <p>We collect the account data you give us (email, username, birthday year, password hash), session cookies, in-game chat and room activity, optional wallet addresses, and Solana transaction signatures you submit so we can credit coins. We do not sell personal information.</p>
      <h2>Why</h2>
      <p>To run the hotel, keep it safe, process virtual-good purchases, debug, and meet legal duties. Birthday is used only for age gates (13+ play, 18+ payments).</p>
      <h2>Cookies</h2>
      <p>An httpOnly session cookie keeps you signed in. See Cookies. Analytics, if added later, will be optional.</p>
      <h2>Retention</h2>
      <p>Accounts stay until you ask deletion (we may keep ban records and payment receipts as required by law). Chat in public rooms is transient operational data.</p>
      <h2>Your rights</h2>
      <p>Depending on where you live (including Canada / PIPEDA and similar regimes) you may request access, correction, or deletion of your personal information. Email the operator. We may refuse requests that would break security or another person’s privacy.</p>
      <h2>Processors</h2>
      <p>Hosting (e.g. Vercel), Solana RPC providers, and email if configured. Public blockchains are globally visible; do not put secrets in memos.</p>
      <h2>Children</h2>
      <p>Not directed at children under 13. We delete under-age accounts if we learn of them.</p>
    </Legal>
  );
}
