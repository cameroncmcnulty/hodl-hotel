const FROM = process.env.MAIL_FROM || "HODL Hotel <noreply@hodlhotel.app>";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://hodlhotel.app").replace(/\/$/, "");
}

export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, text }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("mail failed", res.status, err);
      return false;
    }
    return true;
  }
  console.log("[mail]", to, subject, text);
  return false;
}
