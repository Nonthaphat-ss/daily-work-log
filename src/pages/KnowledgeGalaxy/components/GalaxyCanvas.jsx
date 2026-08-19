import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { GALAXY_SETTINGS } from '../constants/galaxyConfig';

function StarNode({ star, categories, onSelect, isSelected }) {
    const meshRef = useRef();
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

    useFrame(() => {
        if (meshRef.current) {
            const targetScale = hovered || isSelected ? 1.4 : 1.0;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    return (
        <group position={star.position}>
            <mesh
                ref={meshRef}
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
                <sphereGeometry args={[starSize, 24, 24]} />
                <meshStandardMaterial
                    color={primaryColor}
                    emissive={primaryColor}
                    emissiveIntensity={hovered || isSelected ? 1.2 : 0.6}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            <Html
                position={[0, starSize + 0.8, 0]}
                center
                distanceFactor={50}
                className="pointer-events-none select-none transition-opacity duration-300"
            >
                <div className={`px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap border backdrop-blur-md ${isSelected
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 opacity-100'
                        : hovered
                            ? 'bg-slate-900/80 text-white border-slate-600 opacity-100'
                            : 'bg-black/40 text-slate-400 border-white/5 opacity-60'
                    }`}>
                    {star.title || 'Untitled Node'}
                </div>
            </Html>
        </group>
    );
}

function GalaxyScene({ stars, categories, links, selectedStar, onSelectStar }) {
    const { camera } = useThree();

    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[100, 100, 100]} intensity={1.5} />
            <pointLight position={[-100, -100, -100]} intensity={0.5} color="#38bdf8" />

            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                rotateSpeed={0.8}
                zoomSpeed={1.2}
                minDistance={10}
                maxDistance={350}
            />

            {links.map((link, idx) => {
                const lineColor = categories.find(c => link.sharedCategories.includes(c.id))?.color || '#38bdf8';
                return (
                    <Line
                        key={`link-${idx}`}
                        points={[link.source.position, link.target.position]}
                        color={lineColor}
                        lineWidth={0.6}
                        transparent
                        opacity={0.2}
                    />
                );
            })}

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
        <div className="w-full h-full bg-slate-950">
            <Canvas
                camera={{ position: [0, 20, GALAXY_SETTINGS.cameraDistance], fov: 60 }}
                gl={{ antialias: true }}
                onPointerMissed={() => onSelectStar(null)}
            >
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