"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { formatTimeLeft } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: Date | string;
  onEnd?: () => void;
  size?: "sm" | "md" | "lg";
}

export function CountdownTimer({ endTime, onEnd, size = "md" }: CountdownTimerProps) {
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  const [timeData, setTimeData] = useState(() => formatTimeLeft(end));

  const tick = useCallback(() => {
    const data = formatTimeLeft(end);
    setTimeData(data);
    if (data.urgency === "ended" && onEnd) {
      onEnd();
    }
  }, [end, onEnd]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const colorMap = {
    normal: "hsl(142 71% 45%)",
    soon: "hsl(38 92% 55%)",
    critical: "hsl(0 84% 60%)",
    ended: "hsl(215 20% 45%)",
  };

  const bgMap = {
    normal: "rgba(34, 197, 94, 0.1)",
    soon: "rgba(245, 158, 11, 0.1)",
    critical: "rgba(239, 68, 68, 0.1)",
    ended: "rgba(100, 116, 139, 0.1)",
  };

  const borderMap = {
    normal: "rgba(34, 197, 94, 0.2)",
    soon: "rgba(245, 158, 11, 0.2)",
    critical: "rgba(239, 68, 68, 0.2)",
    ended: "rgba(100, 116, 139, 0.2)",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };

  const iconSizes = { sm: "w-3 h-3", md: "w-3.5 h-3.5", lg: "w-4 h-4" };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold font-mono ${sizeClasses[size]} ${
        timeData.urgency === "critical" ? "animate-countdown" : ""
      }`}
      style={{
        color: colorMap[timeData.urgency],
        background: bgMap[timeData.urgency],
        border: `1px solid ${borderMap[timeData.urgency]}`,
      }}
    >
      <Clock className={iconSizes[size]} />
      {timeData.label}
    </span>
  );
}

// Expanded countdown for auction detail page
export function CountdownDisplay({ endTime, onEnd }: { endTime: Date | string; onEnd?: () => void }) {
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  const [timeData, setTimeData] = useState(() => formatTimeLeft(end));
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const data = formatTimeLeft(end);
      setTimeData(data);

      const secs = data.seconds;
      setParts({
        d: Math.floor(secs / 86400),
        h: Math.floor((secs % 86400) / 3600),
        m: Math.floor((secs % 3600) / 60),
        s: secs % 60,
      });

      if (data.urgency === "ended" && onEnd) {
        onEnd();
      }
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [end, onEnd]);

  if (timeData.urgency === "ended") {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)" }}
      >
        <p className="text-lg font-bold" style={{ color: "hsl(215 20% 55%)" }}>
          Auction Ended
        </p>
      </div>
    );
  }

  const color =
    timeData.urgency === "critical"
      ? "hsl(0 84% 60%)"
      : timeData.urgency === "soon"
      ? "hsl(38 92% 55%)"
      : "hsl(142 71% 45%)";

  const unitLabels = ["Days", "Hours", "Mins", "Secs"];
  const unitValues = [parts.d, parts.h, parts.m, parts.s];

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background:
          timeData.urgency === "critical"
            ? "rgba(239,68,68,0.08)"
            : "rgba(255,255,255,0.03)",
        border: `1px solid ${
          timeData.urgency === "critical"
            ? "rgba(239,68,68,0.2)"
            : "rgba(255,255,255,0.08)"
        }`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" style={{ color }} />
        <p className="text-sm font-medium" style={{ color }}>
          {timeData.urgency === "critical" ? "Ending Very Soon!" : "Time Remaining"}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {unitValues.map((val, i) => (
          <div key={unitLabels[i]} className="text-center">
            <div
              className="text-2xl font-bold font-mono mb-1 rounded-lg py-2"
              style={{
                color,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {String(val).padStart(2, "0")}
            </div>
            <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>
              {unitLabels[i]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
