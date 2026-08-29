import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GALAXY_SETTINGS } from '../constants/galaxyConfig';

function createSoftGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.06)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

function StarNode({ star, categories, onSelect, isSelected, glowTexture }) {
    const bodyRef = useRef();
    const coreRef = useRef();
    const [hovered, setHovered] = useState(false);

    // ดึงรายการหมวดหมู่ทั้งหมดที่ดาวนี้สังกัด
    const matchedCategories = useMemo(() => {
        const found = categories.filter(c => star.categoryIds?.includes(c.id));
        return found.length > 0 ? found : [{ id: 'default', color: '#00f2fe' }];
    }, [categories, star.categoryIds]);

    const primaryColor = matchedCategories[0].color;

    const starSize = useMemo(() => {
        const length = star.content ? star.content.length : 0;
        const calculated = (GALAXY_SETTINGS.minNodeSize || 0.7) + (length / (GALAXY_SETTINGS.contentLengthDivisor || 500));
        return Math.min(calculated, GALAXY_SETTINGS.maxNodeSize || 2.2);
    }, [star.content]);

    const twinkleOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * 2 + twinkleOffset;
        const pulse = Math.sin(t) * 0.06;
        const intensityFactor = hovered || isSelected ? 1.35 : 1.0;

        if (coreRef.current && bodyRef.current) {
            const currentScale = intensityFactor + pulse;
            coreRef.current.scale.setScalar(currentScale * 0.5);
            bodyRef.current.scale.setScalar(currentScale);
        }
    });

    return (
        <group position={star.position}>
            {/* 1. Layered Corona: เรนเดอร์ออร่าซ้อนกันตามจำนวนหมวดหมู่ที่ดาวสังกัด */}
            {matchedCategories.map((cat, idx) => {
                const layerScale = starSize * (4.2 + idx * 1.3);
                const layerOpacity = (hovered || isSelected ? 0.8 : 0.5) / Math.sqrt(matchedCategories.length);

                return (
                    <sprite key={cat.id || idx} scale={[layerScale, layerScale, 1]}>
                        <spriteMaterial
                            map={glowTexture}
                            color={cat.color}
                            transparent
                            opacity={layerOpacity}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </sprite>
                );
            })}

            {/* Inner White Soft Glow (แกนสว่าง) */}
            <sprite scale={[starSize * 2.6, starSize * 2.6, 1]}>
                <spriteMaterial
                    map={glowTexture}
                    color="#ffffff"
                    transparent
                    opacity={hovered || isSelected ? 0.8 : 0.45}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </sprite>

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
                    emissiveIntensity={hovered || isSelected ? 3.5 : 2.0}
                    roughness={0.1}
                    metalness={0.2}
                    toneMapped={false}
                />
            </mesh>

            {/* 3. White-Hot Core */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[starSize, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.95}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* ป้ายชื่อดาว */}
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

// เส้นเชื่อมโยง Multi-category Links
function ConstellationLines({ links, categories }) {
    const linesGeometry = useMemo(() => {
        const positions = [];
        const colors = [];

        links.forEach(link => {
            const srcCats = categories.filter(c => link.source.categoryIds?.includes(c.id));
            const tgtCats = categories.filter(c => link.target.categoryIds?.includes(c.id));

            // ตรวจหาหมวดหมู่ที่แชร์ร่วมกัน
            const sharedCat = srcCats.find(sc => tgtCats.some(tc => tc.id === sc.id));

            let c1, c2;
            if (sharedCat) {
                // หากแชร์หมวดหมู่เดียวกัน เส้นจะใช้สีของหมวดหมู่นั้นทั้งเส้น
                c1 = new THREE.Color(sharedCat.color);
                c2 = new THREE.Color(sharedCat.color);
            } else {
                // หากต่างหมวดหมู่ จะไล่สีแบบ Gradient ระหว่างหมวดหมู่แรกของทั้งสองฝั่ง
                c1 = new THREE.Color(srcCats[0]?.color || '#00f2fe');
                c2 = new THREE.Color(tgtCats[0]?.color || '#00f2fe');
            }

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
                toneMapped={false}
            />
        </lineSegments>
    );
}

function CosmicDust() {
    const dustGeometry = useMemo(() => {
        const positions = new Float32Array(600 * 3);
        const colors = new Float32Array(600 * 3);
        const palette = ['#9333ea', '#3b82f6', '#00f2fe', '#10b981', '#ffffff'];

        for (let i = 0; i < 600; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 160;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 160;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

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
            <pointsMaterial size={0.35} vertexColors transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </points>
    );
}

function GalaxyScene({ stars, categories, links, selectedStar, onSelectStar }) {
    const glowTexture = useMemo(() => createSoftGlowTexture(), []);

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2.0} color="#ffffff" distance={100} />

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
                    glowTexture={glowTexture}
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
                camera={{ position: [0, 15, GALAXY_SETTINGS.cameraDistance], fov: 60 }}
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

                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={0.25}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                        intensity={1.5}
                        radius={0.7}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}