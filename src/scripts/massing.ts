import * as THREE from 'three';

export type Form = 'tower' | 'slab' | 'courtyard' | 'cantilever' | 'terrace' | 'cluster';
export type View = 'axo' | 'plan' | 'elevation';

interface Block {
  x: number;
  z: number;
  y: number;
  w: number;
  d: number;
  h: number;
  level: number;
  rot?: number;
}

// Small deterministic PRNG so each project's massing is stable between visits.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Push one box per storey so the model can be exploded floor by floor. */
function stack(out: Block[], b: Omit<Block, 'y' | 'h' | 'level'>, from: number, to: number, storey = 1, levelOffset = 0) {
  for (let l = from; l < to; l++) {
    out.push({ ...b, y: l * storey, h: storey, level: l + levelOffset });
  }
}

function generate(form: Form, seed: number): Block[] {
  const r = mulberry32(seed * 9973 + 17);
  const out: Block[] = [];

  switch (form) {
    case 'tower': {
      const podium = 3;
      const floors = 22 + Math.floor(r() * 10);
      const twist = (r() - 0.5) * 0.07;
      stack(out, { x: 0, z: 0, w: 12, d: 9 }, 0, podium);
      let w = 5.2;
      let d = 5.2;
      for (let l = podium; l < floors; l++) {
        if ((l - podium) > 0 && (l - podium) % 8 === 0) {
          w *= 0.8;
          d *= 0.8;
        }
        out.push({ x: 0, z: 0, y: l, w, d, h: 1, level: l, rot: (l - podium) * twist });
      }
      out.push({ x: 0, z: 0, y: floors, w: 0.35, d: 0.35, h: 5, level: floors, rot: 0 });
      break;
    }
    case 'slab': {
      const L = 16 + Math.round(r() * 6);
      const D = 3;
      const floors = 5 + Math.floor(r() * 3);
      for (let x = -L / 2 + 1; x <= L / 2 - 1; x += 2.5) {
        for (const z of [-0.9, 0.9]) out.push({ x, z, y: 0, w: 0.35, d: 0.35, h: 1.6, level: 0 });
      }
      for (let l = 0; l < floors; l++) out.push({ x: 0, z: 0, y: 1.6 + l, w: L, d: D, h: 1, level: l + 1 });
      out.push({ x: -L / 4, z: 0, y: 1.6 + floors, w: 3, d: 2, h: 1.4, level: floors + 1 });
      out.push({ x: L / 3, z: 0.3, y: 1.6 + floors, w: 1.4, d: 1.4, h: 2.2, level: floors + 1 });
      break;
    }
    case 'courtyard': {
      const S = 13;
      const T = 3;
      const n = 3 + Math.floor(r() * 2);
      stack(out, { x: 0, z: -S / 2 + T / 2, w: S, d: T }, 0, n);
      stack(out, { x: 0, z: S / 2 - T / 2, w: S, d: T }, 0, n);
      stack(out, { x: -S / 2 + T / 2, z: 0, w: T, d: S - 2 * T }, 0, n);
      stack(out, { x: S / 2 - T / 2, z: 0, w: T, d: S - 2 * T }, 0, n - 1);
      stack(out, { x: S / 2 - T / 2, z: -S / 2 + T * 1.5, w: T, d: T * 2 }, n, n + 5 + Math.floor(r() * 3));
      // Pavilion in the court.
      out.push({ x: -0.5, z: 0.5, y: 0, w: 2.2, d: 2.2, h: 1, level: 0, rot: 0.785 });
      break;
    }
    case 'cantilever': {
      const o = (r() - 0.5) * 3;
      stack(out, { x: 0, z: 0, w: 14, d: 4 }, 0, 2);
      stack(out, { x: 3 + o, z: 3.5, w: 4, d: 16 }, 2, 4);
      stack(out, { x: -3, z: -1 + o, w: 13, d: 3.5 }, 4, 6);
      out.push({ x: -1, z: 1, y: 6, w: 2, d: 2, h: 1.6, level: 6 });
      break;
    }
    case 'terrace': {
      const n = 7 + Math.floor(r() * 3);
      const W = 12;
      const D0 = 13;
      for (let l = 0; l < n; l++) {
        const d = D0 - l * 1.35;
        out.push({ x: 0, z: -D0 / 2 + d / 2, y: l, w: W - (l % 2) * 0.6, d, h: 1, level: l });
      }
      stack(out, { x: W / 2 + 1.2, z: -D0 / 2 + 1.5, w: 2.4, d: 3 }, 0, n + 2);
      break;
    }
    case 'cluster':
    default: {
      const cells = 5;
      const size = 3;
      const gap = 0.7;
      const span = cells * (size + gap);
      for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
          const cx = -span / 2 + i * (size + gap) + size / 2;
          const cz = -span / 2 + j * (size + gap) + size / 2;
          const centre = i === 2 && j === 2;
          if (!centre && r() > 0.72) continue;
          const h = centre ? 20 + Math.floor(r() * 6) : 1 + Math.floor(Math.pow(r(), 2.4) * 11);
          const w = centre ? size : size * (0.55 + r() * 0.45);
          const d = centre ? size : size * (0.55 + r() * 0.45);
          if (centre) {
            for (let l = 0; l < h; l++) out.push({ x: cx, z: cz, y: l, w, d, h: 1, level: l, rot: l * 0.022 });
          } else {
            stack(out, { x: cx, z: cz, w, d }, 0, h);
          }
        }
      }
      break;
    }
  }
  return out;
}

export interface Palette {
  fg: number;
  bg: number;
}

/** A self-contained scene (model + camera) that can be drawn by any renderer. */
export class Stage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 500);
  readonly group = new THREE.Group();

  explode = 0;
  explodeTarget = 0;
  spin: number;
  spinSpeed = 0.12;
  pointer = { x: 0, y: 0 };
  pointerTarget = { x: 0, y: 0 };
  build = 1;

  private items: { obj: THREE.Object3D; baseY: number; level: number }[] = [];
  private clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6);
  private height = 1;
  private radius = 1;
  private maxLevel = 0;
  private aspect = 1;
  private disposables: { dispose(): void }[] = [];

  constructor(form: Form, seed: number, palette: Palette, readonly view: View = 'axo', readonly zoom = 1) {
    this.spin = view === 'axo' ? Math.PI / 4 : 0;
    const blocks = generate(form, seed);

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const b of blocks) {
      const ext = Math.max(b.w, b.d) / (b.rot ? Math.SQRT1_2 * 2 : 2);
      minX = Math.min(minX, b.x - ext);
      maxX = Math.max(maxX, b.x + ext);
      minZ = Math.min(minZ, b.z - ext);
      maxZ = Math.max(maxZ, b.z + ext);
      this.height = Math.max(this.height, b.y + b.h);
      this.maxLevel = Math.max(this.maxLevel, b.level);
    }
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    this.radius = Math.hypot(maxX - minX, maxZ - minZ) / 2;

    const faceMat = new THREE.MeshBasicMaterial({
      color: palette.bg,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      clippingPlanes: [this.clip],
    });
    const lineMat = new THREE.LineBasicMaterial({ color: palette.fg, clippingPlanes: [this.clip] });
    this.disposables.push(faceMat, lineMat);

    for (const b of blocks) {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const edges = new THREE.EdgesGeometry(geo);
      this.disposables.push(geo, edges);
      const obj = new THREE.Group();
      obj.add(new THREE.Mesh(geo, faceMat), new THREE.LineSegments(edges, lineMat));
      const baseY = b.y + b.h / 2;
      obj.position.set(b.x - cx, baseY, b.z - cz);
      obj.rotation.y = b.rot ?? 0;
      this.group.add(obj);
      this.items.push({ obj, baseY, level: b.level });
    }

    this.group.add(this.makeGround(palette));
    this.scene.add(this.group);
  }

  private makeGround(palette: Palette) {
    const ground = new THREE.Group();
    const R = Math.ceil(this.radius * 1.5);
    const pts: number[] = [];
    for (let x = -R; x <= R; x += 1.5) for (let z = -R; z <= R; z += 1.5) pts.push(x, 0, z);
    const dotGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const dotMat = new THREE.PointsMaterial({ color: palette.fg, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.28 });
    // Seen edge-on in elevation the dot grid is just noise.
    if (this.view !== 'elevation') ground.add(new THREE.Points(dotGeo, dotMat));

    const b = this.radius * 1.2;
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-b, 0, -b), new THREE.Vector3(b, 0, -b), new THREE.Vector3(b, 0, b), new THREE.Vector3(-b, 0, b), new THREE.Vector3(-b, 0, -b),
    ]);
    const boundaryMat = new THREE.LineDashedMaterial({ color: palette.fg, dashSize: 0.6, gapSize: 0.5, transparent: true, opacity: 0.5 });
    const boundary = new THREE.Line(boundaryGeo, boundaryMat);
    boundary.computeLineDistances();
    ground.add(boundary);

    this.disposables.push(dotGeo, dotMat, boundaryGeo, boundaryMat);
    return ground;
  }

  get levels() {
    return this.maxLevel + 1;
  }

  setSize(width: number, height: number) {
    this.aspect = width / Math.max(1, height);
  }

  /** Advance animation state by dt seconds. */
  tick(dt: number) {
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent easing
    this.explode += (this.explodeTarget - this.explode) * k;
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * k;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * k;
    this.spin += dt * this.spinSpeed;

    for (const it of this.items) it.obj.position.y = it.baseY + it.level * this.explode;

    const fullHeight = this.height + this.maxLevel * this.explode;
    const e = this.build < 1 ? easeInOutCubic(this.build) : 1;
    this.clip.constant = this.build < 1 ? e * fullHeight + 0.001 : 1e6;

    this.group.rotation.y = this.view === 'axo' ? this.spin + this.pointer.x * 0.5 : 0;
    this.placeCamera(fullHeight);
  }

  private placeCamera(fullHeight: number) {
    const cam = this.camera;
    let halfH: number;
    if (this.view === 'plan') {
      cam.position.set(0, 200, 0);
      cam.up.set(0, 0, -1);
      cam.lookAt(0, 0, 0);
      halfH = this.radius * 1.25;
    } else if (this.view === 'elevation') {
      const ty = fullHeight / 2;
      cam.position.set(0, ty, 200);
      cam.up.set(0, 1, 0);
      cam.lookAt(0, ty, 0);
      halfH = Math.max(fullHeight * 0.62, this.radius * 0.7);
    } else {
      const ty = fullHeight * 0.42;
      const el = 0.58 + this.pointer.y * 0.18;
      cam.position.set(Math.cos(el) * 200, ty + Math.sin(el) * 200, 0);
      cam.up.set(0, 1, 0);
      cam.lookAt(0, ty, 0);
      halfH = Math.max(fullHeight * 0.62, this.radius * 0.95);
    }
    // Keep the whole model in frame on narrow (portrait) viewports.
    halfH = Math.max(halfH, (this.radius * 1.15) / this.aspect) / this.zoom;
    cam.left = -halfH * this.aspect;
    cam.right = halfH * this.aspect;
    cam.top = halfH;
    cam.bottom = -halfH;
    cam.updateProjectionMatrix();
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hex = (value: string | undefined, fallback: number) =>
  value ? parseInt(value.replace('#', ''), 16) : fallback;

export interface MountOptions {
  form: Form;
  seed: number;
  palette: Palette;
  build?: boolean;
  zoom?: number;
  /** Explode floors as the page scrolls through this element. */
  scrollExplode?: HTMLElement | null;
  maxExplode?: number;
  draggable?: boolean;
  onTick?: (stage: Stage) => void;
}

/** Mount a live, full-size scene into a container element. */
export function mountMassing(container: HTMLElement, opts: MountOptions) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const stage = new Stage(opts.form, opts.seed, opts.palette, 'axo', opts.zoom ?? 1);
  const still = reducedMotion();
  if (opts.build && !still) stage.build = 0;
  if (still) stage.spinSpeed = 0;

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height);
    stage.setSize(width, height);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const onPointer = (e: PointerEvent) => {
    stage.pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    stage.pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let dragX: number | null = null;
  const onDown = (e: PointerEvent) => { dragX = e.clientX; };
  const onUp = () => { dragX = null; };
  const onDrag = (e: PointerEvent) => {
    if (dragX === null) return;
    stage.spin += (e.clientX - dragX) * 0.008;
    dragX = e.clientX;
  };
  if (opts.draggable) {
    container.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onDrag, { passive: true });
  }

  const onScroll = () => {
    const el = opts.scrollExplode;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const p = Math.min(1, Math.max(0, -rect.top / travel));
    stage.explodeTarget = p * (opts.maxExplode ?? 0.9);
  };
  if (opts.scrollExplode) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  let visible = true;
  let raf = 0;
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (opts.build && stage.build < 1) stage.build = Math.min(1, stage.build + dt / 2.8);
    stage.tick(dt);
    opts.onTick?.(stage);
    renderer.render(stage.scene, stage.camera);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  });
  io.observe(container);
  raf = requestAnimationFrame(loop);

  return {
    stage,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onDrag);
      window.removeEventListener('scroll', onScroll);
      stage.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

/**
 * One shared WebGL context that draws many small views into plain 2D canvases.
 * Browsers cap live WebGL contexts, so thumbnails and drawing sheets use this.
 */
export class SnapshotRenderer {
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  private stages = new Map<string, Stage>();

  constructor() {
    this.renderer.localClippingEnabled = true;
    this.renderer.setClearColor(0x000000, 0);
  }

  stage(form: Form, seed: number, palette: Palette, view: View = 'axo', zoom = 1) {
    const key = `${form}:${seed}:${palette.fg}:${palette.bg}:${view}:${zoom}`;
    let s = this.stages.get(key);
    if (!s) {
      s = new Stage(form, seed, palette, view, zoom);
      this.stages.set(key, s);
    }
    return s;
  }

  draw(canvas: HTMLCanvasElement, stage: Stage, dt = 0) {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    stage.setSize(w, h);
    stage.tick(dt);
    this.renderer.render(stage.scene, stage.camera);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.renderer.domElement, 0, 0, w, h);
  }
}
