// src/components/TaskInputBar.jsx
import { useState, useRef, useEffect } from 'react';
import { Plus, Check, Calendar as CalendarIcon } from 'lucide-react';
import { getDaysInMonth, isWeekend, thaiMonths } from '../utils/dateUtils';

export default function TaskInputBar({
    isMobile, taskInput, setTaskInput, handleAddTask, docData
}) {
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
    const [successAnim, setSuccessAnim] = useState(false);

    const textareaRef = useRef(null);

    const handleAddWithAnimation = () => {
        if (taskInput.day && taskInput.description) {
            handleAddTask();
            setSuccessAnim(true);
            setTimeout(() => setSuccessAnim(false), 500);
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [taskInput.description]);

    const reportParts = (docData?.reportMonth || '').split(' ');
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
        <div className="w-full relative z-30 flex flex-col items-center">

            {/* กล่อง input หลัก: กำหนด relative และ z-40 เพื่อให้อยู่เหนือ Backdrop เสมอ */}
            <div className={`bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-xl rounded-[28px] p-2 flex items-end w-full transition-all duration-300 focus-within:scale-[1.01] focus-within:ring-4 focus-within:ring-[#0066cc]/15 focus-within:border-[#0066cc]/40 focus-within:shadow-[0_15px_35px_rgba(0,102,204,0.12)] relative z-40 ${isMobile ? 'gap-2 max-w-[500px]' : 'max-w-[450px]'
                }`}>

                {isMobile ? (
                    <div className="relative flex-none w-10 h-10 mb-1 bg-gray-50 rounded-full flex items-center justify-center font-bold text-[#1d1d1f]">
                        {taskInput.day || '?'}
                        <select
                            value={taskInput.day || ''}
                            onChange={(e) => setTaskInput({ ...taskInput, day: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="">?</option>
                            {daysArray.map(day => (<option key={day} value={day}>{day}</option>))}
                        </select>
                    </div>
                ) : (
                    <div
                        className="relative flex-none w-[120px] h-[48px] mb-1 flex justify-center items-center pr-2 border-r border-gray-200 font-medium text-[#1d1d1f] hover:bg-gray-50 transition-colors rounded-l-full cursor-pointer group"
                        onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={16} className="text-gray-400 group-hover:text-[#0066cc] transition-colors" />
                            <span className="truncate">{taskInput.day ? `วันที่ ${taskInput.day}` : 'เลือกวันที่'}</span>
                        </div>

                        {/* กล่องปฏิทิน Dropdown */}
                        <div
                            className={`absolute bottom-[120%] left-2 w-[280px] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[24px] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] z-50 p-5 transition-all duration-300 origin-bottom-left ${isDateMenuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                                }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-[15px]">{parsedMonth} {parsedYear}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTaskInput({ ...taskInput, day: '' });
                                        setIsDateMenuOpen(false);
                                    }}
                                    className="text-[12px] text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                    ล้างค่า
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[12px] font-bold text-gray-400">
                                {dayLabels.map((day, i) => <div key={i} className={i === 0 || i === 6 ? 'text-red-400' : ''}>{day}</div>)}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {emptyCells.map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                                {daysArray.map(dayNum => {
                                    const isHoliday = isWeekend(dayNum, parsedMonth, parsedYear);
                                    const isSelected = String(taskInput.day) === String(dayNum);
                                    return (
                                        <button
                                            type="button"
                                            key={dayNum}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTaskInput({ ...taskInput, day: String(dayNum) });
                                                setIsDateMenuOpen(false);
                                            }}
                                            className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[14px] transition-all duration-200 cursor-pointer ${isSelected
                                                    ? 'bg-[#1d1d1f] text-white font-bold shadow-md scale-110'
                                                    : 'hover:bg-gray-100 hover:scale-110'
                                                } ${isHoliday && !isSelected ? 'text-red-500 font-medium' : 'text-gray-700'}`}
                                        >
                                            {dayNum}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={taskInput.description || ''}
                    onChange={(e) => setTaskInput({ ...taskInput, description: e.target.value })}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddWithAnimation();
                        }
                    }}
                    placeholder={isMobile ? "รายละเอียดงาน..." : "รายละเอียดงานที่ปฏิบัติ..."}
                    className={`flex-1 bg-transparent py-3 outline-none text-[#1d1d1f] placeholder-gray-400 resize-none overflow-y-auto leading-relaxed transition-all no-scrollbar ${isMobile ? 'px-3 text-[16px] min-w-0' : 'px-5 text-[16px]'
                        }`}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                />

                <button
                    type="button"
                    onClick={handleAddWithAnimation}
                    className={`relative flex-none mb-1 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer ${successAnim ? 'bg-transparent' : 'bg-[#1d1d1f] hover:bg-[#2a2a2c] shadow-md'
                        } ${isMobile ? 'w-10 h-10' : 'px-6 h-[48px] font-medium'}`}
                >
                    {successAnim && (
                        <div className="absolute inset-0 rounded-full overflow-hidden p-[2px]">
                            <div className="absolute top-1/2 left-1/2 w-[250%] h-[250%] bg-[conic-gradient(transparent_70%,#10b981_100%)] animate-spin-border"></div>
                        </div>
                    )}

                    <div className={`absolute inset-[2px] rounded-full flex items-center justify-center transition-colors duration-300 ${successAnim ? 'bg-emerald-500' : 'bg-transparent'
                        }`}></div>

                    {successAnim && (
                        <svg className="absolute w-[180%] h-[180%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-burst" viewBox="0 0 100 100">
                            <line x1="50" y1="28" x2="50" y2="8" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <line x1="50" y1="72" x2="50" y2="92" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <line x1="28" y1="50" x2="8" y2="50" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <line x1="72" y1="50" x2="92" y2="50" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <line x1="34" y1="34" x2="20" y2="20" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <line x1="66" y1="66" x2="80" y2="80" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <line x1="66" y1="34" x2="80" y2="20" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <line x1="34" y1="66" x2="20" y2="80" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    )}

                    <div className="relative z-10 flex items-center gap-1.5 text-white">
                        {successAnim ? (
                            <>
                                <Check size={18} />
                                {!isMobile && <span className="font-bold tracking-wide">Finish</span>}
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                {!isMobile && 'Add'}
                            </>
                        )}
                    </div>
                </button>
            </div>

            {/* Backdrop: อยู่ที่ z-20 เพื่อให้อยู่ใต้กล่อง Input (z-40) แต่ยังคลุมส่วนอื่นๆ ของหน้าจอ */}
            {isDateMenuOpen && !isMobile && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsDateMenuOpen(false)}
                />
            )}
        </div>
    );
}