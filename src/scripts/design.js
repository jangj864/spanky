export const defaultDesign = {
  body: "#5946ff",
  band: "#171719",
  logo: "#00e82b",
  accent: "#c8b6ff",
  pattern: "waves",
  scale: 2,
};
export function normalizeDesign(value) {
  if (!value || typeof value !== "object") return null;
  const design = {};
  for (const key of ["body", "band", "logo", "accent"]) {
    if (!/^#[0-9a-f]{6}$/i.test(value[key])) return null;
    design[key] = value[key].toLowerCase();
  }
  if (!["waves", "grid", "dots", "solid"].includes(value.pattern)) return null;
  if (![1, 2, 3, 4].includes(Number(value.scale))) return null;
  return { ...design, pattern: value.pattern, scale: Number(value.scale) };
}
export const designKey = (design) => (design ? JSON.stringify(design) : "");

export function designThumbnail(design) {
  const { body, band, logo, accent, pattern, scale } = design;
  const spacing = 40 / scale;
  const marks =
    pattern === "solid"
      ? ""
      : pattern === "dots"
        ? `<circle cx="10" cy="10" r="4" fill="${accent}"/>`
        : pattern === "grid"
          ? `<path d="M0 0H${spacing}V${spacing}" fill="none" stroke="${accent}" stroke-width="3"/>`
          : `<path d="M-10 10Q0 0 10 10T30 10T50 10" fill="none" stroke="${accent}" stroke-width="3"/>`;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180"><defs><pattern id="p" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">${marks}</pattern><clipPath id="c"><path d="M25 25H175L185 155H110L100 120L90 155H15Z"/></clipPath></defs><path d="M25 25H175L185 155H110L100 120L90 155H15Z" fill="${body}"/><rect width="200" height="180" fill="url(#p)" clip-path="url(#c)"/><path d="M25 25H175V55H25Z" fill="${band}"/><text x="100" y="47" text-anchor="middle" fill="${logo}" font-family="Arial" font-size="23" font-weight="bold">spanky</text></svg>`)}`;
}
