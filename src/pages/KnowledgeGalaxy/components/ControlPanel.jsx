import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, X, Plus, Edit2, Trash2, Check } from 'lucide-react';

const NEBULA_COLOR_PRESETS = [
    '#00f2fe', '#38bdf8', '#3b82f6', '#6366f1',
    '#9333ea', '#a855f7', '#c084fc', '#e879f9',
    '#f43f5e', '#fb7185', '#f97316', '#fbbf24',
    '#06b6d4', '#2dd4bf', '#10b981', '#4ade80'
];

export default function ControlPanel({
    categories,
    onAddStar,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    isOpen,
    onToggle
}) {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCatIds, setSelectedCatIds] = useState([]);
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState(NEBULA_COLOR_PRESETS[0]);

    const [contextMenu, setContextMenu] = useState(null);
    const [editingCatId, setEditingCatId] = useState(null);
    const [editCatName, setEditCatName] = useState('');
    const [editCatColor, setEditCatColor] = useState('#00f2fe');

    useEffect(() => {
        const handleGlobalClick = () => setContextMenu(null);
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    const handleCategoryToggle = (id) => {
        setSelectedCatIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleCreateCategorySubmit = (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        const created = onAddCategory(newCatName, newCatColor);
        setSelectedCatIds(prev => [...prev, created.id]);
        setNewCatName('');
        setIsCreatingCategory(false);
    };

    const handleContextMenuOpen = (e, cat) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            category: cat
        });
    };

    const handleStartInlineEdit = (cat) => {
        setEditingCatId(cat.id);
        setEditCatName(cat.name);
        setEditCatColor(cat.color);
        setContextMenu(null);
    };

    const handleSaveInlineEdit = (catId) => {
        if (editCatName.trim()) {
            onUpdateCategory(catId, {
                name: editCatName.trim(),
                color: editCatColor
            });
        }
        setEditingCatId(null);
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
        onToggle(false);
    };

    return (
        <>
            <div className="fixed top-0 left-0 h-full w-16 z-50 bg-black/80 backdrop-blur-md border-r border-white/10 flex flex-col justify-between items-center py-6 select-none">
                <button
                    onClick={() => onToggle(!isOpen)}
                    className="p-3 text-white/80 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/15 cursor-pointer active:scale-95"
                    title={isOpen ? "Close Control Panel" : "Open Control Panel"}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex items-center justify-center py-10">
                    <span className="font-mono text-[9px] tracking-[0.35em] text-white/40 uppercase rotate-180 [writing-mode:vertical-lr] whitespace-nowrap pointer-events-none">
                        ASTRONOMICAL KNOWLEDGE ARCHIVE
                    </span>
                </div>

                <div className="w-2 h-2 rounded-full bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>

            <div className={`fixed top-0 left-16 h-full w-96 z-40 bg-black/90 backdrop-blur-2xl border-r border-white/10 transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all cursor-pointer active:scale-95"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div className="font-mono text-[10px] tracking-widest text-amber-400 uppercase">
                                CONTROL MATRIX
                            </div>
                            <h3 className="font-serif text-lg tracking-wide text-white uppercase">
                                Star Deployment
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5 font-thai">
                        <div>
                            <label className="block font-mono text-[10px] tracking-widest text-amber-400 uppercase mb-2">
                                NODE DESIGNATION (NAME)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. CORE INFRASTRUCTURE PIPELINE"
                                className="w-full bg-black/60 border border-white/15 focus:border-amber-400 px-3.5 py-2.5 text-sm text-white placeholder-white/25 outline-none font-sans transition-colors"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block font-mono text-[10px] tracking-widest text-amber-400 uppercase">
                                    CLUSTER CLASSIFICATION
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                    className="font-mono text-[10px] tracking-wider text-white/60 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus size={12} />
                                    {isCreatingCategory ? 'CANCEL' : 'ADD CLUSTER'}
                                </button>
                            </div>

                            {isCreatingCategory && (
                                <div className="mb-3 p-3 bg-white/5 border border-white/15 rounded-sm space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={newCatColor}
                                            onChange={(e) => setNewCatColor(e.target.value)}
                                            className="w-7 h-7 bg-transparent border border-white/20 rounded cursor-pointer p-0"
                                        />
                                        <input
                                            type="text"
                                            value={newCatName}
                                            onChange={(e) => setNewCatName(e.target.value)}
                                            placeholder="Cluster designation..."
                                            className="flex-1 bg-black/60 border border-white/15 focus:border-amber-400 px-2.5 py-1 text-xs text-white placeholder-white/30 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategorySubmit}
                                            className="p-1.5 bg-amber-400 text-black hover:bg-amber-300 transition-colors cursor-pointer"
                                        >
                                            <Check size={14} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/10">
                                        <span className="font-mono text-[9px] text-white/40 mr-1">PRESETS:</span>
                                        {NEBULA_COLOR_PRESETS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewCatColor(color)}
                                                className={`w-4 h-4 rounded-full transition-transform hover:scale-125 cursor-pointer ${newCatColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110' : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => {
                                    const active = selectedCatIds.includes(cat.id);
                                    const isEditing = editingCatId === cat.id;

                                    if (isEditing) {
                                        return (
                                            <div key={cat.id} className="flex items-center gap-1 bg-black/80 border border-amber-400 p-1">
                                                <input
                                                    type="color"
                                                    value={editCatColor}
                                                    onChange={(e) => setEditCatColor(e.target.value)}
                                                    className="w-5 h-5 bg-transparent border-none cursor-pointer p-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={editCatName}
                                                    onChange={(e) => setEditCatName(e.target.value)}
                                                    className="w-24 bg-transparent border-b border-white/30 text-xs text-white px-1 outline-none font-mono"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveInlineEdit(cat.id)}
                                                    className="p-0.5 text-amber-400 hover:text-white cursor-pointer"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCatId(null)}
                                                    className="p-0.5 text-white/40 hover:text-white cursor-pointer"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategoryToggle(cat.id)}
                                            onContextMenu={(e) => handleContextMenuOpen(e, cat)}
                                            className={`text-[11px] px-3 py-1.5 border font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 select-none ${active
                                                    ? 'bg-white/10 text-white border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                                                    : 'bg-black/40 text-white/40 border-white/10 hover:border-white/30 hover:text-white/80'
                                                }`}
                                        >
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                            <span>{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block font-mono text-[10px] tracking-widest text-amber-400 uppercase mb-2">
                                OBSERVATION DATE
                            </label>
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="w-full bg-black/60 border border-white/15 focus:border-amber-400 px-3.5 py-2.5 text-xs font-mono text-white/80 outline-none transition-colors cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-[10px] tracking-widest text-amber-400 uppercase mb-2">
                                KNOWLEDGE PAYLOAD
                            </label>
                            <textarea
                                rows={6}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter operational procedures, specifications, or core documentation..."
                                className="w-full bg-black/60 border border-white/15 focus:border-amber-400 p-3.5 text-sm text-white/90 placeholder-white/25 outline-none resize-none leading-relaxed transition-colors font-thai"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-white text-black hover:bg-amber-400 font-mono text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-lg"
                        >
                            <Plus size={16} />
                            Deploy Star Node
                        </button>
                    </form>
                </div>
            </div>

            {contextMenu && (
                <div
                    className="fixed z-[100] w-44 bg-black/95 backdrop-blur-xl border border-white/15 shadow-2xl text-white font-mono text-xs select-none animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 text-[10px] text-amber-400 border-b border-white/10 uppercase tracking-widest truncate">
                        {contextMenu.category.name}
                    </div>
                    <button
                        type="button"
                        onClick={() => handleStartInlineEdit(contextMenu.category)}
                        className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer border-b border-white/5"
                    >
                        <Edit2 size={13} className="text-white/60" />
                        <span>Rename / Edit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onDeleteCategory(contextMenu.category.id);
                            setContextMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                        <Trash2 size={13} className="text-red-400/80" />
                        <span>Delete Cluster</span>
                    </button>
                </div>
            )}
        </>
    );
}