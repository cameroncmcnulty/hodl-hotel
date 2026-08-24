import { Legal } from "@/components/Legal";

export default function Page() {
  return (
    <Legal title="Cookies">
      <p>We use a single essential cookie, <code>hodl_session</code>, to keep you logged in. It is httpOnly, SameSite=Lax, and lasts about 14 days. You can clear it by signing out or deleting site cookies. The game will not work while signed out.</p>
    </Legal>
  );
}
