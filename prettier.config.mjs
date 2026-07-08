/**
 * Prettier config. Defaults are kept (double quotes, semicolons, trailing
 * commas, 80-col) — they already match the scaffold's style.
 *
 * `prettier-plugin-tailwindcss` sorts Tailwind classes into canonical order;
 * `tailwindStylesheet` points it at our CSS-first token entry so it understands
 * the custom utilities (text-section, bg-brand, rounded-card, …).
 */
/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
};

export default config;
