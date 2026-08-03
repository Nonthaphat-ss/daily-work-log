// src/components/TaskInputBar.jsx
import { useState } from 'react';
import { Plus, Check, Calendar as CalendarIcon } from 'lucide-react';
import { getDaysInMonth, isWeekend, thaiMonths } from '../utils/dateUtils';

export default function TaskInputBar({
    isMobile, taskInput, setTaskInput, handleAddTask, docData
}) {
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
    const [successAnim, setSuccessAnim] = useState(false);

    const handleAddWithAnimation = () => {
        if (taskInput.day && taskInput.description) {
            handleAddTask();
            setSuccessAnim(true);
            // เอฟเฟกต์ฟองอากาศจะเล่นประมาณ 500ms แล้วยุบตัวกลับปกติอย่างนุ่มนวล
            setTimeout(() => setSuccessAnim(false), 500);
        }
    };

    const reportParts = (docData.reportMonth || '').split(' ');
    const parsedMonth = reportParts[0] || 'มกราคม';
    const parsedYear = reportParts[1] || '๒๕๖๗';

    const monthIndex = thaiMonths.indexOf(parsedMonth) !== -1 ? thaiMonths.indexOf(parsedMonth) : new Date().getMonth();
    const cleanYear = parsedYear.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
    const yearCE = (parseInt(cleanYear) || (new Date().getFullYear() + 543)) - 543;
    const firstDayOfWeek = new Date(yearCE, monthIndex, 1).getDay();
    const daysInMonth = getDaysInMonth(parsedMonth, parsedYear);
    const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => i);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayLabels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    return (
        <div className="w-full relative z-20 flex flex-col items-center">

            {/* กล่อง input หลัก: ขยายพองตัวรับฟองอากาศ */}
            <div className={`rounded-full p-2 flex items-center w-full transition-all duration-300 ease-out ${successAnim
                    ? 'scale-[1.03] ring-4 ring-emerald-400/40 bg-emerald-50/50 border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-xl'
                } ${isMobile ? 'gap-2 relative z-10 max-w-[500px]' : 'max-w-[450px]'}`}>

                {isMobile ? (
                    <div className="relative flex-none w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-bold text-[#1d1d1f]">
                        {taskInput.day || '?'}
                        <select value={taskInput.day || ''} onChange={(e) => setTaskInput({ ...taskInput, day: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                            <option value="">?</option>
                            {daysArray.map(day => (<option key={day} value={day}>{day}</option>))}
                        </select>
                    </div>
                ) : (
                    <div className="relative flex-none w-[120px] h-[48px] flex justify-center items-center pr-2 border-r border-gray-200 font-medium text-[#1d1d1f] hover:bg-gray-50 transition-colors rounded-l-full cursor-pointer group" onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}>
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={16} className="text-gray-400 group-hover:text-[#0066cc] transition-colors" />
                            <span className="truncate">{taskInput.day ? `วันที่ ${taskInput.day}` : 'เลือกวันที่'}</span>
                        </div>

                        <div className={`absolute bottom-[120%] left-2 w-[280px] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[24px] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] z-50 p-5 transition-all duration-300 origin-bottom-left ${isDateMenuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>

                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-[15px]">{parsedMonth} {parsedYear}</span>
                                <button onClick={(e) => { e.stopPropagation(); setTaskInput({ ...taskInput, day: '' }); setIsDateMenuOpen(false); }} className="text-[12px] text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">ล้างค่า</button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[12px] font-bold text-gray-400">
                                {dayLabels.map((day, i) => <div key={i} className={i === 0 || i === 6 ? 'text-red-400' : ''}>{day}</div>)}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {emptyCells.map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                                {daysArray.map(dayNum => {
                                    const isHoliday = isWeekend(dayNum, parsedMonth, parsedYear);
                                    const isSelected = taskInput.day == dayNum;
                                    return (
                                        <button
                                            key={dayNum}
                                            onClick={() => { setTaskInput({ ...taskInput, day: dayNum }); setIsDateMenuOpen(false); }}
                                            className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[14px] transition-all duration-200 ${isSelected ? 'bg-[#1d1d1f] text-white font-bold shadow-md scale-110' : 'hover:bg-gray-100 hover:scale-110'} ${isHoliday && !isSelected ? 'text-red-500 font-medium' : 'text-gray-700'}`}
                                        >
                                            {dayNum}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <input
                    type="text"
                    value={taskInput.description || ''}
                    onChange={(e) => setTaskInput({ ...taskInput, description: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWithAnimation()}
                    placeholder={isMobile ? "รายละเอียดงาน..." : "รายละเอียดงานที่ปฏิบัติ..."}
                    className={`flex-1 bg-transparent py-2 outline-none text-[#1d1d1f] placeholder-gray-400 transition-all ${isMobile ? 'px-3 text-[16px] min-w-0' : 'px-5 text-[16px]'}`}
                />

                {/* 🫧 ปุ่ม Add แบบ Bubble Pop Effect */}
                <button
                    onClick={handleAddWithAnimation}
                    className={`relative overflow-hidden flex-none text-white flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 ${successAnim
                            ? 'bg-emerald-500 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.6),inset_0_0_8px_rgba(255,255,255,0.8)] rounded-full'
                            : 'bg-[#1d1d1f] hover:bg-[#0066cc] hover:shadow-lg rounded-full'
                        } ${isMobile ? 'w-10 h-10' : 'px-6 h-[48px] font-medium gap-2'}`}
                >
                    {/* วงแหวนฟองอากาศกระจายออก (Ripple / Ping Effect) */}
                    {successAnim && (
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60 pointer-events-none"></span>
                    )}

                    {successAnim ? (
                        <div className="relative z-10 flex items-center gap-1.5 transition-transform duration-300 scale-110">
                            <Check size={18} className="text-white" />
                            {!isMobile && <span className="font-bold tracking-wide">Added!</span>}
                        </div>
                    ) : (
                        <div className="relative z-10 flex items-center gap-1.5">
                            <Plus size={18} />
                            {!isMobile && 'Add'}
                        </div>
                    )}
                </button>
            </div>

            {isDateMenuOpen && !isMobile && (
                <div className="fixed inset-0 z-30" onClick={() => setIsDateMenuOpen(false)}></div>
            )}
        </div>
    );
}