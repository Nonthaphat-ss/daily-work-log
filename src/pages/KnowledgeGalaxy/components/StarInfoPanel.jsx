import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit3, Check, Calendar, Hash } from 'lucide-react';

export default function StarInfoPanel({ star, categories, onClose, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCatIds, setSelectedCatIds] = useState([]);

    useEffect(() => {
        if (star) {
            setTitle(star.title || '');
            setContent(star.content || '');
            setSelectedCatIds(star.categoryIds || []);
            setIsEditing(false);
        }
    }, [star]);

    if (!star) return null;

    const handleSave = () => {
        onUpdate(star.id, {
            title,
            content,
            categoryIds: selectedCatIds
        });
        setIsEditing(false);
    };

    const handleCatToggle = (catId) => {
        setSelectedCatIds(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    return (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] z-50 bg-slate-900/90 backdrop-blur-2xl border-l border-cyan-500/20 text-slate-200 flex flex-col shadow-[-15px_0_35px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-300">

            <div className="p-4 border-b border-cyan-500/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs text-cyan-400 tracking-wider">NODE TELEMETRY</span>
                </div>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="p-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
                            title="Save changes"
                        >
                            <Check size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/5"
                            title="Edit content"
                        >
                            <Edit3 size={16} />
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(star.id)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors border border-red-500/20"
                        title="Delete node"
                    >
                        <Trash2 size={16} />
                    </button>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/5"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                        <Calendar size={13} />
                        {new Date(star.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>

                    {isEditing ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2.5 font-sans text-xl font-bold text-white outline-none focus:border-cyan-500"
                        />
                    ) : (
                        <h2 className="font-sans text-2xl font-bold text-white tracking-tight leading-snug">
                            {star.title}
                        </h2>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400/80 mb-2.5">
                        <Hash size={13} />
                        ASSIGNED CLUSTERS
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(cat => {
                            const isAssigned = isEditing
                                ? selectedCatIds.includes(cat.id)
                                : star.categoryIds?.includes(cat.id);

                            if (!isEditing && !isAssigned) return null;

                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    disabled={!isEditing}
                                    onClick={() => handleCatToggle(cat.id)}
                                    className={`text-xs px-2.5 py-1 rounded-md font-mono border transition-all ${isAssigned
                                            ? 'bg-slate-800 text-white border-cyan-400/80 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
                                            : 'bg-slate-950/40 text-slate-500 border-slate-800'
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
                    <div className="text-xs font-mono text-slate-400 mb-2 uppercase">
                        Knowledge Specification
                    </div>

                    {isEditing ? (
                        <textarea
                            rows={12}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 leading-relaxed outline-none focus:border-cyan-500 resize-none font-sans"
                        />
                    ) : (
                        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                            {star.content || 'No details recorded for this node.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}