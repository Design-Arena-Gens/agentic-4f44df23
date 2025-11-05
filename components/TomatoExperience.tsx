"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef, useEffect } from 'react';

function TomatoBody({ mouthOpen }: { mouthOpen: number }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const lowerLip = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!group.current || !body.current) return;
    // Slight idle breathing/joyful sway
    group.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;
    group.current.position.y = Math.sin(Date.now() * 0.0015) * 0.02;

    if (mouth.current && lowerLip.current) {
      const open = mouthOpen; // 0..1
      mouth.current.scale.y = THREE.MathUtils.lerp(0.6, 1.2, open);
      lowerLip.current.position.y = THREE.MathUtils.lerp(-0.02, -0.12, open);
    }
  });

  const tomatoMaterial = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d71f26'),
      roughness: 0.35,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.15,
      sheen: 1.0,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color('#ff6b6b')
    });
    return m;
  }, []);

  const greenMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f8f3a', roughness: 0.6, metalness: 0.1 }), []);
  const eyeWhite = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }), []);
  const eyeBlack = useMemo(() => new THREE.MeshStandardMaterial({ color: '#101010', roughness: 0.8 }), []);
  const mouthDark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#220b0b', roughness: 1.0 }), []);
  const tongueMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff7b9c', roughness: 0.8 }), []);

  return (
    <group ref={group}>
      {/* Tomato body */}
      <mesh ref={body} castShadow receiveShadow position={[0, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={tomatoMaterial} attach="material" />
      </mesh>

      {/* Subtle bump on top */}
      <mesh position={[0, 0.95, 0]} scale={[0.4, 0.15, 0.4]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={tomatoMaterial} attach="material" />
      </mesh>

      {/* Stem */}
      <group position={[0, 1.0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.09, 0.3, 16]} />
          <primitive object={greenMaterial} attach="material" />
        </mesh>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} rotation={[0, (i / 5) * Math.PI * 2, Math.PI / 2]} position={[0, 0.05, 0]}>
            <torusGeometry args={[0.25, 0.04, 12, 40, Math.PI * 0.85]} />
            <primitive object={greenMaterial} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Eyes */}
      <group position={[0, 0.15, 0.96]}>
        <group position={[-0.35, 0.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 24, 24]} />
            <primitive object={eyeWhite} attach="material" />
          </mesh>
          <mesh position={[0.03, -0.01, 0.1]}>
            <sphereGeometry args={[0.06, 24, 24]} />
            <primitive object={eyeBlack} attach="material" />
          </mesh>
        </group>
        <group position={[0.35, 0.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 24, 24]} />
            <primitive object={eyeWhite} attach="material" />
          </mesh>
          <mesh position={[0.03, -0.01, 0.1]}>
            <sphereGeometry args={[0.06, 24, 24]} />
            <primitive object={eyeBlack} attach="material" />
          </mesh>
        </group>
      </group>

      {/* Nose */}
      <mesh position={[0, -0.05, 0.98]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={tomatoMaterial} attach="material" />
      </mesh>

      {/* Mouth */}
      <group position={[0, -0.2, 0.95]}>
        {/* inner mouth (dark) */}
        <mesh ref={mouth}>
          <circleGeometry args={[0.18, 32]} />
          <primitive object={mouthDark} attach="material" />
        </mesh>
        {/* lower lip suggestion */}
        <mesh ref={lowerLip} position={[0, -0.12, 0.01]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.16, 0.03, 10, 40, Math.PI]} />
          <primitive object={tomatoMaterial} attach="material" />
        </mesh>
        {/* tongue */}
        <mesh position={[0, -0.02, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.12, 24, 1, 0, Math.PI]} />
          <primitive object={tongueMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function ForkHand({ t }: { t: number | (() => number) }) {
  const forkGroup = useRef<THREE.Group>(null);
  const slice = useRef<THREE.Mesh>(null);

  const getTime = typeof t === 'function' ? (t as () => number) : () => (t as number);

  useFrame(() => {
    if (!forkGroup.current || !slice.current) return;
    const time = getTime();

    // Timeline: 0-2s move in, 2-2.5s slice disappears into mouth, 2-5s stay nearby
    const startPos = new THREE.Vector3(2.8, -0.1, 1.2);
    const endPos = new THREE.Vector3(0.0, -0.25, 1.1);

    if (time < 2.0) {
      const k = THREE.MathUtils.smoothstep(time / 2.0, 0, 1);
      forkGroup.current.position.lerpVectors(startPos, endPos, k);
      forkGroup.current.rotation.z = THREE.MathUtils.lerp(-0.2, 0.05, k);
    } else {
      forkGroup.current.position.copy(endPos);
      forkGroup.current.rotation.z = 0.05;
    }

    // Handle slice consumption
    if (time < 2.0) {
      slice.current.scale.setScalar(1);
    } else {
      const k = Math.min((time - 2.0) / 0.5, 1);
      const s = THREE.MathUtils.lerp(1, 0, k);
      slice.current.scale.set(s, s, s);
      slice.current.position.set(0, THREE.MathUtils.lerp(0.02, -0.05, k), THREE.MathUtils.lerp(0.07, -0.05, k));
    }
  });

  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d0d4d8', metalness: 0.9, roughness: 0.2 }), []);
  const handleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b5b5b5', metalness: 0.6, roughness: 0.5 }), []);
  const skin = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f4c4b3', roughness: 0.8 }), []);
  const sliceMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#d71f26', roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.2 }), []);

  return (
    <group ref={forkGroup} position={[2.8, -0.1, 1.2]}>
      {/* Fork handle */}
      <mesh castShadow position={[-0.9, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.12]} />
        <primitive object={handleMat} attach="material" />
      </mesh>
      {/* Fork neck */}
      <mesh castShadow position={[-0.1, 0, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.08]} />
        <primitive object={metal} attach="material" />
      </mesh>
      {/* Fork head and tines */}
      <group position={[0.25, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.04, 0.12]} />
          <primitive object={metal} attach="material" />
        </mesh>
        {[-0.07, -0.02, 0.03, 0.08].map((z, i) => (
          <mesh castShadow key={i} position={[0.1, 0, z]}>
            <boxGeometry args={[0.14, 0.02, 0.012]} />
            <primitive object={metal} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Tomato slice on tines */}
      <mesh ref={slice} castShadow position={[0.14, 0.02, 0.07]} rotation={[0.2, 0.4, 0]}>
        <sphereGeometry args={[0.22, 24, 24, 0, Math.PI]} />
        <primitive object={sliceMat} attach="material" />
      </mesh>

      {/* Simple hand shape */}
      <group position={[-1.8, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.25, 0.35]} />
          <primitive object={skin} attach="material" />
        </mesh>
        <mesh castShadow position={[0.35, -0.05, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.5, 0.18, 0.3]} />
          <primitive object={skin} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function Scene() {
  const start = useRef<number>(0);
  const mouthOpenRef = useRef<number>(0);

  useEffect(() => {
    start.current = performance.now();
  }, []);

  const t = () => (performance.now() - start.current) / 1000;

  useFrame(() => {
    const time = t();
    // Chew 2s..5s with slow joyful motion
    if (time < 2) {
      mouthOpenRef.current = 0.2 + (time / 2) * 0.2; // anticipatory slight open
    } else if (time <= 5) {
      const chew = Math.max(0, Math.sin((time - 2) * Math.PI * 1.2) * 0.5 + 0.5);
      mouthOpenRef.current = 0.55 + chew * 0.35;
    } else {
      // Loop the sequence
      start.current = performance.now();
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight position={[-4, 4, 2]} angle={0.6} intensity={0.5} penumbra={0.7} />

      {/* Ground subtle shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.15} />
      </mesh>

      <TomatoBody mouthOpen={mouthOpenRef.current} />
      <ForkHand t={t} />

      {/* Camera controls locked to front-facing but allow tiny orbit */}
      <OrbitControls enablePan={false} minDistance={4.8} maxDistance={6.2} minPolarAngle={Math.PI/2 - 0.2} maxPolarAngle={Math.PI/2 + 0.2} enableZoom={true} />
    </>
  );
}

export default function TomatoExperience() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.8], fov: 45 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene />
    </Canvas>
  );
}
