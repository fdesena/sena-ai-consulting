import { createRef, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  MeshTransmissionMaterial,
  PerspectiveCamera,
  RoundedBox,
  Text,
} from "@react-three/drei";
import {
  ITEMS,
  AREAS,
  SPHERE_POINTS,
  N,
  NA,
  LEAD,
  TAIL,
  SLOT_MS,
  AUTO_EPS,
  SMOOTHING,
  LINE,
  lerp,
  clamp01,
  angleFor,
  textOpacityAt,
  easeOutCubic,
  type OrbitItem,
} from "./orbit-hero-data";

const RADIUS = 1.7;
const CARD_W = 0.62;
const CARD_H = 0.3;
const ORANGE = "#FC7C34";
const FEATURED_SCALE = 1.8;
const FEATURED_Y = 0.25;
const FEATURED_Z = 0.92;
const FEATURED_DEPTH = 0.12;
const ANGLE_WINDOW = 0.45;

const ENTRY_START = { x: -1.7, y: -1.95 };
const ENTRY_CTRL = { x: -1.7, y: 0.35 };
const EXIT_CTRL = { x: 1.7, y: 0.35 };
const EXIT_END = { x: 1.7, y: 1.95 };

function bezier2(t: number, a: number, b: number, c: number) {
  const mt = 1 - t;
  return mt * mt * a + 2 * mt * t * b + t * t * c;
}

type Props = {
  pRef: React.MutableRefObject<number>;
  onSlideChange: (idx: number) => void;
  onLocalChange: (idx: number) => void;
  onActiveItemChange: (idx: number) => void;
  onOpenModal: () => void;
};

function RefractionBackdrop() {
  return (
    <group position={[0, 0, -2.85]}>
      <mesh scale={[6.4, 4.3, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#f1eee8" />
      </mesh>

      <mesh position={[-2.1, 1.25, 0.12]} scale={[1.65, 1.05, 0.35]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffb46f" transparent opacity={0.72} />
      </mesh>
      <mesh position={[2.25, -1.1, 0.08]} scale={[1.8, 1.15, 0.35]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffd7b4" transparent opacity={0.82} />
      </mesh>
      <mesh position={[0.35, 1.8, 0.05]} scale={[1.25, 0.72, 0.28]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function LiquidMaterial({ materialRef }: { materialRef: React.MutableRefObject<any> }) {
  return (
    <MeshTransmissionMaterial
      ref={materialRef}
      samples={6}
      resolution={512}
      transmission={1}
      thickness={0.72}
      backside
      backsideThickness={0.38}
      ior={1.33}
      roughness={0.08}
      chromaticAberration={0.055}
      anisotropicBlur={0.08}
      distortion={0.14}
      distortionScale={0.32}
      temporalDistortion={0.035}
      clearcoat={1}
      clearcoatRoughness={0.08}
      attenuationColor={ORANGE}
      attenuationDistance={1.1}
      color="#fff7ef"
      envMapIntensity={0.85}
      toneMapped
      transparent
      depthTest={false}
    />
  );
}

function GlassRim({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <RoundedBox
      position={position}
      args={[
        CARD_W * FEATURED_SCALE + 0.035,
        CARD_H * FEATURED_SCALE + 0.035,
        FEATURED_DEPTH + 0.025,
      ]}
      radius={0.055}
      smoothness={5}
      scale={scale}
      renderOrder={8}
    >
      <meshPhysicalMaterial
        color="#ffb26f"
        transparent
        opacity={0.22}
        roughness={0.12}
        clearcoat={1}
        depthWrite={false}
      />
    </RoundedBox>
  );
}

function CardsRig({
  pRef,
  onSlideChange,
  onLocalChange,
  onActiveItemChange,
  onOpenModal,
}: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const featuredGroupRef = useRef<THREE.Group>(null!);
  const featuredRef = useRef<THREE.Mesh>(null!);
  const featuredMaterialRef = useRef<any>(null!);
  const featuredTextRef = useRef<any>(null!);
  const prevFeaturedGroupRef = useRef<THREE.Group>(null!);
  const prevFeaturedRef = useRef<THREE.Mesh>(null!);
  const prevFeaturedMaterialRef = useRef<any>(null!);
  const prevFeaturedTextRef = useRef<any>(null!);
  const featuredHoverRef = useRef(false);

  const cardRefs = useMemo(
    () =>
      SPHERE_POINTS.map(() => ({
        mesh: createRef<THREE.Mesh>(),
        material: createRef<THREE.MeshPhysicalMaterial>(),
      })),
    [],
  );

  const areaColors = useMemo(() => AREAS.map((a) => new THREE.Color(a.color)), []);
  const whiteColor = useMemo(() => new THREE.Color("#ffffff"), []);
  const orangeColor = useMemo(() => new THREE.Color(ORANGE), []);
  const lineColor = useMemo(() => new THREE.Color(LINE), []);
  const blackColor = useMemo(() => new THREE.Color("#000000"), []);

  const pointTransforms = useMemo(() => {
    const dummy = new THREE.Object3D();
    return SPHERE_POINTS.map((pt) => {
      dummy.position.set(pt.x * RADIUS, pt.y * RADIUS, pt.z * RADIUS);
      dummy.lookAt(0, 0, 0);
      return { position: dummy.position.clone(), quaternion: dummy.quaternion.clone() };
    });
  }, []);

  const smoothPRef = useRef(0);
  const lastSlideIdxRef = useRef(-99);
  const lastLocalIdxRef = useRef(-99);
  const lastActiveIndexRef = useRef(-99);
  const lastAreaIndexForClockRef = useRef(-99);
  const areaEnterTimeRef = useRef(0);
  const lastFeaturedIndexRef = useRef(-99);
  const prevItemRef = useRef<OrbitItem | null>(null);
  const lastCardTextRef = useRef("");
  const lastPrevCardTextRef = useRef("");
  const reduce = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((state) => {
    const t = reduce ? 0 : state.clock.elapsedTime * 1000;
    const p = pRef.current;
    smoothPRef.current += (p - smoothPRef.current) * (reduce ? 1 : SMOOTHING);
    const smoothP = smoothPRef.current;
    const tiltX = 0.1 + Math.sin(t * 0.00018) * 0.03;

    const autoMode = smoothP <= AUTO_EPS;
    let c: number;
    let areaIndex: number;

    if (autoMode) {
      lastAreaIndexForClockRef.current = -99;
      const elapsed = t % (N * SLOT_MS);
      c = elapsed / SLOT_MS;
      areaIndex = -1;
    } else {
      const areaProgress = clamp01((smoothP - LEAD) / (1 - LEAD - TAIL)) * (NA - 0.0001);
      areaIndex = Math.min(NA - 1, Math.floor(areaProgress));
      if (areaIndex !== lastAreaIndexForClockRef.current) {
        lastAreaIndexForClockRef.current = areaIndex;
        areaEnterTimeRef.current = t;
      }
      const elapsedInArea = reduce ? 0 : t - areaEnterTimeRef.current;
      const subT = (elapsedInArea % (SLOT_MS * 2)) / SLOT_MS;
      c = areaIndex * 2 + subT;
    }

    const activeIndex = Math.min(N - 1, Math.floor(c));
    const loc = c - activeIndex;
    const angle = angleFor(c);
    const boostT = textOpacityAt(loc);

    groupRef.current.rotation.set(tiltX, angle, 0);
    groupRef.current.updateMatrixWorld();

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const cosT = Math.cos(tiltX);
    const sinT = Math.sin(tiltX);
    let focusIdx = -1;

    for (let i = 0; i < SPHERE_POINTS.length; i++) {
      const pt = SPHERE_POINTS[i];
      const mesh = cardRefs[i].mesh.current;
      const material = cardRefs[i].material.current;
      if (!mesh || !material) continue;

      const isFocus = pt.label === activeIndex;
      const boost = isFocus ? boostT : 0;
      const item = pt.label !== null ? ITEMS[pt.label] : null;

      const x1 = pt.x * cosA - pt.z * sinA;
      const z1 = pt.x * sinA + pt.z * cosA;
      const z2 = pt.y * sinT + z1 * cosT;
      const depthT = clamp01((z2 + 1) / 2);

      if (item) {
        material.opacity = lerp(lerp(0.34, 0.74, depthT), 0, boost);
        material.color.lerpColors(whiteColor, areaColors[item.area], lerp(0.18, 0.48, depthT));
        material.emissive.copy(areaColors[item.area]);
        material.emissiveIntensity = lerp(0.05, 0.16, depthT);
        material.roughness = lerp(0.28, 0.12, depthT);
      } else {
        material.opacity = lerp(0.1, 0.28, depthT);
        material.color.copy(lineColor);
        material.emissive.copy(blackColor);
        material.emissiveIntensity = 0;
      }

      if (isFocus) focusIdx = i;
    }

    if (activeIndex !== lastFeaturedIndexRef.current) {
      prevItemRef.current =
        lastFeaturedIndexRef.current >= 0 ? ITEMS[lastFeaturedIndexRef.current] : null;
      lastFeaturedIndexRef.current = activeIndex;
    }

    const prevItem = prevItemRef.current;
    const item = focusIdx !== -1 ? ITEMS[activeIndex] : null;
    const hoverBoost = featuredHoverRef.current ? 0.055 : 0;
    const swing = loc < ANGLE_WINDOW ? easeOutCubic(loc / ANGLE_WINDOW) : 1;

    if (featuredGroupRef.current && featuredRef.current && item) {
      const curveX = bezier2(swing, ENTRY_START.x, ENTRY_CTRL.x, 0);
      const curveY = bezier2(swing, ENTRY_START.y, ENTRY_CTRL.y, 0);
      const curveScale = lerp(0.72, 1, swing) + hoverBoost;

      featuredGroupRef.current.visible = true;
      featuredGroupRef.current.position.set(curveX, FEATURED_Y + curveY, FEATURED_Z);
      featuredGroupRef.current.scale.setScalar(curveScale);
      featuredGroupRef.current.rotation.z = lerp(-0.12, 0, swing);

      if (featuredMaterialRef.current) {
        featuredMaterialRef.current.emissive.copy(orangeColor);
        featuredMaterialRef.current.emissiveIntensity = 0.035 + hoverBoost * 0.3;
      }

      if (featuredTextRef.current) {
        if (lastCardTextRef.current !== item.tag) {
          lastCardTextRef.current = item.tag;
          featuredTextRef.current.text = item.tag;
          featuredTextRef.current.sync();
        }
        featuredTextRef.current.fillOpacity = 1;
      }
    } else if (featuredGroupRef.current) {
      featuredGroupRef.current.visible = false;
    }

    if (prevFeaturedGroupRef.current && prevFeaturedRef.current && prevItem && loc < ANGLE_WINDOW) {
      const curveX = bezier2(swing, 0, EXIT_CTRL.x, EXIT_END.x);
      const curveY = bezier2(swing, 0, EXIT_CTRL.y, EXIT_END.y);
      const curveScale = lerp(1, 0.72, swing);

      prevFeaturedGroupRef.current.visible = true;
      prevFeaturedGroupRef.current.position.set(curveX, FEATURED_Y + curveY, FEATURED_Z - 0.015);
      prevFeaturedGroupRef.current.scale.setScalar(curveScale);
      prevFeaturedGroupRef.current.rotation.z = lerp(0, 0.12, swing);

      if (prevFeaturedMaterialRef.current) {
        prevFeaturedMaterialRef.current.emissive.copy(orangeColor);
        prevFeaturedMaterialRef.current.emissiveIntensity = 0.03;
      }

      if (prevFeaturedTextRef.current) {
        if (lastPrevCardTextRef.current !== prevItem.tag) {
          lastPrevCardTextRef.current = prevItem.tag;
          prevFeaturedTextRef.current.text = prevItem.tag;
          prevFeaturedTextRef.current.sync();
        }
        prevFeaturedTextRef.current.fillOpacity = 1;
      }
    } else if (prevFeaturedGroupRef.current) {
      prevFeaturedGroupRef.current.visible = false;
    }

    const newSlideIdx = autoMode ? -1 : areaIndex;
    const newLocalIdx = autoMode ? 0 : activeIndex % 2;
    if (newSlideIdx !== lastSlideIdxRef.current) {
      lastSlideIdxRef.current = newSlideIdx;
      onSlideChange(newSlideIdx);
    }
    if (newLocalIdx !== lastLocalIdxRef.current) {
      lastLocalIdxRef.current = newLocalIdx;
      onLocalChange(newLocalIdx);
    }
    if (activeIndex !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = activeIndex;
      onActiveItemChange(activeIndex);
    }
  });

  return (
    <>
      <RefractionBackdrop />

      <group ref={groupRef}>
        {SPHERE_POINTS.map((pt, i) => {
          const item = pt.label !== null ? ITEMS[pt.label] : null;
          const w = item ? CARD_W : CARD_W * 0.64;
          const h = item ? CARD_H : CARD_H * 0.64;
          return (
            <group
              key={i}
              position={pointTransforms[i].position}
              quaternion={pointTransforms[i].quaternion}
            >
              <RoundedBox ref={cardRefs[i].mesh} args={[w, h, 0.065]} radius={0.045} smoothness={4}>
                <meshPhysicalMaterial
                  ref={cardRefs[i].material}
                  transparent
                  roughness={0.18}
                  metalness={0}
                  clearcoat={0.85}
                  clearcoatRoughness={0.1}
                  envMapIntensity={0.8}
                  depthWrite={false}
                />
              </RoundedBox>
            </group>
          );
        })}
      </group>

      <group ref={featuredGroupRef} visible={false}>
        <GlassRim position={[0, 0, -0.018]} />
        <RoundedBox
          ref={featuredRef}
          args={[CARD_W * FEATURED_SCALE, CARD_H * FEATURED_SCALE, FEATURED_DEPTH]}
          radius={0.055}
          smoothness={5}
          renderOrder={10}
          onClick={onOpenModal}
          onPointerOver={() => {
            featuredHoverRef.current = true;
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            featuredHoverRef.current = false;
            document.body.style.cursor = "auto";
          }}
        >
          <LiquidMaterial materialRef={featuredMaterialRef} />
        </RoundedBox>
        <Text
          ref={featuredTextRef}
          position={[0, 0, FEATURED_DEPTH * 0.62]}
          renderOrder={11}
          material-depthTest={false}
          fontSize={0.088}
          fontWeight={700}
          letterSpacing={-0.02}
          color="#1A1916"
          anchorX="center"
          anchorY="middle"
          maxWidth={CARD_W * FEATURED_SCALE * 0.82}
        >
          {" "}
        </Text>
      </group>

      <group ref={prevFeaturedGroupRef} visible={false}>
        <GlassRim position={[0, 0, -0.018]} />
        <RoundedBox
          ref={prevFeaturedRef}
          args={[CARD_W * FEATURED_SCALE, CARD_H * FEATURED_SCALE, FEATURED_DEPTH]}
          radius={0.055}
          smoothness={5}
          renderOrder={10}
        >
          <LiquidMaterial materialRef={prevFeaturedMaterialRef} />
        </RoundedBox>
        <Text
          ref={prevFeaturedTextRef}
          position={[0, 0, FEATURED_DEPTH * 0.62]}
          renderOrder={11}
          material-depthTest={false}
          fontSize={0.088}
          fontWeight={700}
          letterSpacing={-0.02}
          color="#1A1916"
          anchorX="center"
          anchorY="middle"
          maxWidth={CARD_W * FEATURED_SCALE * 0.82}
        >
          {" "}
        </Text>
      </group>
    </>
  );
}

export default function OrbitGlobeScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.25, 6.4]} fov={34} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[3.5, 4.5, 5]} intensity={1.65} color="#fffaf4" />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#ffd4ae" />
      <pointLight position={[0, 0.5, -1.5]} intensity={1.2} color={ORANGE} distance={7} />
      <Environment preset="studio" environmentIntensity={0.85} />
      <CardsRig {...props} />
      <ContactShadows
        position={[0, -RADIUS - 0.55, 0]}
        opacity={0.24}
        scale={9}
        blur={3.2}
        far={4}
        resolution={512}
        color="#6b5545"
      />
    </Canvas>
  );
}
