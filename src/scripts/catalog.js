/** Edit collection copy, colors and prices here. Product IDs stay stable across releases. */
export const concepts = [
  { name: 'Depression', motif: 'Vertical tear trails', description: 'Fine vertical trails on a muted blue field.', color: '#52677d', keywords: 'blue rain' },
  { name: 'Bipolar', motif: 'Rising and falling ribbons', description: 'Rising and falling ribbons in lilac and amber.', color: '#69439a', keywords: 'purple wave lilac' },
  { name: 'ADHD', motif: 'Branching routes', description: 'Branching routes across lime and olive.', color: '#a4b943', keywords: 'green lime olive' },
  { name: 'Anger regulation', motif: 'Pressure and release', description: 'Pressure and release in oxblood and orange.', color: '#8b3038', keywords: 'red orange' },
  { name: 'OCD', motif: 'Returning loops', description: 'Returning taupe loops on warm ivory.', color: '#dfdacb', keywords: 'ivory cream taupe' },
  { name: 'Delusional disorder', motif: 'Shifted perspective', description: 'Shifted geometric perspectives on petrol green.', color: '#235c55', keywords: 'green geometry petrol' },
  { name: 'Schizophrenia', motif: 'Offset fragments', description: 'Offset circular fragments in lavender and mint.', color: '#9785b3', keywords: 'lavender mint circle' },
];
export const types = ['Accent', 'Placement', 'Bold', 'All-over'];
export const sizes = ['S', 'M', 'L', 'XL'];
export const products = concepts.map((concept, index) => ({
  id: index * 4 + 3, c: index, t: 3,
  name: `${concept.name} — Type D`, price: 38000,
}));
export const getProduct = id => products.find(product => product.id === Number(id));
export const asset = product => `assets/product-${product.c}-3.webp`;
export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
export function filterProducts({ query = '', sort = 'featured' } = {}) {
  const term = query.trim().toLowerCase();
  const result = products.filter(product => {
    const concept = concepts[product.c];
    return `${product.name} ${concept.motif} ${concept.description} ${concept.keywords}`.toLowerCase().includes(term);
  });
  if (sort === 'low') result.sort((a, b) => a.price - b.price);
  if (sort === 'high') result.sort((a, b) => b.price - a.price);
  if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
