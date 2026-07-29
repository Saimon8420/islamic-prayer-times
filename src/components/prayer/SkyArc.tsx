import { useMemo } from "react";

/**
 * SkyArc — the signature of the Observatory design.
 * A stylised arc of the sun's path across the day (midnight → noon peak →
 * midnight). Each prayer sits on the arc at its real time; a glowing sun marks
 * the current moment. Everything is driven by data the app already computes —
 * no external libraries, no network.
 */

export interface SkyWaypoint {
  key: string;
  /** Short uppercase label shown under the point, e.g. "FAJR", "RISE". */
  label: string;
  time: Date;
}

interface SkyArcProps {
  waypoints: SkyWaypoint[];
  nextKey?: string;
  now: Date;
}

// Fraction of the day (0 at 00:00 → 1 at 24:00).
const dayFraction = (d: Date) =>
  (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;

// Arc geometry in a 0–100 box. Peak at midday, horizon near the bottom.
const HORIZON = 84;
const RISE = 70; // vertical travel from horizon to peak
const arcY = (frac: number) => HORIZON - Math.sin(frac * Math.PI) * RISE;
const clampX = (x: number) => Math.min(92, Math.max(8, x));

export const SkyArc = ({ waypoints, nextKey, now }: SkyArcProps) => {
  const nowFrac = dayFraction(now);

  // Dashed path sampled across the day.
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const f = i / 100;
      pts.push(`${i},${arcY(f).toFixed(2)}`);
    }
    return "M " + pts.join(" L ");
  }, []);

  return (
    <div className="relative h-32 w-full select-none sm:h-36" aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* the sun's path */}
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--sky-line) / 0.35)"
          strokeWidth="0.8"
          strokeDasharray="1.4 2.6"
          vectorEffect="non-scaling-stroke"
        />
        {/* horizon */}
        <line
          x1="0"
          y1={HORIZON}
          x2="100"
          y2={HORIZON}
          stroke="hsl(var(--sky-line) / 0.2)"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* waypoints + labels */}
      {waypoints.map((w) => {
        const f = dayFraction(w.time);
        const x = f * 100;
        const y = arcY(f);
        const isNext = w.key === nextKey;
        return (
          <div key={w.key}>
            <span
              className={
                "absolute block -translate-x-1/2 -translate-y-1/2 rounded-full " +
                (isNext
                  ? "next-pulse bg-secondary"
                  : "bg-[hsl(var(--sky-line)/0.55)]")
              }
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: isNext ? 8 : 5,
                height: isNext ? 8 : 5,
              }}
            />
            <span
              className={
                "sky-arc-label " + (isNext ? "!text-secondary" : "")
              }
              style={{ left: `${clampX(x)}%`, top: `${y + 7}%` }}
            >
              {w.label}
            </span>
          </div>
        );
      })}

      {/* the sun — current moment */}
      <span
        className="sky-arc-sun"
        style={{ left: `${nowFrac * 100}%`, top: `${arcY(nowFrac)}%` }}
      />
    </div>
  );
};
