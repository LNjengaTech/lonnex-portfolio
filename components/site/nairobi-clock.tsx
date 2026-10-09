"use client";

import { useEffect, useState } from "react";

/** Live Nairobi clock (EAT = UTC+3). Client-only. */
export function NairobiClock({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-KE", {
        timeZone: "Africa/Nairobi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <span className={className}>
      <span className="text-muted-foreground">NBO</span>{" "}
      <span className="tabular-nums">{time}</span>
    </span>
  );
}
