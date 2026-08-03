// src/components/Sidebar.jsx
import { X, Edit3, Target, Settings2, PlusCircle, CheckCircle2, ListTodo, Trash2, Download } from 'lucide-react';

export default function Sidebar({
    isMobile, isSidebarOpen, setIsSidebarOpen,
    sidebarTab, setSidebarTab,
    activeField, fieldLabels, docData, handleInputChange,
    editingTaskId, setEditingTaskId, tasks, setTasks,
    isAddingTarget, setIsAddingTarget,
    newTargetName, setNewTargetName,
    newTargetCount, setNewTargetCount,
    handleAddTarget, targets, getTargetProgress,
    handleUseTarget, handleDeleteTarget,
    handleExportWord
}) {
    return (
        <>
            {isSidebarOpen && isMobile && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* 🔴 ปรับความกว้าง Sidebar บนคอมให้กินพื้นที่แค่ 30% (สูงสุดไม่เกิน 450px) */}
            <div className={`fixed top-0 left-0 h-full w-[85vw] md:w-[30%] max-w-[450px] bg-white/95 backdrop-blur-2xl border-r border-[#e0e0e0] shadow-[20px_0_40px_rgba(0,0,0,0.1)] z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pt-[60px] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">

                    <div className="px-6 pt-2 pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[20px] font-semibold tracking-tight">แผงควบคุม</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-[#1d1d1f]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button onClick={() => setSidebarTab('edit')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${sidebarTab === 'edit' ? 'bg-white text-[#0066cc] shadow-sm' : 'text-gray-500'}`}>
                                <Edit3 size={16} /> ข้อมูลเอกสาร
                            </button>
                            <button onClick={() => setSidebarTab('tracker')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${sidebarTab === 'tracker' ? 'bg-white text-[#0066cc] shadow-sm' : 'text-gray-500'}`}>
                                <Target size={16} /> เป้าหมายงาน
                            </button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        {sidebarTab === 'edit' ? (
                            <>
                                <p className="text-[#7a7a7a] text-[13px] mb-5 leading-relaxed">คลิกที่ข้อความสีฟ้าบนเอกสารเพื่อทำการแก้ไขข้อมูล</p>
                                {editingTaskId ? (
                                    <div className="bg-white p-5 rounded-[14px] border border-[#0066cc]/30 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3 text-[#0066cc]"><Edit3 size={16} /><span className="font-semibold text-sm">แก้ไขงาน</span></div>
                                        <textarea value={tasks.find(t => t.id === editingTaskId)?.description || ''} onChange={(e) => setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, description: e.target.value } : t))} className="w-full border border-[#e0e0e0] rounded-lg px-4 py-3 bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-[15px] min-h-[100px]" autoFocus />
                                        <button onClick={() => setEditingTaskId(null)} className="mt-3 w-full bg-[#0066cc] text-white py-2 rounded-lg text-sm">เสร็จสิ้น</button>
                                    </div>
                                ) : activeField ? (
                                    <div className="bg-white p-5 rounded-[14px] border border-[#0066cc]/30 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3 text-[#0066cc]"><Edit3 size={16} /><span className="font-semibold text-sm">{fieldLabels[activeField]}</span></div>
                                        <input type="text" value={docData[activeField] || ''} onChange={handleInputChange} className="w-full border border-[#e0e0e0] rounded-lg px-4 py-3 bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]" autoFocus />
                                    </div>
                                ) : (
                                    <div className="flex-1 p-5 bg-[#f5f5f7] rounded-[11px] border border-[#e0e0e0] border-dashed flex flex-col items-center justify-center text-[#7a7a7a] text-sm h-[200px]">
                                        <Settings2 size={32} className="mb-3 opacity-20" /> เลือกข้อความบนเอกสารเพื่อเริ่มแก้ไข
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[#7a7a7a] text-[13px] pr-4">กำหนดขอบเขตงานที่ต้องทำให้ครบในแต่ละเดือน</p>
                                    {!isAddingTarget && <button onClick={() => setIsAddingTarget(true)} className="text-[#0066cc] bg-[#0066cc]/10 p-1.5 rounded-full"><PlusCircle size={20} /></button>}
                                </div>
                                {isAddingTarget && (
                                    <div className="bg-[#f5f5f7] p-4 rounded-[14px] border border-[#e0e0e0] mb-2">
                                        <input type="text" placeholder="ชื่องาน" value={newTargetName} onChange={(e) => setNewTargetName(e.target.value)} className="w-full mb-2 border rounded-lg px-3 py-2 text-sm" />
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="จำนวนครั้ง" value={newTargetCount} onChange={(e) => setNewTargetCount(e.target.value)} min="1" className="w-[120px] border rounded-lg px-3 py-2 text-sm" />
                                            <button onClick={handleAddTarget} className="flex-1 bg-[#0066cc] text-white rounded-lg text-sm">เพิ่ม</button>
                                        </div>
                                    </div>
                                )}
                                {targets.map((target) => {
                                    const progress = getTargetProgress(target.name);
                                    const isMet = progress >= target.targetCount;
                                    return (
                                        <div key={target.id} className={`p-4 rounded-[14px] border ${isMet ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
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
                                                <div className={`h-1.5 rounded-full ${isMet ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${Math.min((progress / target.targetCount) * 100, 100)}%` }}></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUseTarget(target.name)} className="flex-1 py-1.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc]/20"><ListTodo size={14} /> นำไปใช้งาน</button>
                                                <button onClick={() => handleDeleteTarget(target.id)} className="px-2 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {isMobile && (
                        <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
                            <button onClick={handleExportWord} className="w-full bg-[#1d1d1f] text-white py-3.5 rounded-[12px] shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform text-[15px] font-bold">
                                <Download size={18} /> Export เอกสาร (Word)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}