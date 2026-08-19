import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
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
        const calculated = GALAXY_SETTINGS.minNodeSize + (length / GALAXY_SETTINGS.contentLengthDivisor);
        return Math.min(calculated, GALAXY_SETTINGS.maxNodeSize);
    }, [star.content]);

    // สุ่มค่า offset เพื่อให้จังหวะการกะพริบของแต่ละดวงดาวไม่พร้อมกัน
    const twinkleOffset = useMemo(() => Math.random() * 100, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * 2 + twinkleOffset;
        const pulse = Math.sin(t) * 0.08;
        const intensityFactor = hovered || isSelected ? 1.4 : 1.0;

        if (coreRef.current && bodyRef.current && coronaRef.current) {
            const currentScale = intensityFactor + pulse;

            // แกนกลางสีขาว
            coreRef.current.scale.setScalar(currentScale * 0.45);

            // ตัวดาวสีหมวดหมู่
            bodyRef.current.scale.setScalar(currentScale);

            // ชั้นรัศมีแสงเรือง
            coronaRef.current.scale.setScalar(currentScale * 1.85);
        }
    });

    return (
        <group position={star.position}>
            {/* 1. ชั้นรัศมีเรืองแสงกว้าง (Outer Corona / Stellar Halo) */}
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

            {/* 2. เนื้อผิวดาวสีหมวดหมู่ (Photosphere Body) */}
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

            {/* 3. แกนกลางดวงดาวสว่างสีขาวจ้า (White-Hot Core) */}
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

            {/* ป้ายชื่อระบุดวงดาว */}
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

            {/* เส้นเชื่อมโยงแบบ Constellation Rays */}
            {links.map((link, idx) => {
                const category = categories.find(c => link.sharedCategories.includes(c.id));
                const lineColor = category ? category.color : '#38bdf8';

                return (
                    <group key={`link-group-${idx}`}>
                        <Line
                            points={[link.source.position, link.target.position]}
                            color={lineColor}
                            lineWidth={1.2}
                            transparent
                            opacity={0.5}
                        />
                        <Line
                            points={[link.source.position, link.target.position]}
                            color={lineColor}
                            lineWidth={3.0}
                            transparent
                            opacity={0.12}
                        />
                    </group>
                );
            })}

            {/* รายการดวงดาวทั้งหมด */}
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