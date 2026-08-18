import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Responsive } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, GripHorizontal, Trash2, Maximize2,
    Settings2, X, Archive, Palette, Bold, Heading1, Heading2,
    Tags, Eye, CheckCircle2, Type, Moon, Sun
} from 'lucide-react';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const COLORS = {
    notes: ['#ffffff', '#fff7d1', '#dcfce7', '#e0f2fe', '#fce7f3', '#ffedd5', '#f3f4f6'],
    tags: ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
};

export default function Notes() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(1200);
    const [isInteracting, setIsInteracting] = useState(false);

    //  State สำหรับเมนูลอย
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activePanel, setActivePanel] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    //  Dark Mode State (บังคับดึงค่าจาก localStorage ให้ชัวร์ๆ)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('bento_theme') === 'dark';
    });

    //  Dark Mode Effect (สั่งเปลี่ยนสีพื้นหลัง Body โดยตรง)
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.body.style.backgroundColor = '#121212'; // บังคับเปลี่ยนสีพื้นหลังเว็บเป็นมืด
            localStorage.setItem('bento_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#f8f9fa'; // บังคับเปลี่ยนสีพื้นหลังเว็บกลับเป็นสว่าง
            localStorage.setItem('bento_theme', 'light');
        }
    }, [isDarkMode]);

    const [tags, setTags] = useState(() => {
        const saved = localStorage.getItem('bento_tags');
        return saved ? JSON.parse(saved) : [{ id: 't1', name: 'ด่วนมาก', color: '#ef4444' }];
    });

    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('bento_notes_v3');
        return saved ? JSON.parse(saved) : [
            { id: 'n-1', title: 'ยินดีต้อนรับสู่ Notes ✨', content: 'ลากที่ขอบบนเพื่อย้าย, ขอบล่างขวาเพื่อยืด', color: '#ffffff', isArchived: false, activeTags: ['t1'] }
        ];
    });

    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('bento_layouts_v3');
        return saved ? JSON.parse(saved) : { lg: [{ i: 'n-1', x: 8, y: 0, w: 8, h: 8 }] };
    });

    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(COLORS.tags[0]);
    const [activeDropdown, setActiveDropdown] = useState({ noteId: null, type: null });

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        localStorage.setItem('bento_notes_v3', JSON.stringify(notes));
        localStorage.setItem('bento_layouts_v3', JSON.stringify(layouts));
        localStorage.setItem('bento_tags', JSON.stringify(tags));
    }, [notes, layouts, tags]);

    const handleAddNote = () => {
        const newId = `note-${Date.now()}`;
        setNotes([{ id: newId, title: '', content: '', color: '#ffffff', isArchived: false, activeTags: [] }, ...notes]);
        setLayouts(prev => ({ ...prev, lg: [{ i: newId, x: 8, y: 0, w: 8, h: 8 }, ...(prev.lg || [])] }));
        setIsMenuOpen(false);
    };

    const handleCreateTag = () => {
        if (!newTagName.trim()) return;
        const newTag = { id: `t-${Date.now()}`, name: newTagName, color: newTagColor };
        setTags([...tags, newTag]);
        setNewTagName('');
    };

    const handleDeleteTag = (tagId) => {
        setTags(tags.filter(t => t.id !== tagId));
        setNotes(notes.map(n => ({ ...n, activeTags: n.activeTags.filter(id => id !== tagId) })));
    };

    const toggleTagOnNote = (noteId, tagId) => {
        setNotes(notes.map(n => {
            if (n.id !== noteId) return n;
            const hasTag = n.activeTags.includes(tagId);
            return { ...n, activeTags: hasTag ? n.activeTags.filter(id => id !== tagId) : [...n.activeTags, tagId] };
        }));
    };

    const changeNoteColor = (noteId, color) => {
        setNotes(notes.map(n => n.id === noteId ? { ...n, color: color } : n));
        setActiveDropdown({ noteId: null, type: null });
    };

    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
        setActiveDropdown({ noteId: null, type: null });
    };

    return (
        <div
            className="min-h-screen overflow-x-hidden relative transition-colors duration-500 font-sans"
            style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#f1f5f9' }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
                .font-thai { font-family: 'Prompt', sans-serif; }
                
                *, *:focus, *:active, *:focus-visible { outline: none !important; box-shadow: none; -webkit-tap-highlight-color: transparent; }
                .react-grid-item { outline: none !important; }
                .react-grid-item.react-grid-placeholder { background: rgba(0,0,0,0.05) !important; border-radius: 20px; }
                
                .react-grid-item.cssTransforms { transition-property: transform, width, height; transition-duration: 300ms; transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
                
                .react-resizable-handle { opacity: 0; width: 40px !important; height: 40px !important; bottom: 0 !important; right: 0 !important; z-index: 50; cursor: se-resize; }
                .react-grid-item:hover .react-resizable-handle { opacity: 1; }
                
                .cancel-drag { cursor: text !important; user-select: text !important; -webkit-user-select: text !important; }
                
                .rich-editor h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #1a202c; }
                .rich-editor h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #2d3748; }
                .rich-editor b { font-weight: 700; color: #000; }
                
                .bg-dot-grid { background-image: radial-gradient(#cbd5e1 2px, transparent 2px); background-size: 24px 24px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className={`fixed inset-0 z-0 bg-dot-grid transition-opacity duration-500 pointer-events-none ${isInteracting ? 'opacity-100' : 'opacity-0'}`} />

            {/* =========================================================================
                🎛️ เมนูลอย (อยู่บนซ้าย เลื่อนปุ่มย่อยไปทางขวา)
            ========================================================================= */}
            <div className="absolute top-6 left-6 z-[100] font-sans flex items-center">

                {/* 🔘 ปุ่มเมนูหลัก (ก้อนใหญ่) */}
                <button
                    onClick={() => { setIsMenuOpen(!isMenuOpen); if (isMenuOpen) setActivePanel(null); }}
                    className={`w-14 h-14 bg-[#1d1d1f] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 relative z-50 cursor-pointer shrink-0 ${isMenuOpen ? 'rotate-90 bg-gray-800' : 'rotate-0'}`}
                >
                    {isMenuOpen ? <X size={24} /> : <Settings2 size={24} />}
                </button>

                {/* ➡️ เมนูย่อยที่จะสไลด์ออกไปทางขวา (เรียงเป็นแนวนอน) */}
                <div className={`flex flex-row items-center gap-3 pl-4 z-40 transition-all duration-300 ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                    <button onClick={() => navigate('/')} className={`w-12 h-12 bg-white text-gray-700 border border-gray-100 rounded-full shadow-md flex items-center justify-center transition-all duration-300 hover:bg-gray-100 hover:scale-110 cursor-pointer ${isMenuOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-10 opacity-0 scale-50'}`} style={{ transitionDelay: isMenuOpen ? '50ms' : '0ms' }} title="ย้อนกลับ">
                        <ArrowLeft size={18} />
                    </button>
                    <button onClick={handleAddNote} className={`w-12 h-12 bg-white text-[#0066cc] border border-gray-100 rounded-full shadow-md flex items-center justify-center transition-all duration-300 hover:bg-blue-50 hover:scale-110 cursor-pointer ${isMenuOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-16 opacity-0 scale-50'}`} style={{ transitionDelay: isMenuOpen ? '100ms' : '0ms' }} title="สร้างโน้ตใหม่">
                        <Plus size={20} />
                    </button>
                    <button onClick={() => setActivePanel(activePanel === 'tags' ? null : 'tags')} className={`w-12 h-12 bg-white text-amber-500 border border-gray-100 rounded-full shadow-md flex items-center justify-center transition-all duration-300 hover:bg-amber-50 hover:scale-110 cursor-pointer ${isMenuOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-24 opacity-0 scale-50'}`} style={{ transitionDelay: isMenuOpen ? '150ms' : '0ms' }} title="จัดการป้ายกำกับ (Tags)">
                        <Tags size={18} />
                    </button>
                    <button onClick={() => setShowArchived(!showArchived)} className={`w-12 h-12 ${showArchived ? 'bg-amber-100 text-amber-600' : 'bg-[#1d1d1f] text-white'} rounded-full shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer ${isMenuOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-32 opacity-0 scale-50'}`} style={{ transitionDelay: isMenuOpen ? '200ms' : '0ms' }} title="ดูโน้ตที่เก็บไว้">
                        <Archive size={18} />
                    </button>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-12 h-12 ${isDarkMode ? 'bg-yellow-500 text-white' : 'bg-[#1d1d1f] text-white'} rounded-full shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer ${isMenuOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-40 opacity-0 scale-50'}`}
                        style={{ transitionDelay: isMenuOpen ? '250ms' : '0ms' }}
                        title="สลับโหมดมืด/สว่าง"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>



                {/* 🏷️ Panel จัดการ Tags (หล่นลงมาด้านล่างเมนูหลัก) */}
                <div className={`absolute left-0 top-16 mt-3 w-[320px] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-left ${activePanel === 'tags' ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto z-50' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none -z-10'}`}>
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-bold text-[16px] text-[#1d1d1f] font-thai flex items-center gap-2"><Tags size={16} /> จัดการป้ายกำกับ</h3>
                        <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-red-500 cursor-pointer"><X size={18} /></button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                        <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="ชื่อป้ายกำกับใหม่..." className="w-full text-sm p-2 rounded-lg border border-gray-200 mb-2 font-thai focus:border-blue-400" />
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1.5">
                                {COLORS.tags.map(color => (
                                    <button key={color} onClick={() => setNewTagColor(color)} className={`w-5 h-5 rounded-full border-2 cursor-pointer ${newTagColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                                ))}
                            </div>
                            <button onClick={handleCreateTag} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 cursor-pointer">เพิ่ม</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {tags.map(tag => (
                            <div key={tag.id} className="flex justify-between items-center bg-white border border-gray-100 p-2.5 rounded-lg">
                                <div className="flex items-center gap-2 font-thai text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div> {tag.name}
                                </div>
                                <button onClick={() => handleDeleteTag(tag.id)} className="text-gray-300 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* =========================================================================
    📌 พื้นที่ทำงาน Grid
========================================================================= */}
            <div ref={containerRef} className="relative z-10 px-6 pt-28 pb-32 min-h-screen">
                <Responsive
                    width={containerWidth}
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
                    rowHeight={30}
                    onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
                    onDragStart={() => setIsInteracting(true)}
                    onDragStop={() => setIsInteracting(false)}
                    onResizeStart={() => setIsInteracting(true)}
                    onResizeStop={() => setIsInteracting(false)}
                    draggableHandle=".drag-handle"
                    draggableCancel=".cancel-drag"
                    margin={[16, 16]}
                >
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            style={{
                                backgroundColor: isDarkMode
                                    ? ((!note.color || note.color.toLowerCase() === '#ffffff') ? '#1e1e1e' : note.color)
                                    : (note.color || '#ffffff'),
                                display: (note.isArchived && !showArchived) ? 'none' : 'flex'
                            }}
                            className="group relative rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-black/5 dark:border-white/10 flex flex-col overflow-visible transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown({ noteId: null, type: null });
                            }}
                        >

                            {/* 🏷️ ริบบิ้น Tags */}
                            <div className="absolute -left-2 top-18 flex flex-col gap-1.5 z-20 pointer-events-none">
                                {note.activeTags?.map(tagId => {
                                    const tagInfo = tags.find(t => t.id === tagId);
                                    if (!tagInfo) return null;
                                    return (
                                        <div key={tagId} className="px-2 py-0.5 rounded-r-md text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: tagInfo.color }}>
                                            {tagInfo.name}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 🎯 จุดจับสำหรับลากย้าย */}
                            <div className="drag-handle h-7 w-full flex items-center justify-center cursor-grab active:cursor-grabbing text-black/20 hover:text-black/40 bg-black/5 dark:bg-white/5 dark:text-white/30 transition-colors shrink-0 rounded-t-[20px]">
                                <GripHorizontal size={18} />
                            </div>

                            {/* 📝 พื้นที่กระดาษ */}
                            <div
                                className="cancel-drag flex-1 overflow-hidden flex flex-col relative z-10 bg-transparent"
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="text"
                                    value={note.title || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNotes(prev => prev.map(n => n.id === note.id ? { ...n, title: val } : n));
                                    }}
                                    placeholder="หัวข้อ..."
                                    className="cancel-drag w-full bg-transparent px-6 py-3 font-thai text-xl font-bold text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none"
                                />
                                <hr className="border-black/5 dark:border-white/10 mx-5 shrink-0" />

                                <textarea
                                    value={note.content || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content: val } : n));
                                    }}
                                    placeholder="พิมพ์รายละเอียดที่นี่..."
                                    className="cancel-drag flex-1 w-full bg-transparent px-6 py-4 font-thai text-sm md:text-base text-gray-700 dark:text-gray-300 outline-none resize-none overflow-y-auto no-scrollbar cursor-text"
                                />
                            </div>

                            {/* ⚙️ แถบเครื่องมือด้านล่าง */}
                            <div className="relative px-4 py-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-[20px] flex items-center z-30" onClick={e => e.stopPropagation()}>
                                <div className="flex gap-1 relative">
                                    {/* ลบ */}
                                    <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer" title="ลบ"><Trash2 size={15} /></button>

                                    {/* ป้ายกำกับ */}
                                    <div className="relative">
                                        <button onClick={() => setActiveDropdown({ noteId: activeDropdown.noteId === note.id && activeDropdown.type === 'tag' ? null : note.id, type: 'tag' })} className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 text-amber-600 cursor-pointer" title="จัดการป้ายกำกับ"><Tags size={15} /></button>
                                        {activeDropdown.noteId === note.id && activeDropdown.type === 'tag' && (
                                            <div className="absolute bottom-full left-0 mb-2 w-[160px] bg-white dark:bg-[#2a2a2a] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 z-50">
                                                <p className="text-xs text-gray-400 font-thai mb-1 px-1">แปะป้ายกำกับ</p>
                                                {tags.length === 0 ? <p className="text-xs text-gray-400 px-1">ยังไม่มี Tag ให้เลือก</p> :
                                                    tags.map(tag => (
                                                        <button key={tag.id} onClick={() => toggleTagOnNote(note.id, tag.id)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 text-sm font-thai cursor-pointer">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                                            <span className="flex-1 text-left truncate dark:text-gray-200">{tag.name}</span>
                                                            {note.activeTags?.includes(tag.id) && <CheckCircle2 size={12} className="text-green-500" />}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* เปลี่ยนสี */}
                                    <div className="relative">
                                        <button onClick={() => setActiveDropdown({ noteId: activeDropdown.noteId === note.id && activeDropdown.type === 'color' ? null : note.id, type: 'color' })} className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 text-blue-500 cursor-pointer" title="เปลี่ยนสี"><Palette size={15} /></button>
                                        {activeDropdown.noteId === note.id && activeDropdown.type === 'color' && (
                                            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 flex gap-1.5 z-50">
                                                {COLORS.notes.map(color => (
                                                    <button key={color} onClick={() => changeNoteColor(note.id, color)} className="w-5 h-5 rounded-full border-2 border-transparent hover:scale-110 hover:border-gray-300 transition-all cursor-pointer shadow-inner" style={{ backgroundColor: color }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* เก็บ/ซ่อน */}
                                    <button onClick={() => setNotes(notes.map(n => n.id === note.id ? { ...n, isArchived: !n.isArchived } : n))} className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 cursor-pointer" title="เก็บ/ซ่อน"><Archive size={15} /></button>
                                </div>
                            </div>

                            {/* 📐 ปุ่มขยายขนาด */}
                            <div className="absolute bottom-2 right-2 text-black/30 dark:text-white/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                <Maximize2 size={12} className="rotate-90" />
                            </div>
                        </div>
                    ))}
                </Responsive>
            </div>
        </div>
    );
}