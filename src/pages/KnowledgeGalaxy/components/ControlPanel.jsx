import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';

export default function ControlPanel({ categories, onAddStar }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCatIds, setSelectedCatIds] = useState([]);
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

    const handleCategoryToggle = (id) => {
        setSelectedCatIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onAddStar({
            title,
            content,
            categoryIds: selectedCatIds.length > 0 ? selectedCatIds : [categories[0].id],
            createdAt: new Date(customDate).toISOString()
        });

        setTitle('');
        setContent('');
        setSelectedCatIds([]);
        setCustomDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%-48px)]'
            }`}>
            <div className="relative h-full w-80 sm:w-96 bg-slate-900/90 backdrop-blur-xl border-r border-cyan-500/20 text-slate-200 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]">

                <div className="p-4 border-b border-cyan-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/5"
                            title="Back to workspace"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="font-mono text-sm font-semibold tracking-wider text-cyan-400 flex items-center gap-2">
                            <Sparkles size={16} />
                            GALAXY CONTROL
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/5"
                    >
                        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-cyan-300/70 uppercase mb-1">
                                Node Designation
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Master Deployment Pipeline"
                                className="w-full bg-slate-950/60 border border-slate-700/60 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-cyan-300/70 uppercase mb-1">
                                Categories
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map(cat => {
                                    const active = selectedCatIds.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategoryToggle(cat.id)}
                                            className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${active
                                                    ? 'bg-slate-800 text-white border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                                                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-600'
                                                }`}
                                        >
                                            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: cat.color }} />
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-cyan-300/70 uppercase mb-1">
                                Timestamp
                            </label>
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="w-full bg-slate-950/60 border border-slate-700/60 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-cyan-300/70 uppercase mb-1">
                                Knowledge Payload
                            </label>
                            <textarea
                                rows={6}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Detailed operational steps, architecture notes, reference commands..."
                                className="w-full bg-slate-950/60 border border-slate-700/60 focus:border-cyan-500 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 outline-none resize-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                        >
                            <Plus size={16} />
                            Deploy Star Node
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}