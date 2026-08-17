import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🚀 ใช้แบบมาตรฐานที่ถูกต้อง
import { Responsive, WidthProvider } from 'react-grid-layout';

import { ArrowLeft, Plus, GripHorizontal, Trash2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

// นำเข้า CSS
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// ประกอบร่างตารางล่องหน
const ResponsiveGridLayout = WidthProvider(Responsive);


export default function Notes() {
    const navigate = useNavigate();

    // 💡 State เช็คว่า "กำลังลากหรือยืดโน้ตอยู่ไหม?"
    const [isInteracting, setIsInteracting] = useState(false);

    // 🗂️ ข้อมูลโน้ต และ ตำแหน่งตาราง (Layout)
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('bento_notes');
        return saved ? JSON.parse(saved) : [
            { id: 'note-1', content: 'ยินดีต้อนรับสู่พื้นที่อิสระ ✨\n\nลองเอาเมาส์จับที่ขีด 3 ขีดด้านบนแล้วลากดูสิ!\nหรือดึงที่มุมขวาล่างเพื่อยืดขยายขนาดโน้ตได้เลย' }
        ];
    });

    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('bento_layouts');
        return saved ? JSON.parse(saved) : {
            lg: [
                { i: 'note-1', x: 4, y: 0, w: 4, h: 3 } // x,y คือพิกัดช่อง | w,h คือความกว้าง/สูงกี่ช่อง
            ]
        };
    });

    // บันทึกข้อมูลเมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        localStorage.setItem('bento_notes', JSON.stringify(notes));
        localStorage.setItem('bento_layouts', JSON.stringify(layouts));
    }, [notes, layouts]);

    // ฟังก์ชันเพิ่มโน้ตใหม่
    const handleAddNote = () => {
        const newId = `note-${Date.now()}`;

        // เพิ่มโน้ตใหม่
        setNotes([{ id: newId, content: '' }, ...notes]);

        // จัดให้โน้ตใหม่ไปโผล่ที่ช่องบนซ้ายสุด (x:0, y:0) ขนาด 3x2 ช่อง
        setLayouts((prev) => ({
            ...prev,
            lg: [{ i: newId, x: 0, y: 0, w: 3, h: 2 }, ...(prev.lg || [])]
        }));
    };

    const handleDelete = (id) => {
        setNotes(notes.filter(n => n.id !== id));
        setLayouts((prev) => ({
            ...prev,
            lg: prev.lg.filter(l => l.i !== id)
        }));
    };

    const handleContentChange = (id, newContent) => {
        setNotes(notes.map(n => n.id === id ? { ...n, content: newContent } : n));
    };

    return (
        <div className="min-h-screen overflow-x-hidden relative bg-[#f8f9fa] font-sans selection:bg-black selection:text-white">

            {/* ✨ นำเข้าฟอนต์ */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
                .font-thai { font-family: 'Prompt', sans-serif; }
                
                /* 🧲 ปรับแต่งแอนิเมชันตอนเด้งเข้าล็อกตาราง (Bouncy Snap) */
                .react-grid-item.cssTransforms {
                    transition-property: transform, width, height;
                    transition-duration: 400ms;
                    transition-timing-function: cubic-bezier(0.25, 1.2, 0.5, 1); /* ค่านี้ทำให้มีความเด้งดึ๋ง */
                }
                
                /* ตกแต่งปุ่มลากและยืด */
                .react-resizable-handle { opacity: 0; transition: opacity 0.2s; }
                .react-grid-item:hover .react-resizable-handle { opacity: 1; }
                
                /* พื้นหลังลายจุดตาราง */
                .bg-dot-grid {
                    background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
                    background-size: 32px 32px; /* ขนาดของจุดตาราง */
                }
            `}</style>

            {/* 📍 พื้นหลังล่องหน: จะโชว์ลายจุดขึ้นมาก็ต่อเมื่อ isInteracting = true เท่านั้น! */}
            <div
                className={`fixed inset-0 z-0 bg-dot-grid transition-opacity duration-500 ease-in-out pointer-events-none
                ${isInteracting ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* 🌟 Header Bar */}
            <div className="relative z-10 px-8 py-6 flex justify-between items-center pointer-events-none">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm hover:bg-white transition-all text-sm font-semibold text-[#1d1d1f] pointer-events-auto"
                >
                    <ArrowLeft size={16} /> กลับ
                </button>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: isInteracting ? 1 : 0, y: isInteracting ? 0 : -10 }}
                    className="bg-black/80 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-lg backdrop-blur-md"
                >
                    Grid Snap Active
                </motion.div>

                <div className="w-[85px]"></div>
            </div>

            {/* 📌 พื้นที่ Grid แบบล่องหน (Bento Box Workspace) */}
            <div className="relative z-10 px-8 pb-24 min-h-[80vh]">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={100}
                    onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
                    onDragStart={() => setIsInteracting(true)}
                    onDragStop={() => setIsInteracting(false)}
                    onResizeStart={() => setIsInteracting(true)}
                    onResizeStop={() => setIsInteracting(false)}
                    draggableHandle=".drag-handle"
                    margin={[24, 24]}
                >
                    {notes.map((note) => (
                        <div key={note.id} className="group relative bg-white/80 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">

                            {/* 🎯 ส่วนหัวสำหรับจับลาก (Drag Handle) */}
                            <div className="drag-handle h-8 w-full flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 transition-colors bg-gradient-to-b from-white/50 to-transparent">
                                <GripHorizontal size={20} />
                            </div>

                            {/* 📝 พื้นที่พิมพ์ข้อความ */}
                            <textarea
                                value={note.content}
                                onChange={(e) => handleContentChange(note.id, e.target.value)}
                                placeholder="พิมพ์ไอเดียของคุณที่นี่..."
                                className="flex-1 w-full bg-transparent p-6 pt-2 font-thai text-gray-700 text-sm md:text-base resize-none focus:outline-none placeholder-gray-300 leading-relaxed"
                            />

                            {/* 🗑️ ปุ่มลบ (แก้จาก handleDelete เป็น onClick) */}
                            <button
                                onClick={() => handleDelete(note.id)}
                                className="absolute bottom-4 left-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* 📐 ไอคอนขยายมุมขวาล่าง */}
                            <div className="absolute bottom-3 right-3 text-gray-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 size={14} className="rotate-90" />
                            </div>
                        </div>
                    ))}
                </ResponsiveGridLayout>
            </div>

            {/* ➕ ปุ่มลอย (FAB) สำหรับเพิ่มโน้ตใหม่ */}
            <button
                onClick={handleAddNote}
                className="fixed bottom-10 right-10 bg-[#1d1d1f] text-white w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center justify-center hover:scale-110 hover:bg-black transition-all z-40 group pointer-events-auto"
            >
                <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

        </div>
    );
}