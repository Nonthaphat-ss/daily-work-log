import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GALAXY_SETTINGS } from '../constants/galaxyConfig';

function StarNode({ star, categories, onSelect, isSelected }) {
    const coreRef = useRef();
    const bodyRef = useRef();
    const coronaRef = useRef();
    const [hovered, setHovered] = useState(false);

    const primaryColor = useMemo(() => {
        const matched = categories.find(c => star.categoryIds?.includes(c.id));
        return matched ? matched.color : '#38bdf8';
    }, [categories, star.categoryIds]);

    const starSize = useMemo(() => {
        const length = star.content ? star.content.length : 0;
        const calculated = (GALAXY_SETTINGS.minNodeSize || 0.8) + (length / (GALAXY_SETTINGS.contentLengthDivisor || 500));
        return Math.min(calculated, GALAXY_SETTINGS.maxNodeSize || 2.5);
    }, [star.content]);

    const twinkleOffset = useMemo(() => Math.random() * 100, []);

    // 🌟 ใช้ state.clock.getElapsedTime() แทน destructuring เพื่อแก้ Warning
    useFrame((state) => {
        const t = state.clock.getElapsedTime() * 2 + twinkleOffset;
        const pulse = Math.sin(t) * 0.08;
        const intensityFactor = hovered || isSelected ? 1.4 : 1.0;

        if (coreRef.current && bodyRef.current && coronaRef.current) {
            const currentScale = intensityFactor + pulse;
            coreRef.current.scale.setScalar(currentScale * 0.45);
            bodyRef.current.scale.setScalar(currentScale);
            coronaRef.current.scale.setScalar(currentScale * 1.85);
        }
    });

    return (
        <group position={star.position}>
            {/* 1. Outer Corona */}
            <mesh ref={coronaRef}>
                <sphereGeometry args={[starSize, 24, 24]} />
                <meshBasicMaterial
                    color={primaryColor}
                    transparent
                    opacity={hovered || isSelected ? 0.45 : 0.18}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* 2. Photosphere Body */}
            <mesh
                ref={bodyRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(star);
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = 'default';
                }}
            >
                <sphereGeometry args={[starSize, 32, 32]} />
                <meshStandardMaterial
                    color={primaryColor}
                    emissive={primaryColor}
                    emissiveIntensity={hovered || isSelected ? 3.0 : 1.8}
                    roughness={0.15}
                    metalness={0.8}
                    toneMapped={false}
                />
            </mesh>

            {/* 3. White-Hot Core */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[starSize, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={hovered || isSelected ? 0.95 : 0.8}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* ป้ายชื่อดาว (HTML ธรรมดา ไม่พึ่งฟอนต์ 3D ปลอดภัย 100%) */}
            <Html
                position={[0, starSize * 2.2 + 0.6, 0]}
                center
                distanceFactor={60}
                className="pointer-events-none select-none transition-opacity duration-300"
            >
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider whitespace-nowrap border backdrop-blur-md transition-all ${isSelected
                    ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)] scale-110 opacity-100'
                    : hovered
                        ? 'bg-slate-900/90 text-white border-slate-500 shadow-[0_0_8px_rgba(255,255,255,0.3)] opacity-100'
                        : 'bg-black/60 text-slate-400 border-white/5 opacity-50'
                    }`}>
                    {star.title || 'Untitled Node'}
                </div>
            </Html>
        </group>
    );
}

// 🌟 เส้นเชื่อมแบบไล่สี (Gradient Plexus Lines) แทนแบบเก่า
function ConstellationLines({ links, categories }) {
    const linesGeometry = useMemo(() => {
        const positions = [];
        const colors = [];

        links.forEach(link => {
            const srcCat = categories.find(c => link.source.categoryIds?.includes(c.id));
            const tgtCat = categories.find(c => link.target.categoryIds?.includes(c.id));
            const c1 = new THREE.Color(srcCat ? srcCat.color : '#38bdf8');
            const c2 = new THREE.Color(tgtCat ? tgtCat.color : '#38bdf8');

            positions.push(...link.source.position, ...link.target.position);
            colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        return geometry;
    }, [links, categories]);

    return (
        <lineSegments geometry={linesGeometry}>
            <lineBasicMaterial
                vertexColors
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </lineSegments>
    );
}

// 🌟 เพิ่มฝุ่นอวกาศพื้นหลัง ให้ภาพดูมีมิติเหมือนใน Obsidian
function CosmicDust() {
    const dustGeometry = useMemo(() => {
        const positions = new Float32Array(500 * 3);
        const colors = new Float32Array(500 * 3);
        const palette = ['#a855f7', '#00f2fe', '#10b981', '#ffffff'];

        for (let i = 0; i < 500; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

            const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geom;
    }, []);

    return (
        <points geometry={dustGeometry}>
            <pointsMaterial size={0.3} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </points>
    );
}

function GalaxyScene({ stars, categories, links, selectedStar, onSelectStar }) {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[100, 100, 100]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-100, -100, -100]} intensity={0.8} color="#38bdf8" />

            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                rotateSpeed={0.8}
                zoomSpeed={1.2}
                minDistance={10}
                maxDistance={400}
            />

            <CosmicDust />
            <ConstellationLines links={links} categories={categories} />

            {stars.map((star) => (
                <StarNode
                    key={star.id}
                    star={star}
                    categories={categories}
                    onSelect={onSelectStar}
                    isSelected={selectedStar?.id === star.id}
                />
            ))}
        </>
    );
}

export default function GalaxyCanvas({ stars, categories, links, selectedStar, onSelectStar }) {
    return (
        <div className="w-full h-full bg-[#000000]">
            <Canvas
                camera={{ position: [0, 20, GALAXY_SETTINGS.cameraDistance], fov: 60 }}
                gl={{ antialias: true, alpha: false }}
                onPointerMissed={() => onSelectStar(null)}
            >
                <color attach="background" args={['#000000']} />
                <GalaxyScene
                    stars={stars}
                    categories={categories}
                    links={links}
                    selectedStar={selectedStar}
                    onSelectStar={onSelectStar}
                />
            </Canvas>
        </div>
    );
}