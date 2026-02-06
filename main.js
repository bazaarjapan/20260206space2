import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const TAU = Math.PI * 2;
const SIM_DAYS_PER_SEC = 4.8;
const CAMERA_HOME = new THREE.Vector3(0, 56, 132);
const ORIGIN = new THREE.Vector3(0, 0, 0);

const canvas = document.querySelector("#scene");
const speedInput = document.querySelector("#speed");
const speedValue = document.querySelector("#speedValue");
const toggleButton = document.querySelector("#toggle");
const cinematicButton = document.querySelector("#cinematic");
const resetCameraButton = document.querySelector("#resetCamera");
const focusSelect = document.querySelector("#focus");
const orbitVisibleCheckbox = document.querySelector("#orbitVisible");
const labelVisibleCheckbox = document.querySelector("#labelVisible");

const planetName = document.querySelector("#planetName");
const planetType = document.querySelector("#planetType");
const planetSummary = document.querySelector("#planetSummary");
const factDiameter = document.querySelector("#factDiameter");
const factDistance = document.querySelector("#factDistance");
const factYear = document.querySelector("#factYear");
const factDay = document.querySelector("#factDay");
const statusTime = document.querySelector("#statusTime");
const statusMode = document.querySelector("#statusMode");
const statusFocus = document.querySelector("#statusFocus");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040812);
scene.fog = new THREE.FogExp2(0x040812, 0.00048);

const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 3800);
camera.position.copy(CAMERA_HOME);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 760;
controls.target.copy(ORIGIN);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.72, 0.55, 0.18);
composer.addPass(bloomPass);

scene.add(new THREE.AmbientLight(0x1c3350, 0.35));
const fillLight = new THREE.DirectionalLight(0x7fb8ff, 0.4);
fillLight.position.set(110, 30, 90);
scene.add(fillLight);

const sunLight = new THREE.PointLight(0xffefca, 2.75, 2600, 1.65);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(6.8, 72, 72),
  new THREE.MeshStandardMaterial({
    color: 0xffd177,
    emissive: 0xffa53e,
    emissiveIntensity: 1.2,
    roughness: 0.7,
    metalness: 0.02
  })
);
scene.add(sun);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(10.4, 42, 42),
  new THREE.MeshBasicMaterial({
    color: 0xffbf6f,
    transparent: true,
    opacity: 0.23,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(sunGlow);

const starsNear = new THREE.Points(createStarGeometry(4600, 260, 1200), createStarMaterial(1.05, 0.86, 0xeaf4ff));
const starsFar = new THREE.Points(createStarGeometry(3600, 900, 2300), createStarMaterial(1.4, 0.63, 0xd9eaff));
scene.add(starsNear);
scene.add(starsFar);

const planetData = [
  { name: "水星", type: "Rocky Planet", summary: "クレーターが多い最内周惑星。", radius: 1.08, distance: 13, orbitDays: 88, rotationHours: 1407.6, axialTiltDeg: 0.03, orbitTiltDeg: 7, distanceAU: 0.39, diameterKm: 4879, colorA: 0xc9c2b5, colorB: 0x7b736a, accent: 0xe8dec8, pattern: "rock" },
  { name: "金星", type: "Cloud Planet", summary: "濃密な雲で覆われた高温惑星。", radius: 1.82, distance: 18, orbitDays: 224.7, rotationHours: -5832.5, axialTiltDeg: 177.4, orbitTiltDeg: 3.4, distanceAU: 0.72, diameterKm: 12104, colorA: 0xd7b17f, colorB: 0x8d6542, accent: 0xf2cea0, pattern: "cloud" },
  { name: "地球", type: "Ocean Planet", summary: "海と大気を持つ生命圏惑星。", radius: 2, distance: 24, orbitDays: 365.2, rotationHours: 23.93, axialTiltDeg: 23.4, orbitTiltDeg: 0, distanceAU: 1, diameterKm: 12742, colorA: 0x2f7dd6, colorB: 0x1d4a96, accent: 0x87c9ff, pattern: "earth", hasAtmosphere: true },
  { name: "火星", type: "Desert Planet", summary: "赤い地表が特徴の岩石惑星。", radius: 1.45, distance: 30, orbitDays: 687, rotationHours: 24.6, axialTiltDeg: 25.2, orbitTiltDeg: 1.9, distanceAU: 1.52, diameterKm: 6779, colorA: 0xb86142, colorB: 0x6f3929, accent: 0xd78c65, pattern: "rock" },
  { name: "木星", type: "Gas Giant", summary: "最大級の縞状ガス惑星。", radius: 4.9, distance: 42, orbitDays: 4331, rotationHours: 9.9, axialTiltDeg: 3.1, orbitTiltDeg: 1.3, distanceAU: 5.2, diameterKm: 139820, colorA: 0xd8b98d, colorB: 0x906f49, accent: 0xf1ddbe, pattern: "bands" },
  { name: "土星", type: "Ringed Giant", summary: "美しい環を持つ巨大ガス惑星。", radius: 4.25, distance: 56, orbitDays: 10747, rotationHours: 10.7, axialTiltDeg: 26.7, orbitTiltDeg: 2.5, distanceAU: 9.58, diameterKm: 116460, colorA: 0xdcca9c, colorB: 0x8e754e, accent: 0xf1e4c8, pattern: "bands", ring: { inner: 5.3, outer: 8.8, color: 0xd0bd93 } },
  { name: "天王星", type: "Ice Giant", summary: "横倒しの自転軸を持つ氷惑星。", radius: 3.04, distance: 71, orbitDays: 30589, rotationHours: -17.2, axialTiltDeg: 97.8, orbitTiltDeg: 0.8, distanceAU: 19.2, diameterKm: 50724, colorA: 0x8ad0dc, colorB: 0x4d8198, accent: 0xd2f5ff, pattern: "ice", ring: { inner: 3.6, outer: 4.9, color: 0xa9cad8 } },
  { name: "海王星", type: "Ice Giant", summary: "深い青色の外縁惑星。", radius: 2.9, distance: 84, orbitDays: 59800, rotationHours: 16.1, axialTiltDeg: 28.3, orbitTiltDeg: 1.8, distanceAU: 30.05, diameterKm: 49244, colorA: 0x4f79de, colorB: 0x2a4086, accent: 0x96b9ff, pattern: "ice" }
];

const FREE_INFO = {
  name: "フリーカメラ",
  type: "Navigator",
  summary: "対象を固定せず、太陽系全体を観察できます。",
  diameter: "-",
  distance: "-",
  year: "-",
  day: "-"
};

const SUN_INFO = {
  name: "太陽",
  type: "G-type Star",
  summary: "太陽系中心の恒星。すべての惑星運動の重力源です。",
  diameter: `${(1392700).toLocaleString("ja-JP")} km`,
  distance: "0 AU",
  year: "-",
  day: "約25日"
};

const systemRoot = new THREE.Group();
scene.add(systemRoot);

const planets = [];
const orbitVisuals = [];
const labels = [];
const focusTargets = [];
const focusLookup = new Map();

const focusHalo = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.05, 18, 96),
  new THREE.MeshBasicMaterial({
    color: 0x5ddaca,
    transparent: true,
    opacity: 0.54,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
focusHalo.rotation.x = Math.PI / 2;
focusHalo.visible = false;
scene.add(focusHalo);

const clock = new THREE.Clock();
const worldPosition = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const labelPosition = new THREE.Vector3();
const followOffset = new THREE.Vector3(32, 18, 58);

let followTarget = null;
let followRadius = 0;
let timeScale = Number(speedInput.value);
let paused = false;
let cinematicMode = false;
let simulationDays = 0;
let elapsedSeconds = 0;

for (const data of planetData) {
  const orbitPlane = new THREE.Group();
  orbitPlane.rotation.z = THREE.MathUtils.degToRad(data.orbitTiltDeg || 0);
  systemRoot.add(orbitPlane);

  const orbitalGroup = new THREE.Group();
  orbitalGroup.rotation.y = Math.random() * TAU;
  orbitPlane.add(orbitalGroup);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.radius, 56, 56),
    new THREE.MeshStandardMaterial({
      map: createPlanetTexture(data),
      roughness: data.pattern === "bands" ? 0.74 : 0.88,
      metalness: 0.02
    })
  );
  mesh.position.x = data.distance;
  mesh.rotation.z = THREE.MathUtils.degToRad(data.axialTiltDeg);
  orbitalGroup.add(mesh);

  if (data.hasAtmosphere) {
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius * 1.12, 36, 36),
      new THREE.MeshBasicMaterial({
        color: 0x74c5ff,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    mesh.add(atmosphere);
  }

  if (data.ring) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(data.ring.inner, data.ring.outer, 128),
      new THREE.MeshBasicMaterial({
        map: createRingTexture(data.ring.color),
        color: 0xffffff,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);
  }

  const orbitLine = createOrbitCircle(data.distance);
  orbitPlane.add(orbitLine);
  orbitVisuals.push(orbitLine);

  const label = document.createElement("div");
  label.className = "planet-label";
  label.textContent = data.name;
  document.body.appendChild(label);
  labels.push({ label, mesh });

  const info = {
    name: data.name,
    type: data.type,
    summary: data.summary,
    diameter: `${data.diameterKm.toLocaleString("ja-JP")} km`,
    distance: `${data.distanceAU.toLocaleString("ja-JP", { maximumFractionDigits: 2 })} AU`,
    year: formatOrbitPeriod(data.orbitDays),
    day: formatRotationPeriod(data.rotationHours)
  };

  planets.push({
    mesh,
    orbitalGroup,
    orbitAngularSpeed: TAU / data.orbitDays,
    spinAngularSpeed: TAU / (Math.abs(data.rotationHours) / 24),
    spinDirection: Math.sign(data.rotationHours) || 1,
    radius: data.radius,
    name: data.name,
    info
  });
}

focusTargets.push(
  { name: "フリー", mesh: null, radius: 0, info: FREE_INFO },
  { name: "太陽", mesh: sun, radius: 6.8, info: SUN_INFO },
  ...planets.map((planet) => ({ name: planet.name, mesh: planet.mesh, radius: planet.radius, info: planet.info }))
);

for (const target of focusTargets) {
  focusLookup.set(target.name, target);
  const option = document.createElement("option");
  option.value = target.name;
  option.textContent = target.name;
  focusSelect.appendChild(option);
}

speedValue.textContent = `${timeScale.toFixed(1)}x`;
focusSelect.value = "太陽";
applyFocus("太陽", true);
updateStatusMode();
updateStatusTime();

speedInput.addEventListener("input", () => {
  timeScale = Number(speedInput.value);
  speedValue.textContent = `${timeScale.toFixed(1)}x`;
});

toggleButton.addEventListener("click", () => {
  paused = !paused;
  toggleButton.textContent = paused ? "再開" : "一時停止";
  updateStatusMode();
});

cinematicButton.addEventListener("click", () => {
  cinematicMode = !cinematicMode;
  cinematicButton.classList.toggle("active", cinematicMode);
  updateStatusMode();
});

resetCameraButton.addEventListener("click", () => {
  camera.position.copy(CAMERA_HOME);
  controls.target.copy(ORIGIN);
  focusSelect.value = "太陽";
  applyFocus("太陽");
});

focusSelect.addEventListener("change", () => {
  applyFocus(focusSelect.value);
});

orbitVisibleCheckbox.addEventListener("change", () => {
  for (const line of orbitVisuals) {
    line.visible = orbitVisibleCheckbox.checked;
  }
});

labelVisibleCheckbox.addEventListener("change", () => {
  if (!labelVisibleCheckbox.checked) {
    for (const item of labels) {
      item.label.style.display = "none";
    }
  }
});

window.addEventListener("resize", onResize);
onResize();
animate();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.08);
  elapsedSeconds += dt;
  const stepDays = paused ? 0 : dt * timeScale * SIM_DAYS_PER_SEC;
  simulationDays += stepDays;

  sun.rotation.y += dt * 0.16;
  sunGlow.rotation.y -= dt * 0.05;
  sunGlow.scale.setScalar(1 + Math.sin(elapsedSeconds * 1.8) * 0.03);

  starsNear.rotation.y += dt * 0.0038;
  starsFar.rotation.y -= dt * 0.0012;

  for (const planet of planets) {
    planet.orbitalGroup.rotation.y += planet.orbitAngularSpeed * stepDays;
    planet.mesh.rotation.y += planet.spinAngularSpeed * stepDays * planet.spinDirection;
  }

  updateCamera(elapsedSeconds);
  updateFocusHalo(elapsedSeconds);
  updateLabels();
  updateStatusTime();

  controls.update();
  composer.render();
}

function updateCamera(elapsed) {
  if (followTarget) {
    followTarget.getWorldPosition(worldPosition);

    if (cinematicMode) {
      const radius = Math.max(22, followRadius * 7.2 + 14);
      const angle = elapsed * 0.36;
      desiredCameraPosition.set(
        worldPosition.x + Math.cos(angle) * radius,
        worldPosition.y + radius * 0.34 + Math.sin(elapsed * 0.84) * 2.4,
        worldPosition.z + Math.sin(angle) * radius
      );
      camera.position.lerp(desiredCameraPosition, 0.056);
      controls.target.lerp(worldPosition, 0.14);
      return;
    }

    desiredCameraPosition.copy(worldPosition).add(followOffset);
    camera.position.lerp(desiredCameraPosition, 0.09);
    controls.target.lerp(worldPosition, 0.18);
    return;
  }

  if (cinematicMode) {
    const radius = 128 + Math.sin(elapsed * 0.29) * 10;
    desiredCameraPosition.set(Math.cos(elapsed * 0.15) * radius, 44 + Math.sin(elapsed * 0.47) * 8, Math.sin(elapsed * 0.15) * radius);
    camera.position.lerp(desiredCameraPosition, 0.04);
    controls.target.lerp(ORIGIN, 0.08);
  }
}

function updateFocusHalo(elapsed) {
  if (!followTarget) {
    focusHalo.visible = false;
    return;
  }

  followTarget.getWorldPosition(worldPosition);
  focusHalo.visible = true;
  focusHalo.position.copy(worldPosition);
  const scale = Math.max(2.1, followRadius * 1.8);
  focusHalo.scale.setScalar(scale);
  focusHalo.material.opacity = 0.43 + Math.sin(elapsed * 3.8) * 0.14;
  focusHalo.rotation.z += 0.005;
}

function updateLabels() {
  for (const item of labels) {
    if (!labelVisibleCheckbox.checked) {
      item.label.style.display = "none";
      continue;
    }

    item.mesh.getWorldPosition(labelPosition).project(camera);
    const visible = labelPosition.z > -1 && labelPosition.z < 1 && Math.abs(labelPosition.x) < 1.1 && Math.abs(labelPosition.y) < 1.1;

    if (!visible) {
      item.label.style.display = "none";
      continue;
    }

    item.label.style.display = "block";
    item.label.style.left = `${(labelPosition.x * 0.5 + 0.5) * window.innerWidth}px`;
    item.label.style.top = `${(-labelPosition.y * 0.5 + 0.5) * window.innerHeight}px`;
  }
}

function applyFocus(name, immediate = false) {
  const target = focusLookup.get(name) || focusLookup.get("フリー");
  if (!target) {
    return;
  }

  updateInspector(target.info);
  statusFocus.textContent = target.name;

  followTarget = target.mesh;
  followRadius = target.radius;

  if (!followTarget) {
    focusHalo.visible = false;
    return;
  }

  followTarget.getWorldPosition(worldPosition);
  followOffset.copy(camera.position).sub(worldPosition);

  const minOffset = Math.max(20, target.radius * 6.6 + 10);
  if (followOffset.length() < minOffset) {
    followOffset.set(minOffset * 0.58, minOffset * 0.34, minOffset);
  }

  if (immediate) {
    camera.position.copy(worldPosition).add(followOffset);
    controls.target.copy(worldPosition);
  }
}

function updateInspector(info) {
  planetName.textContent = info.name;
  planetType.textContent = info.type;
  planetSummary.textContent = info.summary;
  factDiameter.textContent = info.diameter;
  factDistance.textContent = info.distance;
  factYear.textContent = info.year;
  factDay.textContent = info.day;
}

function updateStatusMode() {
  statusMode.textContent = paused ? "PAUSED" : cinematicMode ? "CINEMATIC" : "RUNNING";
}

function updateStatusTime() {
  const years = simulationDays / 365.25;
  statusTime.textContent = `Day ${simulationDays.toFixed(1)} | Year ${years.toFixed(2)}`;
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
  bloomPass.setSize(width, height);
  bloomPass.strength = width < 700 ? 0.52 : 0.72;
}

function createOrbitCircle(radius) {
  const segments = 180;
  const points = [];
  for (let i = 0; i < segments; i += 1) {
    const theta = (i / segments) * TAU;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const dashed = new THREE.LineLoop(
    geometry,
    new THREE.LineDashedMaterial({
      color: 0x6287ad,
      transparent: true,
      opacity: 0.5,
      dashSize: 1.14,
      gapSize: 0.86
    })
  );
  dashed.computeLineDistances();

  const glow = new THREE.LineLoop(
    geometry.clone(),
    new THREE.LineBasicMaterial({ color: 0x8abbe1, transparent: true, opacity: 0.1 })
  );

  const group = new THREE.Group();
  group.add(glow);
  group.add(dashed);
  return group;
}

function createStarGeometry(count, minRadius, maxRadius) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = THREE.MathUtils.lerp(minRadius, maxRadius, Math.random());
    const theta = Math.random() * TAU;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function createStarMaterial(size, opacity, color) {
  return new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function createPlanetTexture(data) {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 1024;
  canvasTexture.height = 512;
  const ctx = canvasTexture.getContext("2d");
  if (!ctx) {
    return null;
  }

  const gradient = ctx.createLinearGradient(0, 0, canvasTexture.width, canvasTexture.height);
  gradient.addColorStop(0, colorWithAlpha(data.colorA, 1));
  gradient.addColorStop(1, colorWithAlpha(data.colorB, 1));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);

  if (data.pattern === "bands") {
    for (let i = 0; i < 68; i += 1) {
      const y = (i / 68) * canvasTexture.height + Math.sin(i * 0.7) * 5;
      const h = 4 + Math.random() * 12;
      ctx.fillStyle = colorWithAlpha(i % 3 === 0 ? data.accent : data.colorB, 0.07 + Math.random() * 0.14);
      ctx.fillRect(0, y, canvasTexture.width, h);
    }
  } else if (data.pattern === "cloud") {
    for (let i = 0; i < 150; i += 1) {
      const x = Math.random() * canvasTexture.width;
      const y = Math.random() * canvasTexture.height;
      ctx.fillStyle = colorWithAlpha(data.accent, 0.08 + Math.random() * 0.14);
      ctx.beginPath();
      ctx.ellipse(x, y, 24 + Math.random() * 92, 8 + Math.random() * 26, Math.random() * TAU, 0, TAU);
      ctx.fill();
    }
  } else if (data.pattern === "earth") {
    for (let i = 0; i < 220; i += 1) {
      ctx.fillStyle = colorWithAlpha(0x67b35c, 0.22 + Math.random() * 0.32);
      ctx.beginPath();
      ctx.ellipse(Math.random() * canvasTexture.width, Math.random() * canvasTexture.height, 8 + Math.random() * 34, 4 + Math.random() * 16, Math.random() * TAU, 0, TAU);
      ctx.fill();
    }
    for (let i = 0; i < 140; i += 1) {
      ctx.fillStyle = colorWithAlpha(data.accent, 0.08 + Math.random() * 0.16);
      ctx.beginPath();
      ctx.ellipse(Math.random() * canvasTexture.width, Math.random() * canvasTexture.height, 14 + Math.random() * 58, 5 + Math.random() * 20, Math.random() * TAU, 0, TAU);
      ctx.fill();
    }
  } else if (data.pattern === "ice") {
    for (let i = 0; i < 90; i += 1) {
      const y = (i / 90) * canvasTexture.height + Math.sin(i * 0.4) * 8;
      ctx.fillStyle = colorWithAlpha(data.accent, 0.06 + Math.random() * 0.1);
      ctx.fillRect(0, y, canvasTexture.width, 2 + Math.random() * 6);
    }
  } else {
    for (let i = 0; i < 260; i += 1) {
      ctx.fillStyle = colorWithAlpha(Math.random() > 0.35 ? data.accent : data.colorB, 0.08 + Math.random() * 0.16);
      ctx.beginPath();
      ctx.arc(Math.random() * canvasTexture.width, Math.random() * canvasTexture.height, 3 + Math.random() * 12, 0, TAU);
      ctx.fill();
    }
  }

  const vignette = ctx.createRadialGradient(canvasTexture.width / 2, canvasTexture.height / 2, canvasTexture.height * 0.1, canvasTexture.width / 2, canvasTexture.height / 2, canvasTexture.width * 0.7);
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.34)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);

  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createRingTexture(baseColor) {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 1024;
  canvasTexture.height = 64;
  const ctx = canvasTexture.getContext("2d");
  if (!ctx) {
    return null;
  }

  for (let x = 0; x < canvasTexture.width; x += 1) {
    const darkness = Math.random() > 0.86 ? 0.12 : 1;
    const alpha = (0.2 + Math.random() * 0.55) * darkness;
    ctx.fillStyle = colorWithAlpha(baseColor, alpha);
    ctx.fillRect(x, 0, 1, canvasTexture.height);
  }

  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function colorWithAlpha(hex, alpha) {
  const color = new THREE.Color(hex);
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`;
}

function formatOrbitPeriod(days) {
  const dayText = Number(days).toLocaleString("ja-JP", { maximumFractionDigits: 1 });
  if (days >= 365) {
    return `${dayText} 日 (${(days / 365.25).toFixed(2)} 年)`;
  }
  return `${dayText} 日`;
}

function formatRotationPeriod(hours) {
  const absHours = Math.abs(hours);
  const direction = hours < 0 ? " (逆行)" : "";
  if (absHours >= 48) {
    return `${(absHours / 24).toFixed(1)} 日${direction}`;
  }
  return `${absHours.toFixed(1)} 時間${direction}`;
}
