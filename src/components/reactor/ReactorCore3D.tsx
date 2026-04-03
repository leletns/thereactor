"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────
   HexCrystal — cristal hexagonal com material holográfico
   iridescente que muda de cor com o ângulo de visão
───────────────────────────────────────────────────── */
function HexCrystal() {
  const bodyRef  = useRef<THREE.Mesh>(null!);
  const coreRef  = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const mouse     = useRef<[number, number]>([0, 0]);
  const rotTarget = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      ];
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const lerp = 1 - Math.exp(-3 * delta);

    rotTarget.current[0] += (mouse.current[0] * 0.35 - rotTarget.current[0]) * lerp;
    rotTarget.current[1] += (mouse.current[1] * 0.25 - rotTarget.current[1]) * lerp;

    groupRef.current.rotation.y += delta * 0.08 + rotTarget.current[0] * delta * 0.5;
    groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.12 + rotTarget.current[1] * 0.3;

    // Inner glow core pulse
    const pulse = 1 + Math.sin(t * 1.6) * 0.12;
    coreRef.current.scale.setScalar(pulse);
    const coreMat = coreRef.current.material as THREE.MeshStandardMaterial;
    coreMat.emissiveIntensity = 1.2 + Math.sin(t * 1.4) * 0.5;

    // Rings orbit
    ring1Ref.current.rotation.y += delta * 0.22;
    ring1Ref.current.rotation.x = Math.sin(t * 0.25) * 0.3;
    ring2Ref.current.rotation.z -= delta * 0.18;
    ring2Ref.current.rotation.y = Math.cos(t * 0.2) * 0.4;
    ring3Ref.current.rotation.x += delta * 0.14;
    ring3Ref.current.rotation.z = Math.sin(t * 0.3) * 0.2;
  });

  // Holographic iridescent material
  const hexMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#1a0535"),
    metalness: 0.9,
    roughness: 0.04,
    iridescence: 1,
    iridescenceIOR: 2.2,
    iridescenceThicknessRange: [80, 1200] as unknown as [number, number],
    envMapIntensity: 3,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    side: THREE.DoubleSide,
  });

  return (
    <Float speed={0.5} rotationIntensity={0.08} floatIntensity={0.35}>
      <group ref={groupRef}>
        {/* ── Main hexagonal prism body ── */}
        <mesh ref={bodyRef} material={hexMat}>
          <cylinderGeometry args={[1.2, 1.4, 2.6, 6, 1]} />
        </mesh>

        {/* ── Top crystal point ── */}
        <mesh position={[0, 1.75, 0]} material={hexMat}>
          <cylinderGeometry args={[0, 1.2, 0.9, 6, 1]} />
        </mesh>

        {/* ── Bottom crystal point ── */}
        <mesh position={[0, -1.75, 0]} material={hexMat}>
          <cylinderGeometry args={[1.2, 0, 0.9, 6, 1]} />
        </mesh>

        {/* ── Inner glow core ── */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            color="#00C2D4"
            emissive="#00C2D4"
            emissiveIntensity={1.5}
            transparent
            opacity={0.75}
            roughness={0.1}
            metalness={0.0}
          />
        </mesh>

        {/* ── Outer hexagonal ring (primary orbit) ── */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.5, 0.022, 6, 6]} />
          <meshStandardMaterial
            color="#5FFFD7"
            emissive="#00C2D4"
            emissiveIntensity={0.6}
            transparent
            opacity={0.55}
          />
        </mesh>

        {/* ── Second tilted ring ── */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, Math.PI / 5]}>
          <torusGeometry args={[2.1, 0.012, 6, 6]} />
          <meshStandardMaterial
            color="#6220A0"
            emissive="#6220A0"
            emissiveIntensity={0.5}
            transparent
            opacity={0.45}
          />
        </mesh>

        {/* ── Third thin ring ── */}
        <mesh ref={ring3Ref} rotation={[Math.PI / 5, Math.PI / 4, 0]}>
          <torusGeometry args={[1.85, 0.008, 6, 6]} />
          <meshStandardMaterial
            color="#00A884"
            emissive="#00A884"
            emissiveIntensity={0.4}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* ── Wireframe facet overlay ── */}
        <mesh>
          <cylinderGeometry args={[1.21, 1.41, 2.62, 6, 1]} />
          <meshBasicMaterial
            color="#8B6FFF"
            wireframe
            transparent
            opacity={0.07}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────────────
   ReactorCore3D — exported Canvas wrapper
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
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(98,32,160,0.15), rgba(0,194,212,0.10) 50%, transparent 70%)",
            animation: "float 3s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Canvas
        camera={{ fov: 32, position: [0, 0, 7.5], near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} color="#f0f0ff" />
        <pointLight position={[5, 5, 5]}   intensity={8}  color="#6220A0" distance={25} decay={2} />
        <pointLight position={[-5, 3, 3]}  intensity={6}  color="#00C2D4" distance={22} decay={2} />
        <pointLight position={[0, -5, 2]}  intensity={4}  color="#00A884" distance={20} decay={2} />
        <pointLight position={[3, 0, -3]}  intensity={3}  color="#FF9EFF" distance={18} decay={2} />
        <directionalLight position={[0, 8, 4]} intensity={0.6} color="#ffffff" />

        <Environment preset="studio" />

        <HexCrystal />
      </Canvas>
    </div>
  );
}
