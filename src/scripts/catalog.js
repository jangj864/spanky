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
    name: "ENO",
    motif: "Monochrome intensity",
    description:
      "Intricate monochrome artwork and ink-like textures across a black ground.",
    color: "#373739",
    keywords: "eno underground artist collaboration monochrome black ink",
  },
  {
    name: "CHAEMIN",
    motif: "Faces in flowing lines",
    description: "Expressive illustrated faces in lavender and deep teal.",
    color: "#233f49",
    keywords:
      "chaemin underground artist collaboration lavender teal faces illustration",
  },
  {
    name: "STACEY NAH",
    motif: "Everyday, reimagined",
    description:
      "A layered city scene with unexpected miniature figures in cool blue tones.",
    color: "#465b7b",
    keywords: "stacey nah underground artist collaboration city photo blue",
  },
  {
    name: "VELFONT",
    motif: "Color in collision",
    description:
      "Expressive collage and gestural marks across blue, yellow and orange panels.",
    color: "#dc842d",
    keywords:
      "velfont underground artist collaboration collage blue yellow orange",
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
  ...["eno", "chaemin", "stacey-nah", "velfont"].map((slug, index) => ({
    id: 300 + index,
    c: 7 + index,
    name: `SPANKY × ${concepts[7 + index].name}`,
    price: 15,
    collection: "special",
    hasBack: true,
    image: `assets/underground-${slug}-front.png`,
    backImage: `assets/underground-${slug}-back.png`,
  })),
);
export const getProduct = (id) =>
  Number(id) === 200
    ? {
        id: 200,
        name: "Your SPANKY design",
        price: 15,
        image: "assets/product-1-3.webp",
      }
    : products.find((product) => product.id === Number(id));
export const asset = (product, view = "front") =>
  view === "back" && product.backImage
    ? product.backImage
    : product.image
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
