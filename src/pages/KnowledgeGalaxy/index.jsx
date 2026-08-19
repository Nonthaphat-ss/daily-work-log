import React, { useState, useMemo } from 'react';
import { useGalaxyData } from './hooks/useGalaxyData';
import GalaxyCanvas from './components/GalaxyCanvas';
import ControlPanel from './components/ControlPanel';
import StarInfoPanel from './components/StarInfoPanel';
import TimelineSlider from './components/TimelineSlider';

export default function KnowledgeGalaxy() {
    const { stars, categories, links, addStar, updateStar, deleteStar } = useGalaxyData();
    const [selectedStar, setSelectedStar] = useState(null);

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
        <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
            <GalaxyCanvas
                stars={filteredStars}
                categories={categories}
                links={filteredLinks}
                selectedStar={selectedStar}
                onSelectStar={setSelectedStar}
            />

            <ControlPanel
                categories={categories}
                onAddStar={addStar}
            />

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
    );
}