import * as THREE from "../../assets/vendor/three.module.js";
// Two sewn half shells meet at the rise; the upper loops share the waist oval.
// All detailing samples this surface, keeping hems and stitches on the cloth.
export function clothPoint(side, t, a, offset = 0) {
  const blend = THREE.MathUtils.smoothstep(t, 0.72, 0.98);
  const width = 0.94 + 0.08 * Math.sin((t * Math.PI) / 2);
  const xTop = side * width * Math.max(0, side * Math.cos(a));
  const xLeg = side * 0.515 + (0.49 + 0.004 * Math.sin(t * 4)) * Math.cos(a);
  const x = THREE.MathUtils.lerp(xTop, xLeg, blend);
  const depth = 0.405 - 0.055 * t;
  let z = depth * Math.sin(a);
  const front = Math.max(0, Math.sin(a));
  const pouch =
    0.11 *
    Math.exp(-Math.pow(x / 0.29, 2) - Math.pow((t - 0.48) / 0.29, 2)) *
    Math.pow(front, 5);
  // Gathered fabric at the elastic relaxes into softer, long folds below it.
  const gather = 0.009 * Math.sin(a * 38 + side * 0.7) * Math.exp(-t * 7);
  const drape =
    0.004 * Math.sin(a * 15 + t * 5) * Math.sin(t * Math.PI) +
    0.002 * Math.sin(a * 27 - t * 11) * Math.sin(t * Math.PI);
  const seat =
    0.045 *
    Math.exp(-Math.pow((t - 0.42) / 0.32, 2)) *
    Math.pow(Math.max(0, -Math.sin(a)), 4);
  z += (gather + drape) * Math.sin(a) + pouch - seat;
  const y =
    0.57 - t * 1.62 + 0.004 * Math.sin(a * 3 + t * 4) * Math.sin(t * Math.PI);
  return new THREE.Vector3(
    x + offset * Math.cos(a),
    y,
    z + offset * Math.sin(a),
  );
}
function shell(side, material) {
  const points = [],
    uv = [],
    index = [];
  const rings = 80,
    n = 160;
  for (let j = 0; j <= rings; j++)
    for (let i = 0; i <= n; i++) {
      const t = j / rings,
        a = (i / n) * Math.PI * 2,
        p = clothPoint(side, t, a);
      points.push(p.x, p.y, p.z);
      uv.push((side < 0 ? 0 : 0.5) + (i / n) * 0.5, t);
    }
  for (let j = 0; j < rings; j++)
    for (let i = 0; i < n; i++) {
      // Above the crotch, the two half-shells share an open interior.
      // Do not render the collapsed inner arcs as a dividing wall.
      const angle = ((i + 0.5) / n) * Math.PI * 2;
      if (side * Math.cos(angle) < 0 && j / rings < 0.72) continue;
      const a = j * (n + 1) + i,
        b = a + n + 1;
      index.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return new THREE.Mesh(g, material);
}
function line(points, material, radius = 0.0022) {
  return new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      Math.max(64, points.length * 2),
      radius,
      5,
      false,
    ),
    material,
  );
}
export function buildGarment(body, band, thread) {
  const group = new THREE.Group();
  group.add(shell(-1, body), shell(1, body));
  // A curved, closed ribbon has a visible inner face and softened rolled edges.
  const points = [];
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    points.push(
      new THREE.Vector3(0.94 * Math.sin(a), 0.72, 0.405 * Math.cos(a)),
    );
  }
  const pos = [],
    uv = [],
    idx = [];
  const n = 160;
  for (let row = 0; row < 4; row++)
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2,
        inner = row >= 2;
      const top = row === 1 || row === 2;
      pos.push(
        (inner ? 0.924 : 0.944) * Math.sin(a),
        top ? 0.875 : 0.565,
        (inner ? 0.39 : 0.41) * Math.cos(a),
      );
      uv.push(i / n, top ? 1 : 0);
    }
  for (let row = 0; row < 4; row++)
    for (let i = 0; i < n; i++) {
      const a = row * (n + 1) + i,
        b = ((row + 1) % 4) * (n + 1) + i;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  geometry.computeVertexNormals();
  group.add(new THREE.Mesh(geometry, band));
  for (const y of [0.57, 0.87]) {
    const edge = points.map((p) => new THREE.Vector3(p.x, y, p.z));
    group.add(line(edge, band, 0.005));
  }
  for (const side of [-1, 1]) {
    for (const t of [0.965, 0.984]) {
      const hem = [];
      for (let i = 0; i <= 160; i++)
        hem.push(clothPoint(side, t, (i / 160) * Math.PI * 2, 0.003));
      group.add(line(hem, thread));
    }
    // Curved front pouch seams flow into the crotch instead of floating above it.
    for (const shift of [-0.007, 0.007]) {
      const seam = [];
      for (let j = 0; j <= 70; j++) {
        const t = (j / 70) * 0.78;
        const targetX = side * (0.26 * (1 - Math.pow(t / 0.85, 2))) + shift;
        let best = null,
          error = Infinity;
        for (let i = 0; i <= 400; i++) {
          const p = clothPoint(side, t, (i / 400) * Math.PI);
          const e = Math.abs(p.x - targetX);
          if (e < error) {
            error = e;
            best = p;
          }
        }
        best.z += 0.004;
        seam.push(best);
      }
      group.add(line(seam, thread, 0.0018));
    }
  }
  return group;
}
export function fabricRelief(band = false) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d");
  const pixels = c.createImageData(512, 512);
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      const i = (y * 512 + x) * 4;
      const value =
        128 +
        25 * Math.sin(x * Math.PI) * (band ? 1 : 0.4) +
        22 * Math.sin((y * Math.PI) / 2) +
        12 * Math.sin(((x + y) * Math.PI) / 2);
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
  c.putImageData(pixels, 0, 0);
  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(band ? 12 : 7, band ? 2 : 7);
  return map;
}
