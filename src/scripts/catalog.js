/** Edit collection copy, colors and prices here. Product IDs stay stable across releases. */
export const concepts = [
  {
    name: "Depression",
    motif: "Vertical tear trails",
    description: "Fine vertical trails on a muted blue field.",
    color: "#52677d",
    keywords: "blue rain",
  },
  {
    name: "Bipolar",
    motif: "Rising and falling ribbons",
    description: "Rising and falling ribbons in lilac and amber.",
    color: "#69439a",
    keywords: "purple wave lilac",
  },
  {
    name: "ADHD",
    motif: "Branching routes",
    description: "Branching routes across lime and olive.",
    color: "#a4b943",
    keywords: "green lime olive",
  },
  {
    name: "Anger regulation",
    motif: "Pressure and release",
    description: "Pressure and release in oxblood and orange.",
    color: "#8b3038",
    keywords: "red orange",
  },
  {
    name: "OCD",
    motif: "Returning loops",
    description: "Returning taupe loops on warm ivory.",
    color: "#dfdacb",
    keywords: "ivory cream taupe",
  },
  {
    name: "Delusional disorder",
    motif: "Shifted perspective",
    description: "Shifted geometric perspectives on petrol green.",
    color: "#235c55",
    keywords: "green geometry petrol",
  },
  {
    name: "Schizophrenia",
    motif: "Offset fragments",
    description: "Offset circular fragments in lavender and mint.",
    color: "#9785b3",
    keywords: "lavender mint circle",
  },
];
concepts.push(
  {
    name: "Keith Haring",
    motif: "Figures in motion",
    description:
      "Bold outlined figures and primary colors on a warm ivory ground.",
    color: "#f8ce2e",
    keywords: "haring keith special collaboration ivory red yellow blue",
  },
  {
    name: "Jean-Michel Basquiat",
    motif: "Color, crowns and raw marks",
    description:
      "Layered marks, crowns and expressive color across an ochre ground.",
    color: "#e7a62d",
    keywords: "basquiat jean michel special collaboration crown ochre yellow",
  },
  {
    name: "Kaikai Kiki",
    motif: "A field of smiling flowers",
    description:
      "Multicolored smiling flowers with a deep purple waistband and pink signature.",
    color: "#e67db5",
    keywords:
      "kaikai kiki kaikaikiki special collaboration flowers pink rainbow",
  },
  {
    name: "KAWS",
    motif: "Soft tones, bold characters",
    description:
      "Graphic characters in grey, lavender and pink with a dark signature waistband.",
    color: "#b69ac7",
    keywords: "kaws special collaboration grey lavender pink character",
  },
);
export const sizes = ["S", "M", "L", "XL"];
export const products = concepts.slice(0, 7).map((concept, index) => ({
  id: index * 4 + 3,
  c: index,
  t: 3,
  name: `${concept.name}`,
  price: 15,
  collection: "core",
  hasBack: true,
}));
products.push(
  ...["haring", "basquiat", "kaikaikiki", "kaws"].map((slug, index) => ({
    id: 100 + index,
    c: 7 + index,
    name: `SPANKY × ${concepts[7 + index].name}`,
    price: 15,
    collection: "special",
    hasBack: false,
    image: `assets/special-${slug}.png`,
  })),
);
export const getProduct = (id) =>
  products.find((product) => product.id === Number(id));
export const asset = (product, view = "front") =>
  product.image
    ? product.image
    : view === "back"
      ? `assets/product-${product.c}-back.png`
      : `assets/product-${product.c}-3.webp`;
export const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
export function filterProducts({
  query = "",
  sort = "featured",
  collection = "all",
} = {}) {
  const term = query.trim().toLowerCase();
  const result = products.filter((product) => {
    const concept = concepts[product.c];
    if (collection !== "all" && product.collection !== collection) return false;
    return `${product.name} ${concept.motif} ${concept.description} ${concept.keywords}`
      .toLowerCase()
      .includes(term);
  });
  if (sort === "low") result.sort((a, b) => a.price - b.price);
  if (sort === "high") result.sort((a, b) => b.price - a.price);
  if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
