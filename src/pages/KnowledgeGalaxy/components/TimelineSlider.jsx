import React from 'react';
import { Calendar } from 'lucide-react';

export default function TimelineSlider({ minDate, maxDate, currentDate, onChange }) {
    if (minDate >= maxDate) return null;

    return (
        <div className="bg-black/90 backdrop-blur-md border-t border-white/10 px-6 py-3 flex items-center justify-between gap-6 text-white select-none">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-amber-400 uppercase shrink-0">
                <Calendar size={14} />
                <span>CHRONOLOGICAL FILTER</span>
            </div>

            <div className="flex-1 max-w-xl">
                <input
                    type="range"
                    min={minDate}
                    max={maxDate}
                    value={currentDate}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-none appearance-none cursor-pointer accent-amber-400"
                />
            </div>

            <div className="font-mono text-xs text-white/80 shrink-0">
                {new Date(currentDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase()}
            </div>
        </div>
    );
}