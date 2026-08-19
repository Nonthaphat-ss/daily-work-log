import React from 'react';
import { Clock } from 'lucide-react';

export default function TimelineSlider({ minDate, maxDate, currentDate, onChange }) {
    if (minDate >= maxDate) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-lg bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 text-slate-200">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono shrink-0">
                <Clock size={15} />
                <span>TIMELINE</span>
            </div>

            <input
                type="range"
                min={minDate}
                max={maxDate}
                value={currentDate}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            <div className="font-mono text-xs text-slate-300 whitespace-nowrap">
                {new Date(currentDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </div>
        </div>
    );
}