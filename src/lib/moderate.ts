const RAW = [
  "fuck","fucker","fucking","fucked","shit","shitty","asshole","bitch","bastard","dick","cock","pussy",
  "cunt","slut","whore","fag","faggot","nigger","nigga","retard","rape","rapist","porn","porno","nude",
  "nudes","onlyfans","kill yourself","kys","suicide","molest","pedo","paedo","pedophile","incest",
  "hentai","xxx","boob","boobs","tits","anal","oral","cum","jizz","wank","handjob","blowjob",
  "sex","sexy","horny","dildo","viagra","cocaine","heroin","meth",
];

const BLOCK = new Set(RAW);

function squash(s: string) {
  return s
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3€]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/(.)\1{2,}/g, "$1$1");
}

/** Replace a flagged token with HODL (keeps brand voice in chat bubbles). */
export function bleepWord(_word: string) {
  return "HODL";
}

export function moderate(input: string): { text: string; flagged: boolean } {
  const parts = input.split(/(\s+)/);
  let flagged = false;
  const out = parts.map((p) => {
    if (/^\s+$/.test(p)) return p;
    const q = squash(p);
    if (!q) return p;
    for (const bad of BLOCK) {
      if (q === bad || q.includes(bad)) {
        flagged = true;
        return "HODL";
      }
    }
    return p;
  });
  let text = out.join("").slice(0, 80);
  if (/(https?:\/\/|www\.)/i.test(text)) {
    text = text.replace(/https?:\/\/\S+/gi, "[link removed]").replace(/www\.\S+/gi, "[link removed]");
    flagged = true;
  }
  return { text, flagged };
}

export function ageYears(birthday: string) {
  const b = new Date(birthday + "T00:00:00");
  if (Number.isNaN(b.getTime())) return 0;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
}
