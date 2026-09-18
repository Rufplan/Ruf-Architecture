import * as THREE from 'three';

/**
 * Builds a project photograph up from the ground in 3D.
 *
 * The image is cut into horizontal slabs. As progress runs 0 → 1:
 *   site      – an empty ground grid seen from an oblique angle
 *   structure – white slab outlines stack up from the ground, bottom first
 *   enclosure – the photograph fills each slab, bottom first
 *   complete  – the camera swings round to face the image square on
 * At progress 1 the slabs exactly fill the container, so the page can crossfade
 * to a sharp HTML image with no visible jump. Drag to orbit while it assembles.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const STAGES = ['Site', 'Structure', 'Enclosure', 'Complete'] as const;
export const stageAt = (p: number) => (p < 0.1 ? 0 : p < 0.45 ? 1 : p < 0.82 ? 2 : 3);

interface Options {
  src: string;
  /** Image width / height. */
  ratio: number;
  slabs?: number;
  fg?: number;
  bg?: number;
}

export function mountAssembly(container: HTMLElement, opts: Options) {
  const slabs = opts.slabs ?? 12;
  const fg = opts.fg ?? 0xf3f3f0;
  const bg = opts.bg ?? 0x050505;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const fov = 30;
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 500);
  const distance = 20;
  const visH = 2 * distance * Math.tan(THREE.MathUtils.degToRad(fov / 2));

  const building = new THREE.Group();
  const ground = new THREE.Group();
  scene.add(building, ground);

  const texture = new THREE.TextureLoader().load(opts.src, () => (dirty = true));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const disposables: { dispose(): void }[] = [texture];
  type Slab = { group: THREE.Group; face: THREE.Mesh; faceMat: THREE.MeshBasicMaterial; lineMat: THREE.LineBasicMaterial; fillMat: THREE.MeshBasicMaterial; y: number };
  let parts: Slab[] = [];
  let planeW = 1;
  let planeH = 1;
  let frameH = 1;
  let bandHeight = 1;

  // Rebuild geometry so the finished image covers the container like object-fit: cover.
  const build = (aspect: number) => {
    for (const s of parts) building.remove(s.group);
    ground.clear();
    disposables.splice(1).forEach((d) => d.dispose());
    parts = [];

    const visW = visH * aspect;
    planeH = visH;
    planeW = planeH * opts.ratio;
    if (planeW < visW) {
      planeW = visW;
      planeH = planeW / opts.ratio;
    }
    // Only the part of the image inside the frame is textured, matching the cropped HTML image.
    const uSpan = Math.min(1, visW / planeW);
    const vSpan = Math.min(1, visH / planeH);
    const w = Math.min(planeW, visW);
    const h = Math.min(planeH, visH);
    const bandH = h / slabs;
    const depth = bandH * 0.9;
    frameH = h;
    bandHeight = bandH;

    for (let i = 0; i < slabs; i++) {
      const group = new THREE.Group();
      const y = -h / 2 + bandH * (i + 0.5);

      const faceGeo = new THREE.PlaneGeometry(w, bandH);
      const v0 = (1 - vSpan) / 2 + (vSpan * i) / slabs;
      const v1 = (1 - vSpan) / 2 + (vSpan * (i + 1)) / slabs;
      const u0 = (1 - uSpan) / 2;
      const u1 = 1 - u0;
      const uv = faceGeo.attributes.uv as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) {
        uv.setXY(k, uv.getX(k) === 0 ? u0 : u1, uv.getY(k) === 0 ? v0 : v1);
      }
      const faceMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.z = depth / 2 + 0.001;

      // A solid dark slab behind the photo gives the band real thickness when seen at an angle.
      const boxGeo = new THREE.BoxGeometry(w, bandH, depth);
      const fillMat = new THREE.MeshBasicMaterial({ color: bg, transparent: true, opacity: 0 });
      const box = new THREE.Mesh(boxGeo, fillMat);
      const edges = new THREE.EdgesGeometry(boxGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: fg, transparent: true, opacity: 0 });
      const lines = new THREE.LineSegments(edges, lineMat);

      group.add(box, lines, face);
      building.add(group);
      parts.push({ group, face, faceMat, lineMat, fillMat, y });
      disposables.push(faceGeo, faceMat, boxGeo, fillMat, edges, lineMat);
    }

    // Ground: a dotted site grid and a dashed boundary at the foot of the image.
    const R = Math.max(w, 20) * 0.9;
    const pts: number[] = [];
    for (let x = -R; x <= R; x += R / 18) for (let z = -R; z <= R; z += R / 18) pts.push(x, 0, z);
    const dotGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const dotMat = new THREE.PointsMaterial({ color: fg, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.3 });
    const b = w * 0.62;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-b, 0, -b * 0.5), new THREE.Vector3(b, 0, -b * 0.5), new THREE.Vector3(b, 0, b * 0.5), new THREE.Vector3(-b, 0, b * 0.5), new THREE.Vector3(-b, 0, -b * 0.5),
    ]);
    const dashMat = new THREE.LineDashedMaterial({ color: fg, dashSize: 0.3, gapSize: 0.25, transparent: true, opacity: 0.55 });
    const dash = new THREE.Line(lineGeo, dashMat);
    dash.computeLineDistances();
    ground.add(new THREE.Points(dotGeo, dotMat), dash);
    ground.position.y = -h / 2;
    disposables.push(dotGeo, dotMat, lineGeo, dashMat);
  };

  let progress = 0;
  let dirty = true;
  let orbit = 0; // user drag, decays back to 0
  let pointerX = 0;
  let pointerY = 0;

  const update = () => {
    const p = progress;
    const buildP = range(p, 0.1, 0.5);
    const fillP = range(p, 0.38, 0.82);
    const turn = ease(range(p, 0.45, 0.95));
    const h = frameH;
    const bandH = bandHeight;

    parts.forEach((s, i) => {
      // Structure: each slab drops onto the one below.
      const t = easeOut(clamp(buildP * slabs - i));
      s.group.position.y = s.y + (1 - t) * bandH * 4;
      // Enclosure: the photograph fills each slab, bottom first.
      const f = clamp(fillP * slabs - i);
      s.lineMat.opacity = t * (1 - 0.85 * f) * (1 - turn);
      s.fillMat.opacity = t * 0.92;
      s.faceMat.opacity = f;
      s.group.visible = t > 0.001;
      // Floors sit slightly apart until the building completes.
      s.group.position.z = (1 - turn) * Math.sin(i * 1.7) * bandH * 0.12;
    });
    (ground.children as (THREE.Points | THREE.Line)[]).forEach((c, k) => {
      const m = c.material as THREE.PointsMaterial;
      m.opacity = (k === 0 ? 0.3 : 0.55) * (1 - turn);
    });

    // Camera: oblique view of the site swinging to square-on.
    const az = THREE.MathUtils.degToRad(38) * (1 - turn) + orbit + pointerX * 0.12 * (1 - turn);
    const el = THREE.MathUtils.degToRad(24) * (1 - turn) + pointerY * 0.06 * (1 - turn);
    const dist = distance * (1 + 0.55 * (1 - turn));
    const lookY = -h * 0.12 * (1 - turn);
    camera.position.set(Math.sin(az) * Math.cos(el) * dist, lookY + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(0, lookY, 0);
  };

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    build(width / height);
    dirty = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Drag to orbit.
  let dragX: number | null = null;
  const onDown = (e: PointerEvent) => (dragX = e.clientX);
  const onUp = () => (dragX = null);
  const onMove = (e: PointerEvent) => {
    // Once the image is square-on the pointer no longer moves the camera, so skip the redraw.
    if (progress > 0.93 && dragX === null) return;
    pointerX = (e.clientX / innerWidth) * 2 - 1;
    pointerY = (e.clientY / innerHeight) * 2 - 1;
    if (dragX !== null) {
      orbit = clamp(orbit + (e.clientX - dragX) * 0.006, -1.2, 1.2);
      dragX = e.clientX;
    }
    dirty = true;
  };
  container.addEventListener('pointerdown', onDown);
  addEventListener('pointerup', onUp);
  addEventListener('pointermove', onMove, { passive: true });

  let raf = 0;
  let visible = true;
  const loop = () => {
    if (dragX === null && Math.abs(orbit) > 0.0005) {
      orbit *= 0.94;
      dirty = true;
    }
    if (dirty) {
      update();
      renderer.render(scene, camera);
      dirty = false;
    }
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(container);
  raf = requestAnimationFrame(loop);

  return {
    setProgress(p: number) {
      if (p !== progress) {
        progress = p;
        dirty = true;
      }
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener('pointerup', onUp);
      removeEventListener('pointermove', onMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
