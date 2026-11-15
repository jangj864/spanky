import * as THREE from "../../assets/vendor/three.module.js";
import { OrbitControls } from "../../assets/vendor/OrbitControls.js";
import { defaultDesign, normalizeDesign } from "./design.js";
import { createCartStore } from "./cart.js";
const viewport = document.querySelector("#garmentViewport");
const form = document.querySelector("#customForm");
let renderer, scene, camera, controls, bodyMaterial, bandMaterial, logoMaterial;
let design = { ...defaultDesign };
const status = document.querySelector("#renderStatus");
function texture(canvas) {
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}
function paintFabric() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const c = canvas.getContext("2d");
  c.fillStyle = design.body;
  c.fillRect(0, 0, 1024, 1024);
  c.strokeStyle = design.accent;
  c.fillStyle = design.accent;
  c.lineWidth = 12;
  const spacing = 180 / design.scale;
  if (design.pattern === "waves")
    for (let y = -100; y < 1150; y += spacing) {
      c.beginPath();
      for (let x = 0; x <= 1024; x += 4) {
        const yy = y + Math.sin(x / 70) * 22;
        x ? c.lineTo(x, yy) : c.moveTo(x, yy);
      }
      c.stroke();
    }
  if (design.pattern === "grid")
    for (let n = 0; n < 1100; n += spacing) {
      c.fillRect(n, 0, 8, 1024);
      c.fillRect(0, n, 1024, 8);
    }
  if (design.pattern === "dots")
    for (let y = 0; y < 1100; y += spacing)
      for (let x = 0; x < 1100; x += spacing) {
        c.beginPath();
        c.arc(
          x + ((Math.round(y / spacing) % 2) * spacing) / 2,
          y,
          12,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
  // Fine woven grain gives the surface a textile finish without external maps.
  c.globalAlpha = 0.07;
  c.fillStyle = "#ffffff";
  for (let x = 0; x < 1024; x += 4) c.fillRect(x, 0, 1, 1024);
  c.globalAlpha = 1;
  return texture(canvas);
}
function update() {
  design = normalizeDesign(Object.fromEntries(new FormData(form))) || {
    ...defaultDesign,
  };
  bodyMaterial.map?.dispose();
  bodyMaterial.map = paintFabric();
  bodyMaterial.needsUpdate = true;
  bandMaterial.color.set(design.band);
  logoMaterial.color.set(design.logo);
  viewport.dataset.design = JSON.stringify(design);
}
function makeLeg(side) {
  const positions = [],
    uvs = [],
    indices = [];
  const rings = 30,
    segments = 96;
  for (let j = 0; j <= rings; j++) {
    const t = j / rings,
      y = 0.64 - t * 1.65;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const rx = 0.47 + 0.035 * Math.sin(t * Math.PI);
      const rz = 0.37 - 0.065 * t;
      const blend = Math.min(1, t / 0.45);
      const x =
        side * 0.94 * Math.max(0, side * Math.cos(angle)) * (1 - blend) +
        (side * 0.45 + rx * Math.cos(angle)) * blend;
      positions.push(
        x,
        y + 0.035 * Math.cos(angle * 3) * Math.sin(t * Math.PI),
        rz * Math.sin(angle),
      );
      uvs.push(i / segments, j / rings);
    }
  }
  for (let j = 0; j < rings; j++)
    for (let i = 0; i < segments; i++) {
      let a = j * (segments + 1) + i,
        b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return new THREE.Mesh(g, bodyMaterial);
}
function seam(points, group) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
  );
  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, 0.005, 6, false),
      new THREE.MeshStandardMaterial({ color: "#c9c3d5", roughness: 1 }),
    ),
  );
}
async function init() {
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0xeeeeea, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    viewport.append(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "3D boxer brief");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(2.3, 1.35, 4.5);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -0.05, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.7;
    controls.maxDistance = 7;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = 2.6;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x5d526a, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 5, 4);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0xc6b6ff, 3);
    rim.position.set(-3, 2, -4);
    scene.add(rim);
    bodyMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.92,
      side: THREE.DoubleSide,
    });
    bandMaterial = new THREE.MeshStandardMaterial({
      color: design.band,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    logoMaterial = new THREE.MeshStandardMaterial({
      color: design.logo,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const garment = new THREE.Group();
    scene.add(garment);
    garment.add(makeLeg(-1), makeLeg(1));
    const bandGeometry = new THREE.CylinderGeometry(1, 1, 0.29, 128, 1, true);
    bandGeometry.scale(0.94, 1, 0.4);
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.position.y = 0.72;
    garment.add(band);
    // Use the exact supplied vector wordmark as a transparent curved print.
    const logoImage = new Image();
    logoImage.src = "assets/logo.svg";
    await logoImage.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(logoImage, 0, 0, 2048, 256);
    const logoMap = texture(canvas);
    logoMaterial.map = logoMap;
    logoMaterial.transparent = true;
    // Convert the black vector to white while retaining alpha; material tint supplies chosen color.
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 2048, 256);
    logoMap.needsUpdate = true;
    const logoGeometry = new THREE.CylinderGeometry(
      1.003,
      1.003,
      0.17,
      64,
      1,
      true,
      -0.62,
      1.24,
    );
    logoGeometry.scale(0.94, 1, 0.4);
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.y = 0.73;
    garment.add(logo);
    seam(
      [
        [-0.26, 0.56, 0.35],
        [-0.24, 0.1, 0.38],
        [-0.18, -0.44, 0.35],
        [0, -0.65, 0.29],
        [0.18, -0.44, 0.35],
        [0.24, 0.1, 0.38],
        [0.26, 0.56, 0.35],
      ],
      garment,
    );
    for (const side of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        pts.push([side * 0.45 + 0.47 * Math.cos(a), -0.97, 0.31 * Math.sin(a)]);
      }
      seam(pts, garment);
    }
    const resize = () => {
      const w = viewport.clientWidth,
        h = viewport.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(viewport);
    resize();
    update();
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });
    status.textContent = "LIVE / 360°";
    viewport.dataset.ready = "true";
    document.querySelector("#addCustom").disabled = false;
  } catch (error) {
    status.textContent = "3D unavailable. Please enable WebGL and reload.";
    console.error(error);
  }
}
form.addEventListener("input", () => {
  if (bodyMaterial) update();
});
form.addEventListener("reset", () =>
  setTimeout(() => {
    update();
    controls.reset();
  }, 0),
);
document.querySelectorAll("[data-camera]").forEach((button) =>
  button.addEventListener("click", () => {
    if (!camera) return;
    const view = button.dataset.camera;
    camera.position.set(
      view === "reset" ? 2.3 : 0,
      view === "reset" ? 1.35 : 0.6,
      view === "back" ? -4.8 : 4.8,
    );
    controls.target.set(0, -0.05, 0);
    controls.update();
  }),
);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  let storage;
  try {
    storage = localStorage;
  } catch {}
  const cart = createCartStore(storage);
  cart.add(200, new FormData(form).get("size"), design);
  document.dispatchEvent(
    new CustomEvent("spanky:custom-added", { detail: cart.items() }),
  );
});
document.querySelector("#saveCustom").addEventListener("click", () => {
  if (!renderer) return;
  renderer.render(scene, camera);
  const a = document.createElement("a");
  a.download = "my-spanky-design.png";
  a.href = renderer.domElement.toDataURL("image/png");
  a.click();
});
init();
