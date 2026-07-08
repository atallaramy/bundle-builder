import type { SVGProps } from "react";
import type { IconName } from "@/lib/domain/types";

/**
 * Inline SVG icon set. Icons are UI, not data — the catalog only names them
 * (`IconName`); the actual paths live here so markup and colour stay in the
 * component layer. All draw with `currentColor` and inherit size from a
 * `className` (e.g. `size-5`), so a caller styles them like text.
 */

type IconGlyph = IconName | "chevron" | "truck" | "plus" | "minus";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function paths(name: IconGlyph) {
  switch (name) {
    case "camera":
      // Security camera: body, lens, and a viewfinder tick.
      return (
        <>
          <rect
            x="3.5"
            y="6"
            width="14"
            height="12"
            rx="2.5"
            {...strokeProps}
          />
          <circle cx="10.5" cy="12" r="3" {...strokeProps} />
          <path d="M17.5 9.5 21 8v8l-3.5-1.5" {...strokeProps} />
        </>
      );
    case "shield":
      return (
        <path
          d="M12 3 20 6v5.5c0 4.6-3.4 8-8 9.5-4.6-1.5-8-4.9-8-9.5V6Z"
          {...strokeProps}
        />
      );
    case "sensor":
      // Motion sensor: a dome with radiating detection arcs.
      return (
        <>
          <path d="M5 16a7 7 0 0 1 14 0" {...strokeProps} />
          <path d="M5 16h14" {...strokeProps} />
          <path d="M9.5 12.5a3.5 3.5 0 0 1 5 0" {...strokeProps} />
          <path d="M11.4 10.2a1.2 1.2 0 0 1 1.2 0" {...strokeProps} />
        </>
      );
    case "grid":
      // 3×3 dot grid.
      return (
        <>
          {[6.5, 12, 17.5].map((cy) =>
            [6.5, 12, 17.5].map((cx) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="1.35"
                fill="currentColor"
              />
            )),
          )}
        </>
      );
    case "chevron":
      return <path d="M6 9.5 12 15l6-5.5" {...strokeProps} />;
    case "truck":
      return (
        <>
          <path d="M2.5 6.5h11v9h-11z" {...strokeProps} />
          <path d="M13.5 9.5h3.2l2.8 3v3h-6z" {...strokeProps} />
          <circle cx="7" cy="17.5" r="1.6" {...strokeProps} />
          <circle cx="16.5" cy="17.5" r="1.6" {...strokeProps} />
        </>
      );
    case "plus":
      return <path d="M12 6v12M6 12h12" {...strokeProps} />;
    case "minus":
      return <path d="M6 12h12" {...strokeProps} />;
  }
}

export function Icon({
  name,
  ...props
}: { name: IconGlyph } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {paths(name)}
    </svg>
  );
}
