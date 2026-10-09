"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function NairobiLiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: "Africa/Nairobi",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);
        setTime(formatted);
      } catch {
        setTime("--:--:--");
      }
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-border text-xs font-mono text-foreground">
      <Clock className="w-3.5 h-3.5 text-primary" />
      <span>Nairobi: {time || "--:--:--"} (EAT, UTC+3)</span>
    </div>
  );
}
