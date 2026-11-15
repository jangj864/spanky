import { buildGarment, fabricRelief } from "./garment.js";
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
  bodyMaterial.userData.thread.color.set(design.body).multiplyScalar(0.7);
  logoMaterial.color.set(design.logo);
  viewport.dataset.design = JSON.stringify(design);
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    viewport.append(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "3D boxer brief");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(1.2, 0.7, 4.2);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -0.05, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 7;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = 2.6;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x45404a, 1.5));
    const light = new THREE.DirectionalLight(0xfff5e9, 2.4);
    light.position.set(3, 5, 4);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0xe0e5ff, 1.6);
    rim.position.set(-3, 2, -4);
    scene.add(rim);
    bodyMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.96,
      bumpMap: fabricRelief(),
      bumpScale: 0.009,
      side: THREE.DoubleSide,
    });
    bandMaterial = new THREE.MeshStandardMaterial({
      color: design.band,
      roughness: 0.92,
      bumpMap: fabricRelief(true),
      bumpScale: 0.006,
      side: THREE.DoubleSide,
    });
    logoMaterial = new THREE.MeshStandardMaterial({
      color: design.logo,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const threadMaterial = new THREE.MeshStandardMaterial({
      color: design.body,
      roughness: 1,
    });
    bodyMaterial.userData.thread = threadMaterial;
    const garment = buildGarment(bodyMaterial, bandMaterial, threadMaterial);
    garment.scale.set(1.12, 0.92, 1);
    scene.add(garment);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 128;
    const sc = shadowCanvas.getContext("2d"),
      gradient = sc.createRadialGradient(64, 64, 2, 64, 64, 64);
    gradient.addColorStop(0, "rgba(30,25,40,.22)");
    gradient.addColorStop(1, "rgba(30,25,40,0)");
    sc.fillStyle = gradient;
    sc.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.4),
      new THREE.MeshBasicMaterial({
        map: texture(shadowCanvas),
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.03;
    scene.add(shadow);
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
      0.23,
      64,
      1,
      true,
      -0.62,
      1.24,
    );
    logoGeometry.scale(0.946, 1, 0.413);
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.y = 0.73;
    garment.add(logo);
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
      view === "reset" ? 1.2 : 0,
      view === "reset" ? 0.7 : 0.4,
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
