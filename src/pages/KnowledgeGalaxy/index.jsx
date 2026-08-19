import React, { useState, useMemo } from 'react';
import { useGalaxyData } from './hooks/useGalaxyData';
import GalaxyCanvas from './components/GalaxyCanvas';
import ControlPanel from './components/ControlPanel';
import StarInfoPanel from './components/StarInfoPanel';
import TimelineSlider from './components/TimelineSlider';

export default function KnowledgeGalaxy() {
    const {
        stars,
        categories,
        links,
        addStar,
        updateStar,
        deleteStar,
        addCategory,
        updateCategory,
        deleteCategory
    } = useGalaxyData();

    const [selectedStar, setSelectedStar] = useState(null);
    const [isControlOpen, setIsControlOpen] = useState(false);

    const { minTimestamp, maxTimestamp } = useMemo(() => {
        if (stars.length === 0) return { minTimestamp: Date.now(), maxTimestamp: Date.now() };
        const timestamps = stars.map(s => new Date(s.createdAt).getTime());
        return {
            minTimestamp: Math.min(...timestamps),
            maxTimestamp: Math.max(...timestamps)
        };
    }, [stars]);

    const [currentFilterDate, setCurrentFilterDate] = useState(() => Date.now());

    const filteredStars = useMemo(() => {
        return stars.filter(s => new Date(s.createdAt).getTime() <= currentFilterDate);
    }, [stars, currentFilterDate]);

    const filteredLinks = useMemo(() => {
        const activeIds = new Set(filteredStars.map(s => s.id));
        return links.filter(l => activeIds.has(l.source.id) && activeIds.has(l.target.id));
    }, [links, filteredStars]);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans text-white">

            {/* สไตล์ฟอนต์ Editorial & Monospace */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=JetBrains+Mono:wght@300;400;500&family=Prompt:wght@300;400;500;600&display=swap');
                .font-serif { font-family: 'Cinzel', serif; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .font-thai { font-family: 'Prompt', sans-serif; }
            `}</style>

            {/* 3D Canvas Space Viewport */}
            <div
                className="absolute inset-0 transition-all duration-500 ease-in-out pl-16"
                style={{
                    transform: isControlOpen ? 'translateX(384px)' : 'translateX(0px)',
                    width: '100vw'
                }}
            >
                <GalaxyCanvas
                    stars={filteredStars}
                    categories={categories}
                    links={filteredLinks}
                    selectedStar={selectedStar}
                    onSelectStar={setSelectedStar}
                />
            </div>

            {/* แถบควบคุมฝั่งซ้าย */}
            <ControlPanel
                categories={categories}
                onAddStar={addStar}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
                isOpen={isControlOpen}
                onToggle={setIsControlOpen}
            />

            {/* ส่วนหัวด้านบนจอ */}
            <div className="absolute top-6 left-24 z-20 pointer-events-none">
                <div className="font-mono text-[10px] tracking-[0.3em] text-amber-400 uppercase">
                    OBSERVATORY NODE SYSTEM
                </div>
                <h1 className="font-serif text-2xl tracking-widest text-white uppercase">
                    Knowledge Galaxy
                </h1>
            </div>

            {/* แผงข้อมูลและไทม์ไลน์ด้านล่างจอ */}
            <div className="absolute bottom-0 left-16 right-0 z-30 flex flex-col">
                <StarInfoPanel
                    star={selectedStar}
                    categories={categories}
                    onClose={() => setSelectedStar(null)}
                    onUpdate={updateStar}
                    onDelete={(id) => {
                        deleteStar(id);
                        setSelectedStar(null);
                    }}
                />

                <TimelineSlider
                    minDate={minTimestamp}
                    maxDate={maxTimestamp}
                    currentDate={currentFilterDate}
                    onChange={setCurrentFilterDate}
                />
            </div>
        </div>
    );
}