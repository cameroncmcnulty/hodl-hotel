"use client";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function BirthdayFields({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const now = new Date();
  const maxYear = now.getFullYear() - 13;
  const minYear = now.getFullYear() - 100;
  const [y, m, d] = (value || "").split("-").map(Number);
  const year = y || 0;
  const month = m || 0;
  const day = d || 0;

  function set(nextY: number, nextM: number, nextD: number) {
    if (!nextY || !nextM || !nextD) {
      onChange("");
      return;
    }
    const dim = daysInMonth(nextY, nextM);
    const dd = Math.min(nextD, dim);
    onChange(`${nextY}-${String(nextM).padStart(2, "0")}-${String(dd).padStart(2, "0")}`);
  }

  const dim = year && month ? daysInMonth(year, month) : 31;

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm text-white/70">Birthday</legend>
      <div className="grid grid-cols-3 gap-2">
        <select
          className="field"
          value={month || ""}
          onChange={(e) => set(year, Number(e.target.value), day || 1)}
          aria-label="Month"
        >
          <option value="">Month</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          className="field"
          value={day || ""}
          onChange={(e) => set(year, month, Number(e.target.value))}
          aria-label="Day"
        >
          <option value="">Day</option>
          {Array.from({ length: dim }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          className="field"
          value={year || ""}
          onChange={(e) => set(Number(e.target.value), month, day || 1)}
          aria-label="Year"
        >
          <option value="">Year</option>
          {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-white/45">Used only to confirm you are 13+ to play and 18+ to buy coins with Solana.</p>
    </fieldset>
  );
}
