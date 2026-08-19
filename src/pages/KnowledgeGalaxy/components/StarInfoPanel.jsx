import React, { useState, useEffect } from 'react';
import { Edit3, Check, Trash2, X, Compass } from 'lucide-react';

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

    const primaryCategory = categories.find(c => star.categoryIds?.includes(c.id));

    return (
        <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/15 text-white flex flex-col md:flex-row transition-all duration-300">

            {/* ฝั่งซ้าย: ข้อมูลพิกัดและดาราศาสตร์ (Astronomical Coordinates) */}
            <div className="p-6 md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Compass size={18} className="text-amber-400" />
                        <span className="font-mono text-[10px] tracking-widest text-amber-400 uppercase">
                            POSITION DATA
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono">
                        <div>
                            <div className="text-[9px] text-white/40 tracking-wider">COORD (RA)</div>
                            <div className="text-sm text-white/90">
                                {star.position ? `${star.position[0].toFixed(2)}°` : '00.00°'}
                            </div>
                        </div>
                        <div>
                            <div className="text-[9px] text-white/40 tracking-wider">COORD (DEC)</div>
                            <div className="text-sm text-amber-400">
                                {star.position ? `${star.position[1].toFixed(2)}°` : '00.00°'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 font-mono text-[10px] text-white/40">
                    EPOCH: {new Date(star.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* ส่วนกลาง: สรุปค่าประเภทและคลัสเตอร์ (Telemetry Metrics) */}
            <div className="p-6 md:w-72 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center shrink-0">
                <div className="grid grid-cols-2 gap-y-4 font-mono text-xs">
                    <div>
                        <div className="text-[9px] text-amber-400 tracking-widest uppercase mb-1">TYPE</div>
                        <div className="text-white uppercase font-sans font-medium">Stellar Node</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-amber-400 tracking-widest uppercase mb-1">PAYLOAD MASS</div>
                        <div className="text-white">{star.content ? star.content.length : 0} BYTES</div>
                    </div>
                    <div className="col-span-2">
                        <div className="text-[9px] text-amber-400 tracking-widest uppercase mb-1">CONSTELLATION / CLUSTER</div>
                        <div className="flex items-center gap-1.5 text-white">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryCategory?.color || '#ffffff' }} />
                            <span>{primaryCategory?.name || 'Unassigned'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ฝั่งขวา: รายละเอียดเนื้อหาและปุ่มจัดการ (Content & Actions) */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/60 border border-white/20 p-2 font-serif text-xl text-white outline-none focus:border-amber-400"
                            />
                        ) : (
                            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide uppercase">
                                {star.title}
                            </h2>
                        )}

                        <div className="flex items-center gap-2 shrink-0">
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="p-1.5 bg-amber-400 text-black hover:bg-amber-300 transition-colors"
                                    title="Save Changes"
                                >
                                    <Check size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
                                    title="Edit Node"
                                >
                                    <Edit3 size={16} />
                                </button>
                            )}

                            <button
                                onClick={() => onDelete(star.id)}
                                className="p-1.5 text-red-400/80 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors"
                                title="Delete Node"
                            >
                                <Trash2 size={16} />
                            </button>

                            <button
                                onClick={onClose}
                                className="p-1.5 text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
                                title="Close Panel"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {isEditing ? (
                        <textarea
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-black/60 border border-white/20 p-2 text-sm text-white/90 outline-none focus:border-amber-400 resize-none font-thai leading-relaxed"
                        />
                    ) : (
                        <div className="border-l-2 border-amber-400 pl-4 py-1 text-sm text-white/80 font-thai leading-relaxed max-h-24 overflow-y-auto">
                            {star.content || 'No knowledge payload specified for this node.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}