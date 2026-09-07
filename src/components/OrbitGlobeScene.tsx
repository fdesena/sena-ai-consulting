import { createRef, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  RoundedBox,
  Text,
  PerspectiveCamera,
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
const FEATURED_SCALE = 1.75;
const FEATURED_Y = 0.25;
const FEATURED_Z = 0.9;
// Same approach window angleFor() uses to swing the background globe into place — the
// featured-card crossfade runs inside this exact window so both move together and land
// at the same instant, instead of the card animating after the globe has already stopped.
const ANGLE_WINDOW = 0.45;

// Quadratic-bezier swoosh: the incoming card rises from below-left, curving into the
// center, while the outgoing card continues that same curling motion up and to the right —
// one continuous, fluid arc that echoes the globe's own rotation instead of a flat slide.
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

function CardsRig({ pRef, onSlideChange, onLocalChange, onActiveItemChange, onOpenModal }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const featuredRef = useRef<THREE.Mesh>(null!);
  const featuredMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- drei's troika Text ref type is not exported cleanly
  const featuredTextRef = useRef<any>(null!);
  const prevFeaturedRef = useRef<THREE.Mesh>(null!);
  const prevFeaturedMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- drei's troika Text ref type is not exported cleanly
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
      const y2 = pt.y * cosT - z1 * sinT;
      const z2 = pt.y * sinT + z1 * cosT;
      const depthT = clamp01((z2 + 1) / 2);

      if (item) {
        // fades out as the card hands off to the fixed, larger featured card at screen center
        material.opacity = lerp(lerp(0.5, 0.78, depthT), 0, boost);
        material.color.lerpColors(whiteColor, areaColors[item.area], lerp(0.3, 0.6, depthT));
        material.emissive.copy(areaColors[item.area]);
        material.emissiveIntensity = lerp(0.12, 0.28, depthT);
      } else {
        material.opacity = lerp(0.14, 0.32, depthT);
        material.color.copy(lineColor);
        material.emissive.copy(blackColor);
        material.emissiveIntensity = 0;
      }

      if (isFocus) focusIdx = i;
    }

    // Track the previous active item so its card can curve away while the new one curves
    // in, both inside the exact window the background globe is rotating.
    if (activeIndex !== lastFeaturedIndexRef.current) {
      prevItemRef.current =
        lastFeaturedIndexRef.current >= 0 ? ITEMS[lastFeaturedIndexRef.current] : null;
      lastFeaturedIndexRef.current = activeIndex;
    }
    const prevItem = prevItemRef.current;

    // Featured card — same glass material/geometry family as the small orbiting cards, just
    // bigger and brighter orange. It curves in from below-left while the outgoing word (on a
    // second identical card) curves away up-right, synchronized to the globe's own swing.
    const featured = featuredRef.current;
    const featuredMat = featuredMaterialRef.current;
    const featuredText = featuredTextRef.current;
    const item = focusIdx !== -1 ? ITEMS[activeIndex] : null;
    const hoverBoost = featuredHoverRef.current ? 0.08 : 0;
    const swing = loc < ANGLE_WINDOW ? easeOutCubic(loc / ANGLE_WINDOW) : 1;

    if (featured && featuredMat && item) {
      const curveX = bezier2(swing, ENTRY_START.x, ENTRY_CTRL.x, 0);
      const curveY = bezier2(swing, ENTRY_START.y, ENTRY_CTRL.y, 0);
      const curveScale = lerp(0.72, 1, swing);

      featured.visible = true;
      featured.position.x = curveX;
      featured.position.y = FEATURED_Y + curveY;
      featured.scale.setScalar(curveScale + hoverBoost);
      featuredMat.opacity = 1;
      featuredMat.emissive.copy(orangeColor);
      featuredMat.emissiveIntensity = 0.12 + hoverBoost * 0.2;
      if (featuredText) {
        featuredText.position.x = curveX;
        featuredText.position.y = FEATURED_Y + curveY;
        if (lastCardTextRef.current !== item.tag) {
          lastCardTextRef.current = item.tag;
          featuredText.text = item.tag;
          featuredText.sync();
        }
        featuredText.fillOpacity = 1;
      }
    } else if (featured) {
      featured.visible = false;
    }

    // Outgoing card — only present during the swing, curving away in the same direction.
    const prevFeatured = prevFeaturedRef.current;
    const prevFeaturedMat = prevFeaturedMaterialRef.current;
    const prevFeaturedText = prevFeaturedTextRef.current;
    if (prevFeatured && prevFeaturedMat && prevItem && loc < ANGLE_WINDOW) {
      const curveX = bezier2(swing, 0, EXIT_CTRL.x, EXIT_END.x);
      const curveY = bezier2(swing, 0, EXIT_CTRL.y, EXIT_END.y);
      const curveScale = lerp(1, 0.72, swing);

      prevFeatured.visible = true;
      prevFeatured.position.x = curveX;
      prevFeatured.position.y = FEATURED_Y + curveY;
      prevFeatured.scale.setScalar(curveScale);
      prevFeaturedMat.opacity = 1;
      prevFeaturedMat.emissive.copy(orangeColor);
      prevFeaturedMat.emissiveIntensity = 0.12;
      if (prevFeaturedText) {
        prevFeaturedText.position.x = curveX;
        prevFeaturedText.position.y = FEATURED_Y + curveY;
        if (lastPrevCardTextRef.current !== prevItem.tag) {
          lastPrevCardTextRef.current = prevItem.tag;
          prevFeaturedText.text = prevItem.tag;
          prevFeaturedText.sync();
        }
        prevFeaturedText.fillOpacity = 1;
      }
    } else if (prevFeatured) {
      prevFeatured.visible = false;
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
              <RoundedBox ref={cardRefs[i].mesh} args={[w, h, 0.05]} radius={0.03} smoothness={3}>
                <meshPhysicalMaterial
                  ref={cardRefs[i].material}
                  transparent
                  roughness={0.35}
                  metalness={0}
                  clearcoat={0.3}
                  clearcoatRoughness={0.3}
                  envMapIntensity={0.5}
                />
              </RoundedBox>
            </group>
          );
        })}
      </group>

      {/* Featured card — fixed at screen center, same glass material family, larger + brighter
          orange. depthTest is off (with a high renderOrder) so it always reads on top of the
          background globe instead of being occluded when a small card swings near the camera. */}
      <RoundedBox
        ref={featuredRef}
        position={[0, FEATURED_Y, FEATURED_Z]}
        args={[CARD_W * FEATURED_SCALE, CARD_H * FEATURED_SCALE, 0.075]}
        radius={0.04}
        smoothness={4}
        visible={false}
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
        <meshPhysicalMaterial
          ref={featuredMaterialRef}
          depthTest={false}
          transmission={0.92}
          thickness={0.45}
          ior={1.4}
          roughness={0.22}
          metalness={0}
          clearcoat={0.5}
          clearcoatRoughness={0.15}
          iridescence={0.2}
          iridescenceIOR={1.3}
          attenuationColor={ORANGE}
          attenuationDistance={0.65}
          color="#FFDDBB"
          envMapIntensity={0.4}
        />
      </RoundedBox>
      <Text
        ref={featuredTextRef}
        position={[0, FEATURED_Y, FEATURED_Z + 0.04]}
        renderOrder={11}
        material-depthTest={false}
        fontSize={0.09}
        fontWeight={700}
        color="#1A1916"
        anchorX="center"
        anchorY="middle"
        maxWidth={CARD_W * FEATURED_SCALE * 0.85}
      >
        {" "}
      </Text>

      {/* Outgoing twin — same card, curving away as the featured one curves in */}
      <RoundedBox
        ref={prevFeaturedRef}
        position={[0, FEATURED_Y, FEATURED_Z]}
        args={[CARD_W * FEATURED_SCALE, CARD_H * FEATURED_SCALE, 0.075]}
        radius={0.04}
        smoothness={4}
        visible={false}
        renderOrder={10}
      >
        <meshPhysicalMaterial
          ref={prevFeaturedMaterialRef}
          depthTest={false}
          transmission={0.92}
          thickness={0.45}
          ior={1.4}
          roughness={0.22}
          metalness={0}
          clearcoat={0.5}
          clearcoatRoughness={0.15}
          iridescence={0.2}
          iridescenceIOR={1.3}
          attenuationColor={ORANGE}
          attenuationDistance={0.65}
          color="#FFDDBB"
          envMapIntensity={0.4}
        />
      </RoundedBox>
      <Text
        ref={prevFeaturedTextRef}
        position={[0, FEATURED_Y, FEATURED_Z + 0.04]}
        renderOrder={11}
        material-depthTest={false}
        fontSize={0.09}
        fontWeight={700}
        color="#1A1916"
        anchorX="center"
        anchorY="middle"
        maxWidth={CARD_W * FEATURED_SCALE * 0.85}
      >
        {" "}
      </Text>
    </>
  );
}

export default function OrbitGlobeScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.25, 6.4]} fov={34} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} />
      <pointLight position={[0, 0.5, -5]} intensity={0.6} color="#FC7C34" />
      <Environment preset="studio" />
      <CardsRig {...props} />
      <ContactShadows
        position={[0, -RADIUS - 0.55, 0]}
        opacity={0.35}
        scale={9}
        blur={2.6}
        far={4}
        resolution={512}
        color="#1A1916"
      />
    </Canvas>
  );
}
