"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type * as THREE_NS from "three";
import { FINGER_COLORS, LABELS, ROWS } from "./keyboardLayout";
import type { LastPress, PressState } from "./useTypingSession";
import styles from "./TouchTypingGame.module.css";

export type Keyboard3DHandle = {
  pressKey: (code: string, state: PressState) => void;
  setHint: (code: string | null) => void;
};

type Props = {
  hintCode: string | null;
  lastPress: LastPress | null;
  onContextLost?: () => void;
};

type KeyObject = {
  root: THREE_NS.Group;
  mesh: THREE_NS.Mesh;
  material: THREE_NS.MeshStandardMaterial;
  baseX: number;
  baseY: number;
  depression: number;
  pressed: boolean;
  startedAt: number;
  state: PressState | null;
};

function labelTexture(THREE: typeof THREE_NS, base: string, shift: string | undefined, anisotropy: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#17243A";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const compact = base.length > 2;
  context.font = `${compact ? 700 : 800} ${compact ? 70 : 112}px sans-serif`;
  context.fillText(base, 256, shift ? 154 : 132);
  if (shift) {
    context.textAlign = "right";
    context.font = "700 52px sans-serif";
    context.fillStyle = "#3E4D64";
    context.fillText(shift, 448, 58);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

const Keyboard3D = forwardRef<Keyboard3DHandle, Props>(function Keyboard3D({ hintCode, lastPress, onContextLost }, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Map<string, KeyObject>>(new Map());
  const hintRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    pressKey(code, state) {
      const key = keysRef.current.get(code);
      if (!key) return;
      key.startedAt = performance.now();
      key.state = state;
    },
    setHint(code) {
      hintRef.current = code;
    },
  }), []);

  useEffect(() => {
    hintRef.current = hintCode;
  }, [hintCode]);

  useEffect(() => {
    if (!lastPress) return;
    const key = keysRef.current.get(lastPress.code);
    if (key) {
      key.startedAt = performance.now();
      key.state = lastPress.state;
    }
  }, [lastPress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const keys = keysRef.current;
    let disposed = false;
    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;
    const textures: THREE_NS.Texture[] = [];
    const materials: THREE_NS.Material[] = [];
    const geometries: THREE_NS.BufferGeometry[] = [];
    let renderer: THREE_NS.WebGLRenderer | null = null;
    let pmrem: THREE_NS.PMREMGenerator | null = null;
    let environment: THREE_NS.Texture | null = null;
    let detachKeyboard: (() => void) | null = null;

    void (async () => {
      const THREE = await import("three");
      const [{ RoundedBoxGeometry }, { RoomEnvironment }] = await Promise.all([
        import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
      ]);
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(24.5, 1, 0.1, 100);
      camera.position.set(0, 10.5, 19.5);
      camera.lookAt(0, -0.08, 0.3);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.98;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.appendChild(renderer.domElement);
      const labelAnisotropy = renderer.capabilities.getMaxAnisotropy();

      const contextLost = (event: Event) => {
        event.preventDefault();
        onContextLost?.();
      };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);

      pmrem = new THREE.PMREMGenerator(renderer);
      environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = environment;

      scene.add(new THREE.HemisphereLight(0xf7fbff, 0x8290a8, 0.8));
      const keyLight = new THREE.DirectionalLight(0xfffcf7, 2.8);
      keyLight.position.set(-6, 10, 9);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.left = -12;
      keyLight.shadow.camera.right = 12;
      keyLight.shadow.camera.top = 9;
      keyLight.shadow.camera.bottom = -9;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 35;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.025;
      keyLight.shadow.radius = 4;
      scene.add(keyLight);
      const fill = new THREE.DirectionalLight(0xb9d6ff, 0.95);
      fill.position.set(8, 5, 3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffcfbf, 1.05);
      rim.position.set(3, 5, -9);
      scene.add(rim);

      const floorGeometry = new THREE.PlaneGeometry(24, 13);
      const floorMaterial = new THREE.ShadowMaterial({ color: 0x52627a, opacity: 0.2, transparent: true });
      geometries.push(floorGeometry);
      materials.push(floorMaterial);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -1.04, 0.55);
      floor.receiveShadow = true;
      scene.add(floor);

      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 512;
      shadowCanvas.height = 256;
      const shadowContext = shadowCanvas.getContext("2d");
      if (shadowContext) {
        const gradient = shadowContext.createRadialGradient(256, 128, 12, 256, 128, 245);
        gradient.addColorStop(0, "rgba(42,55,79,.27)");
        gradient.addColorStop(0.48, "rgba(55,68,91,.14)");
        gradient.addColorStop(1, "rgba(72,84,104,0)");
        shadowContext.fillStyle = gradient;
        shadowContext.fillRect(0, 0, 512, 256);
        const contactTexture = new THREE.CanvasTexture(shadowCanvas);
        contactTexture.colorSpace = THREE.SRGBColorSpace;
        textures.push(contactTexture);
        const contactGeometry = new THREE.PlaneGeometry(18.8, 8.2);
        const contactMaterial = new THREE.MeshBasicMaterial({ map: contactTexture, transparent: true, depthWrite: false, toneMapped: false });
        geometries.push(contactGeometry);
        materials.push(contactMaterial);
        const contactShadow = new THREE.Mesh(contactGeometry, contactMaterial);
        contactShadow.rotation.x = -Math.PI / 2;
        contactShadow.position.set(0, -1.025, 0.75);
        contactShadow.renderOrder = 1;
        scene.add(contactShadow);
      }

      const boardGeometry = new RoundedBoxGeometry(16.8, 0.58, 6.5, 6, 0.28);
      const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x8493a8, roughness: 0.34, metalness: 0.2, envMapIntensity: 0.48 });
      geometries.push(boardGeometry);
      materials.push(boardMaterial);
      const board = new THREE.Mesh(boardGeometry, boardMaterial);
      board.position.y = -0.46;
      board.castShadow = true;
      board.receiveShadow = true;
      scene.add(board);

      const rowDepth = 1.03;
      ROWS.forEach((row, rowIndex) => {
        const total = row.reduce((sum, item) => sum + (item.w ?? 1), 0) + (row.length - 1) * 0.11;
        let x = -total / 2;
        row.forEach((definition) => {
          const width = definition.w ?? 1;
          const geometry = new RoundedBoxGeometry(width - 0.09, 0.38, rowDepth - 0.1, 5, 0.13);
          const neutral = new THREE.Color("#F5F7FA");
          const keyColor = definition.finger
            ? new THREE.Color(FINGER_COLORS[definition.finger]).lerp(neutral, 0.48)
            : new THREE.Color("#E2E8F0");
          const material = new THREE.MeshStandardMaterial({
            color: keyColor,
            roughness: 0.38,
            metalness: 0.08,
            envMapIntensity: 0.32,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0,
          });
          geometries.push(geometry);
          materials.push(material);
          const root = new THREE.Group();
          root.position.set(x + width / 2, 0.04, -2.18 + rowIndex * 1.12);
          scene.add(root);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          root.add(mesh);
          keys.set(definition.code, { root, mesh, material, baseX: root.position.x, baseY: root.position.y, depression: 0, pressed: false, startedAt: 0, state: null });

          const label = LABELS[definition.code];
          const texture = labelTexture(THREE, definition.label ?? label?.base ?? definition.code, label?.shift, labelAnisotropy);
          if (texture) {
            textures.push(texture);
            const labelGeometry = new THREE.PlaneGeometry(Math.min(width * 0.8, 1.22), 0.62);
            const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1 });
            geometries.push(labelGeometry);
            materials.push(labelMaterial);
            const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
            labelMesh.rotation.x = -Math.PI / 2;
            labelMesh.position.set(0, 0.198, -0.015);
            labelMesh.renderOrder = 2;
            root.add(labelMesh);
          }
          x += width + 0.11;
        });
      });

      const onPhysicalKeyDown = (event: KeyboardEvent) => {
        if (event.repeat) return;
        const key = keys.get(event.code);
        if (key) key.pressed = true;
      };
      const onPhysicalKeyUp = (event: KeyboardEvent) => {
        const key = keys.get(event.code);
        if (key) key.pressed = false;
      };
      const releaseAllKeys = () => {
        for (const key of keys.values()) key.pressed = false;
      };
      window.addEventListener("keydown", onPhysicalKeyDown);
      window.addEventListener("keyup", onPhysicalKeyUp);
      window.addEventListener("blur", releaseAllKeys);
      detachKeyboard = () => {
        window.removeEventListener("keydown", onPhysicalKeyDown);
        window.removeEventListener("keyup", onPhysicalKeyUp);
        window.removeEventListener("blur", releaseAllKeys);
      };

      const resize = () => {
        if (!renderer) return;
        const width = Math.max(1, mount.clientWidth);
        const height = Math.max(1, mount.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        const narrowFit = Math.max(1, 2.25 / camera.aspect);
        camera.position.set(0, 10.5 * narrowFit, 19.5 * narrowFit);
        camera.lookAt(0, -0.08, 0.3);
        camera.updateProjectionMatrix();
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      const animate = (now: number) => {
        if (disposed || !renderer) return;
        for (const [code, key] of keys) {
          const elapsed = key.startedAt ? (now - key.startedAt) / 430 : 2;
          const pulse = elapsed < 1 ? Math.sin(elapsed * Math.PI) : 0;
          const targetDepression = key.pressed ? 0.16 : 0;
          const response = key.pressed ? 0.34 : 0.2;
          key.depression += (targetDepression - key.depression) * response;
          key.root.position.y = key.baseY - key.depression;
          key.root.scale.y = 1 - key.depression * 0.72;
          key.root.position.x = key.baseX + (key.state === "error" && elapsed < 1 ? Math.sin(elapsed * Math.PI * 8) * 0.08 : 0);
          const hinted = hintRef.current === code;
          key.material.emissive.set(key.state === "error" && pulse ? 0xff405f : hinted || key.pressed ? 0x3ad7b0 : 0x000000);
          key.material.emissiveIntensity = key.state === "error" ? pulse * 0.75 : hinted ? 0.28 + Math.sin(now / 360) * 0.08 : key.pressed ? 0.12 : 0;
          if (elapsed >= 1) key.state = null;
        }
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    })().catch(() => onContextLost?.());

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      detachKeyboard?.();
      keys.clear();
      geometries.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
      textures.forEach((item) => item.dispose());
      environment?.dispose();
      pmrem?.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [onContextLost]);

  return <div ref={mountRef} className={styles.keyboard3d} aria-label="ภาพแป้นพิมพ์สามมิติ" />;
});

export default Keyboard3D;
