"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────
   IcosahedronCore — a geometria viva do Reactor
   Reage ao mouse com física suave (lerp exponencial)
───────────────────────────────────────────────────── */
function IcosahedronCore() {
  const outerRef  = useRef<THREE.Mesh>(null!);
  const innerRef  = useRef<THREE.Mesh>(null!);
  const wireRef   = useRef<THREE.Mesh>(null!);
  const mouse     = useRef<[number, number]>([0, 0]);
  const rotTarget = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth  - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      ];
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    /* Smooth spring lerp toward mouse */
    const lerpFactor = 1 - Math.exp(-4 * delta);
    rotTarget.current[0] += (mouse.current[0] * 0.35 - rotTarget.current[0]) * lerpFactor;
    rotTarget.current[1] += (mouse.current[1] * 0.25 - rotTarget.current[1]) * lerpFactor;

    /* Base slow rotation + mouse influence */
    outerRef.current.rotation.y += delta * 0.09 + rotTarget.current[0] * delta * 0.4;
    outerRef.current.rotation.x = Math.sin(t * 0.18) * 0.18 + rotTarget.current[1] * 0.3;

    /* Inner sphere pulse */
    const pulse = 1 + Math.sin(t * 1.4) * 0.06;
    innerRef.current.scale.setScalar(pulse);
    innerRef.current.rotation.y -= delta * 0.22;

    /* Wireframe shell counter-spins */
    wireRef.current.rotation.y -= delta * 0.05;
    wireRef.current.rotation.z += delta * 0.03;

    /* Emissive intensity breathing */
    const mat = innerRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + Math.sin(t * 1.2) * 0.25;
  });

  return (
    <Float
      speed={0.6}
      rotationIntensity={0.15}
      floatIntensity={0.4}
    >
      {/* ── Outer glass icosahedron ── */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.55, 1]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.4}
          samples={8}
          thickness={0.35}
          roughness={0.04}
          anisotropy={0.3}
          distortion={0.08}
          distortionScale={0.2}
          temporalDistortion={0.04}
          chromaticAberration={0.06}
          color="#00C2D4"
          emissive="#00C2D4"
          emissiveIntensity={0.05}
          transmission={1}
          ior={1.6}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* ── Inner glow sphere ── */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.65, 24, 24]} />
        <meshStandardMaterial
          color="#00C2D4"
          emissive="#00C2D4"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.05}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* ── Wireframe shell ── */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.58, 1]} />
        <meshBasicMaterial
          color="#5FFFD7"
          wireframe
          transparent
          opacity={0.10}
        />
      </mesh>

      {/* ── Subtle outer aura ring ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.008, 8, 80]} />
        <meshBasicMaterial color="#00A884" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.9, 0.005, 8, 80]} />
        <meshBasicMaterial color="#6220A0" transparent opacity={0.10} />
      </mesh>
    </Float>
  );
}

/* ─────────────────────────────────────────────────────
   ReactorCore3D — exported wrapper com Canvas
───────────────────────────────────────────────────── */
interface ReactorCore3DProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ReactorCore3D({ className = "", style }: ReactorCore3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={className}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", ...style }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,194,212,0.12), transparent 70%)",
            animation: "float 3s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Canvas
        camera={{ fov: 38, position: [0, 0, 6], near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: "transparent" }}
      >
        {/* Lighting — cinematic three-point setup */}
        <ambientLight intensity={0.5} color="#e8f4f8" />
        <pointLight
          position={[4, 4, 4]}
          intensity={3.5}
          color="#00C2D4"
          distance={20}
          decay={2}
        />
        <pointLight
          position={[-4, -2, 3]}
          intensity={2}
          color="#5FFFD7"
          distance={18}
          decay={2}
        />
        <pointLight
          position={[2, -4, -2]}
          intensity={1.2}
          color="#6220A0"
          distance={16}
          decay={2}
        />
        <directionalLight
          position={[0, 8, 4]}
          intensity={0.5}
          color="#ffffff"
        />

        <IcosahedronCore />
      </Canvas>
    </div>
  );
}
