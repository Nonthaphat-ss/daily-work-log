import { useState } from 'react';
import { Settings2, Edit3, Target, X, PlusCircle, CheckCircle2, ListTodo, Trash2, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingMenu({
    isMenuOpen, setIsMenuOpen, activePanel, setActivePanel,
    activeField, fieldLabels, docData, handleInputChange,
    editingTaskId, setEditingTaskId, tasks, setTasks,
    isAddingTarget, setIsAddingTarget, newTargetName, setNewTargetName,
    newTargetCount, setNewTargetCount, handleAddTarget, targets,
    getTargetProgress, handleUseTarget, handleDeleteTarget,
    handleExportWord
}) {

    const togglePanel = (panelName) => {
        setActivePanel(activePanel === panelName ? null : panelName);
    };

    const navigate = useNavigate();

    return (
        <div className="absolute top-4 left-4 md:top-0 md:left-0 z-[100] font-sans">

            <button
                onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    if (isMenuOpen) setActivePanel(null);
                }}
                className={`w-14 h-14 bg-[#1d1d1f] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 relative z-50 ${isMenuOpen ? 'rotate-90 bg-gray-800' : 'rotate-0'}`}
            >
                {isMenuOpen ? <X size={24} /> : <Settings2 size={24} />}
            </button>

            <div className={`absolute top-0 left-0 flex flex-col gap-4 pt-16 z-40 ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>

                <button
                    onClick={() => navigate('/')}
                    className={`w-12 h-12 bg-white text-gray-700 border border-gray-100 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-gray-100 hover:scale-110 active:scale-95 ${isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-50'}`}
                    style={{ transitionDelay: isMenuOpen ? '50ms' : '0ms' }}
                    title="ย้อนกลับ"
                >
                    <ArrowLeft size={18} />
                </button>

                <button
                    onClick={() => togglePanel('edit')}
                    className={`w-12 h-12 bg-white text-[#0066cc] border border-gray-100 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-gray-100 hover:scale-110 active:scale-95 ${isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-50'}`}
                    style={{ transitionDelay: isMenuOpen ? '50ms' : '0ms' }} title="ข้อมูลเอกสาร"
                >
                    <Edit3 size={20} />
                </button>

                <button
                    onClick={() => togglePanel('tracker')}
                    className={`w-12 h-12 bg-white text-[#0066cc] border border-gray-100 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-gray-100 hover:scale-110 active:scale-95 ${isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-20 opacity-0 scale-50'}`}
                    style={{ transitionDelay: isMenuOpen ? '100ms' : '0ms' }} title="เป้าหมายงาน"
                >
                    <Target size={20} />
                </button>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExportWord();
                        setIsMenuOpen(false);
                    }}
                    className={`w-12 h-12 bg-[#1d1d1f] text-white border border-gray-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-black hover:scale-110 active:scale-95 ${isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-30 opacity-0 scale-50'}`}
                    style={{ transitionDelay: isMenuOpen ? '150ms' : '0ms' }} title="Export to Word"
                >
                    <Download size={18} />
                </button>

            </div>

            <div className={`absolute left-20 top-0 w-[350px] max-h-[85vh] overflow-y-auto custom-scrollbar bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-left ${activePanel ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto z-50' : 'opacity-0 -translate-x-10 scale-95 pointer-events-none -z-10'}`}>

                {activePanel && (
                    <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                        <h3 className="font-bold text-[18px] text-[#1d1d1f]">{activePanel === 'edit' ? 'แก้ไขข้อมูลเอกสาร' : 'เป้าหมายงาน'}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={18} /></button>
                    </div>
                )}

                {/* 🔴 Panel: ข้อมูลเอกสาร (ใส่ Stagger) */}
                {activePanel === 'edit' && (
                    <div className="flex flex-col gap-4">
                        <p className="text-[#7a7a7a] text-[13px] leading-relaxed stagger-item" style={{ animationDelay: '50ms' }}>คลิกที่ข้อความสีฟ้าบนกระดาษฝั่งขวา เพื่อนำข้อมูลมาแก้ไขที่นี่</p>
                        {editingTaskId ? (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-[#0066cc]/30 stagger-item" style={{ animationDelay: '100ms' }}>
                                <div className="flex items-center gap-2 mb-3 text-[#0066cc]"><Edit3 size={16} /><span className="font-semibold text-sm">แก้ไขรายละเอียดงาน</span></div>
                                <textarea value={tasks.find(t => t.id === editingTaskId)?.description || ''} onChange={(e) => setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, description: e.target.value } : t))} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-[15px] min-h-[100px]" autoFocus />
                                <button onClick={() => setEditingTaskId(null)} className="mt-3 w-full bg-[#0066cc] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">เสร็จสิ้น</button>
                            </div>
                        ) : activeField ? (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-[#0066cc]/30 stagger-item" style={{ animationDelay: '100ms' }}>
                                <div className="flex items-center gap-2 mb-3 text-[#0066cc]"><Edit3 size={16} /><span className="font-semibold text-sm">{fieldLabels[activeField]}</span></div>
                                <input type="text" value={docData[activeField] || ''} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]" autoFocus />
                            </div>
                        ) : (
                            <div className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-gray-400 text-sm h-[150px] stagger-item" style={{ animationDelay: '100ms' }}>
                                <Settings2 size={32} className="mb-3 opacity-20" /> ยังไม่ได้เลือกข้อความ
                            </div>
                        )}
                    </div>
                )}

                {/* 🔴 Panel: เป้าหมายงาน (ใส่ Stagger) */}
                {activePanel === 'tracker' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end mb-2 stagger-item" style={{ animationDelay: '50ms' }}>
                            <p className="text-[#7a7a7a] text-[13px]">กำหนดงานที่ต้องทำให้ครบ</p>
                            {!isAddingTarget && <button onClick={() => setIsAddingTarget(true)} className="text-[#0066cc] bg-[#0066cc]/10 p-1.5 rounded-full hover:scale-110 transition-transform"><PlusCircle size={20} /></button>}
                        </div>

                        {isAddingTarget && (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 stagger-item" style={{ animationDelay: '100ms' }}>
                                <input type="text" placeholder="ชื่องาน" value={newTargetName} onChange={(e) => setNewTargetName(e.target.value)} className="w-full mb-2 border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                                <div className="flex gap-2">
                                    <input type="number" placeholder="จำนวนครั้ง" value={newTargetCount} onChange={(e) => setNewTargetCount(e.target.value)} min="1" className="w-[120px] border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                                    <button onClick={handleAddTarget} className="flex-1 bg-[#0066cc] text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">เพิ่ม</button>
                                </div>
                            </div>
                        )}

                        {/* วนลูปโชว์เป้าหมาย พร้อมตั้งค่า Delay ให้เด้งเรียงคิว */}
                        {targets.map((target, index) => {
                            const progress = getTargetProgress(target.name);
                            const isMet = progress >= target.targetCount;
                            return (
                                <div
                                    key={target.id}
                                    className={`p-4 rounded-2xl border transition-all stagger-item ${isMet ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'}`}
                                    style={{ animationDelay: `${150 + (index * 50)}ms` }} // 🔴 หัวใจสำคัญของการเรียงแถว!
                                >
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {isMet ? <CheckCircle2 size={18} className="text-green-500" /> : <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>}
                                            <span className="font-semibold text-[15px]">{target.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xl font-bold ${isMet ? 'text-green-600' : 'text-orange-500'}`}>{progress}</span><span className="text-gray-400 text-sm">/{target.targetCount}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                                        <div className={`h-1.5 rounded-full transition-all duration-500 ${isMet ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${Math.min((progress / target.targetCount) * 100, 100)}%` }}></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { handleUseTarget(target.name); setActivePanel(null); setIsMenuOpen(false); }} className="flex-1 py-2 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc]/20 transition-colors"><ListTodo size={14} /> นำไปใช้งาน</button>
                                        <button onClick={() => handleDeleteTarget(target.id)} className="px-3 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-xl"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}