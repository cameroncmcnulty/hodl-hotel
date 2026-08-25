"use client";

import { useMemo, useState } from "react";
import { ageYears } from "@/lib/moderate";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, month: number) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

const selectClass =
  "field bg-[#1b1433] text-white [color-scheme:dark] [&_option]:bg-[#1b1433] [&_option]:text-white";

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
  const parsed = (value || "").split("-");
  const [month, setMonth] = useState(Number(parsed[1]) || 0);
  const [day, setDay] = useState(Number(parsed[2]) || 0);
  const [year, setYear] = useState(Number(parsed[0]) || 0);

  const dim = daysInMonth(year || maxYear, month);

  function commit(nextY: number, nextM: number, nextD: number) {
    setYear(nextY);
    setMonth(nextM);
    const maxD = daysInMonth(nextY || maxYear, nextM);
    const d = nextD > maxD ? maxD : nextD;
    setDay(d);
    if (nextY && nextM && d) {
      onChange(`${nextY}-${String(nextM).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    } else {
      onChange("");
    }
  }

  const yearsOld = useMemo(() => (value ? ageYears(value) : 0), [value]);

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-semibold text-white">Birthday</legend>
      <div className="grid grid-cols-3 gap-2">
        <select
          className={selectClass}
          value={month || ""}
          onChange={(e) => commit(year, Number(e.target.value) || 0, day || 1)}
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
          className={selectClass}
          value={day || ""}
          onChange={(e) => commit(year, month, Number(e.target.value) || 0)}
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
          className={selectClass}
          value={year || ""}
          onChange={(e) => commit(Number(e.target.value) || 0, month, day || 1)}
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
      {yearsOld >= 13 ? (
        <p className="text-xs text-mint">
          {yearsOld < 18
            ? `${yearsOld} years old — you can play with a parent’s permission. Coin packs with Solana are 18+.`
            : `${yearsOld} years old — you can play and buy coin packs.`}
        </p>
      ) : value ? (
        <p className="text-xs text-coral">You must be 13 or older to create an account.</p>
      ) : (
        <p className="text-xs text-white/55">Pick month, day, then year. Used only for the age gate.</p>
      )}
    </fieldset>
  );
}
