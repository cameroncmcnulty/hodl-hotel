import { Legal } from "@/components/Legal";

export default function Page() {
  return (
    <Legal title="Privacy Policy">
      <p>Last updated: 24 August 2026. We collect the account data you give us (email, username, full birthday for age gates, password hash), records of your consent to these policies, a session cookie, in-game chat and room activity, optional wallet addresses, and Solana transaction signatures you submit so we can credit coins. We do not sell personal information. We aim to follow PIPEDA and substantially similar Canadian provincial privacy laws.</p>
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
      <h2>Lawful basis / purpose</h2>
      <p>We process data to perform the account contract, keep the hotel safe, meet legal duties (including tax or fraud rules if they apply), and — only if you opt in later — marketing. Birthday is used for age gates, not as a public profile field.</p>
      <h2>Children</h2>
      <p>Not directed at children under 13. We delete under-age accounts if we learn of them. 13–17 year olds play with guardian permission and cannot complete crypto purchases.</p>
      <h2>Contact</h2>
      <p>Privacy requests: the operator of HODL Hotel, reachable at the contact email published on hodlhotel.app (or in-game reports). We will respond within the time PIPEDA expects where it applies.</p>
    </Legal>
  );
}
