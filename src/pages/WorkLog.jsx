
import '../App.css'
import { useState, useEffect, useMemo } from 'react';

import { ChevronLeft, ChevronRight, List, FileText, Trash2 } from 'lucide-react';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

import { toThaiNumber, currentMonth, currentYear, getDaysInMonth, isWeekend, getThaiDayName } from '../utils/dateUtils';
import FloatingMenu from '../components/FloatingMenu';
import TaskInputBar from '../components/TaskInputBar';
import A4Document from '../components/A4Document';
import Orb from '../components/Orb';

// ==========================================
// 🚀 WORK LOG COMPONENT
// ==========================================
export default function WorkLog() { // เปลี่ยนชื่อจาก App เป็น WorkLog
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activePanel, setActivePanel] = useState(null);
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

    // 🔴 State ควบคุมหน้ากระดาษปัจจุบัน
    const [currentPage, setCurrentPage] = useState(0);

    const [docData, setDocData] = useState(() => {
        const savedDocData = localStorage.getItem('smartWorkLog_docData');
        if (savedDocData) return JSON.parse(savedDocData);
        return {
            reportMonth: `${currentMonth} ${currentYear}`, docNumber: 'xxxx/xxx', docDay: 'xx',
            docMonth: currentMonth, docYear: currentYear, inspectorName: 'ชื่อผู้ตรวจ',
            inspectorPosition: 'ตำแหน่งผู้ตรวจ', contractNo: 'CNTR-xxxxx/xx',
            contractDate: `xx xxx ${currentYear}`, contractorName: '(ชื่อผู้รับจ้าง)',
            workStartDay: 'xx', workEndDay: 'วันที่', workEndMonth: 'เดือน', workEndYear: currentYear,
        };
    });

    const [activeField, setActiveField] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);

    const fieldLabels = {
        reportMonth: 'ประจำเดือน (ส่วนหัว)', docNumber: 'เลขที่บันทึกข้อความ (ลพ)',
        docDay: 'วันที่ลงบันทึก', docMonth: 'เดือนที่ลงบันทึก', docYear: 'ปีที่ลงบันทึก (พ.ศ.)',
        inspectorName: 'ชื่อผู้ตรวจรับพัสดุ', inspectorPosition: 'ตำแหน่งผู้ตรวจรับพัสดุ',
        contractNo: 'สัญญาเลขที่', contractDate: 'วันที่ลงสัญญา', contractorName: 'ชื่อผู้รับจ้าง',
        workStartDay: 'วันที่เริ่มงาน', workEndDay: 'วันที่สิ้นสุดงาน',
        workEndMonth: 'เดือนที่ปฏิบัติงาน', workEndYear: 'ปีที่ปฏิบัติงาน',
    };

    const handleTextClick = (fieldName) => {
        setActiveField(fieldName); setEditingTaskId(null);
        setActivePanel('edit'); setIsMenuOpen(true);
    };

    const handleTaskClick = (task) => {
        setEditingTaskId(task.id); setActiveField(null);
        setActivePanel('edit'); setIsMenuOpen(true);
    };

    const handleInputChange = (e) => setDocData({ ...docData, [activeField]: toThaiNumber(e.target.value) });

    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('smartWorkLog_tasks');
        if (savedTasks) return JSON.parse(savedTasks);
        return [];
    });

    const [taskInput, setTaskInput] = useState({ day: new Date().getDate().toString(), description: '' });

    const handleAddTask = () => {
        if (taskInput.day && taskInput.description) {
            setTasks([...tasks, { id: Date.now(), day: taskInput.day, description: taskInput.description }]);
            setTaskInput({ ...taskInput, description: '' });
        }
    };

    const handleNewMonth = () => {
        if (window.confirm('คุณต้องการล้างตารางงานทั้งหมด เพื่อเริ่มเดือนใหม่ใช่หรือไม่?')) setTasks([]);
    };

    const handleDeleteTask = (idToDelete) => setTasks(tasks.filter(task => task.id !== idToDelete));

    const [targets, setTargets] = useState(() => {
        const savedTargets = localStorage.getItem('smartWorkLog_targets');
        if (savedTargets) return JSON.parse(savedTargets);
        return [];
    });
    const [newTargetName, setNewTargetName] = useState('');
    const [newTargetCount, setNewTargetCount] = useState('');
    const [isAddingTarget, setIsAddingTarget] = useState(false);

    const handleAddTarget = () => {
        if (newTargetName && newTargetCount) {
            setTargets([...targets, { id: Date.now(), name: newTargetName.trim(), targetCount: parseInt(newTargetCount) }]);
            setNewTargetName(''); setNewTargetCount(''); setIsAddingTarget(false);
        }
    };

    const handleDeleteTarget = (id) => setTargets(targets.filter(t => t.id !== id));
    const getTargetProgress = (targetName) => tasks.filter(task => task.description.includes(targetName)).length;
    const handleUseTarget = (targetName) => {
        setTaskInput(prev => ({ ...prev, description: targetName }));
        if (isMobile) setIsMenuOpen(false);
    };

    useEffect(() => { localStorage.setItem('smartWorkLog_docData', JSON.stringify(docData)); }, [docData]);
    useEffect(() => { localStorage.setItem('smartWorkLog_tasks', JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem('smartWorkLog_targets', JSON.stringify(targets)); }, [targets]);

    const handleExportWord = async () => {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}template.docx`);
            if (!response.ok) throw new Error(`ไม่พบไฟล์ template.docx (สถานะ: ${response.status})`);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const zip = new PizZip(arrayBuffer);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const exportTasks = tasks.sort((a, b) => Number(a.day) - Number(b.day)).map(task => ({
                dayThai: toThaiNumber(task.day), description: task.description
            }));
            doc.render({ ...docData, tasks: exportTasks });
            const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            saveAs(out, `บันทึกงาน_${docData.reportMonth}.docx`);
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด: โปรดตรวจสอบว่ามีไฟล์ template.docx อยู่ในโฟลเดอร์ public แล้ว');
        }
    };

    const pages = useMemo(() => {
        const grouped = tasks.sort((a, b) => Number(a.day) - Number(b.day)).reduce((acc, task) => {
            if (!acc[task.day]) acc[task.day] = [];
            acc[task.day].push(task); return acc;
        }, {});

        const calculatedPages = [];
        let currentPageRows = [];
        let currentLinesCount = 0;
        const entries = Object.entries(grouped);

        if (entries.length === 0) { calculatedPages.push([]); } else {
            entries.forEach(([day, dayTasks]) => {
                const lineWeight = dayTasks.length || 1;
                const maxAllowed = calculatedPages.length === 0 ? 8 : 18;
                if (currentLinesCount + lineWeight > maxAllowed && currentPageRows.length > 0) {
                    calculatedPages.push(currentPageRows); currentPageRows = []; currentLinesCount = 0;
                }
                currentPageRows.push({ day, dayTasks });
                currentLinesCount += lineWeight;
            });
            if (currentPageRows.length > 0) calculatedPages.push(currentPageRows);
        }
        return calculatedPages;
    }, [tasks]);

    // ตรวจสอบเพื่อไม่ให้กระดาษค้างในหน้าตารางที่ถูกลบไปแล้ว
    useEffect(() => {
        if (currentPage >= pages.length && pages.length > 0) {
            setCurrentPage(pages.length - 1);
        }
    }, [pages.length, currentPage]);

    // ==========================================
    // 🧩 RENDER FUNCTIONS
    // ==========================================

    // 💻 โซนสำหรับ Desktop
    const renderDesktopView = () => (
        <div className="flex w-full h-screen overflow-hidden architectural-grid">

            {/* 🟢 ฝั่งซ้าย (40%): พื้นหลังหลัก */}
            <div className="w-[45%] min-w-[520px] h-full relative flex flex-col justify-center items-center p-6 bg-transparent z-30">
                <div className="relative w-full max-w-[620px] h-[96%] max-h-[900px] bg-[#f8f7f4] rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white flex flex-col justify-center items-center px-12 transition-all group">

                    {/* 🌟 WebGL Orb Effect (ลูกแก้ว 3D พื้นหลัง) */}
                    <div className="absolute inset-0 z-0 pointer-events-none rounded-[40px] overflow-hidden opacity-40">
                        <Orb
                            hoverIntensity={2}
                            hue={0}
                            forceHoverState={false}
                            backgroundColor="#f8f7f4"
                        />
                    </div>
                    {/* เส้นตัด (Crosshairs) */}
                    <div className="absolute inset-0 pointer-events-none z-0 rounded-[40px] overflow-hidden">
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/[0.03] -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/[0.03] -translate-y-1/2"></div>
                    </div>

                    {/* 🔴 กรอบมุม 4 ด้าน */}
                    {/* Top-Left: ตกแต่ง */}
                    <div className="absolute top-6 left-6 z-[60]">
                        <FloatingMenu
                            isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} activePanel={activePanel} setActivePanel={setActivePanel}
                            activeField={activeField} fieldLabels={fieldLabels} docData={docData} handleInputChange={handleInputChange}
                            editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId} tasks={tasks} setTasks={setTasks}
                            isAddingTarget={isAddingTarget} setIsAddingTarget={setIsAddingTarget} newTargetName={newTargetName} setNewTargetName={setNewTargetName}
                            newTargetCount={newTargetCount} setNewTargetCount={setNewTargetCount} handleAddTarget={handleAddTarget} targets={targets}
                            getTargetProgress={getTargetProgress} handleUseTarget={handleUseTarget} handleDeleteTarget={handleDeleteTarget}
                            handleExportWord={handleExportWord}
                        />
                    </div>
                    {/* Top-Right: ปุ่มล้างตาราง (CLEAR) */}
                    <button onClick={handleNewMonth} className="absolute top-6 right-6 group flex items-start gap-3 transition-all hover:scale-105 active:scale-95 z-40">
                        <span className="text-[10px] tracking-[0.2em] font-bold text-gray-300 group-hover:text-red-500 transition-colors uppercase mt-[-4px]">Clear</span>
                        <div className="w-8 h-8 border-t-[2px] border-r-[2px] border-black/20 group-hover:border-red-500 transition-colors"></div>
                    </button>

                    {/* Bottom-Left: ปุ่มหน้าก่อนหน้า (PREV) */}
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className={`absolute bottom-6 left-6 group flex items-end gap-3 transition-all z-40 ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        <div className={`w-8 h-8 border-b-[2px] border-l-[2px] border-black/20 transition-colors ${currentPage !== 0 && 'group-hover:border-[#0066cc]'}`}></div>
                        <span className={`text-[10px] tracking-[0.2em] font-bold text-gray-300 uppercase mb-[-4px] transition-colors ${currentPage !== 0 && 'group-hover:text-[#0066cc]'}`}>Prev</span>
                    </button>

                    {/* Bottom-Right: ปุ่มหน้าถัดไป (NEXT) */}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                        disabled={currentPage === pages.length - 1}
                        className={`absolute bottom-6 right-6 group flex items-end gap-3 transition-all z-40 ${currentPage === pages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        <span className={`text-[10px] tracking-[0.2em] font-bold text-gray-300 uppercase mb-[-4px] transition-colors ${currentPage !== pages.length - 1 && 'group-hover:text-[#0066cc]'}`}>Next</span>
                        <div className={`w-8 h-8 border-b-[2px] border-r-[2px] border-black/20 transition-colors ${currentPage !== pages.length - 1 && 'group-hover:border-[#0066cc]'}`}></div>
                    </button>

                    {/* Typography ชื่อเว็บแบบเล่นคำ หนา-บาง */}
                    <div className="flex flex-col items-center w-full relative z-20">
                        <div className="mb-10 text-center flex flex-col items-center">
                            <p className="text-[10px] tracking-[0.4em] text-gray-500 font-semibold uppercase mb-4"> Work Log for me</p>
                            <h1 className="text-[52px] font-black tracking-tighter text-[#1d1d1f] leading-[1.05] mb-4">
                                <span className="font-light tracking-tight">Daily Work</span>
                            </h1>
                            {/* จุดตกแต่งใต้ชื่อเว็บ */}
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f]"></div>
                                <div className="h-[1px] w-12 bg-[#1d1d1f]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f]"></div>
                            </div>
                        </div>

                        <TaskInputBar
                            isMobile={false}
                            taskInput={taskInput} setTaskInput={setTaskInput}
                            handleAddTask={handleAddTask}
                            docData={docData}
                        />
                    </div>

                </div>
            </div>

            {/* 🟠 ฝั่งขวา (60%): โซนกระดาษ A4 */}
            <div className="w-[60%] flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col items-center py-10 relative z-10 bg-transparent">
                <div className="scale-[0.80] xl:scale-[0.95] 2xl:scale-[1.05] origin-top transition-transform duration-500 ease-out drop-shadow-2xl">
                    <A4Document
                        currentPage={currentPage} pages={pages} docData={docData}
                        handleTextClick={handleTextClick} handleTaskClick={handleTaskClick} handleDeleteTask={handleDeleteTask}
                    />
                </div>
            </div>

        </div >
    );

    // 📱 โซนสำหรับ Mobile
    const renderMobileView = () => (
        <div className="w-full flex flex-col min-h-screen pb-24 relative bg-[#f8f7f4]">

            <FloatingMenu
                isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} activePanel={activePanel} setActivePanel={setActivePanel}
                activeField={activeField} fieldLabels={fieldLabels} docData={docData} handleInputChange={handleInputChange}
                editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId} tasks={tasks} setTasks={setTasks}
                isAddingTarget={isAddingTarget} setIsAddingTarget={setIsAddingTarget} newTargetName={newTargetName} setNewTargetName={setNewTargetName}
                newTargetCount={newTargetCount} setNewTargetCount={setNewTargetCount} handleAddTarget={handleAddTarget} targets={targets}
                getTargetProgress={getTargetProgress} handleUseTarget={handleUseTarget} handleDeleteTarget={handleDeleteTarget}
                handleExportWord={handleExportWord}
            />

            {/* 🔴 ตกแต่งชื่อเว็บมือถือให้ล้อตาม Desktop */}
            <div className="pt-[100px] pb-[40px] px-4 flex flex-col items-center w-full relative z-20">
                <p className="text-[9px] tracking-[0.4em] text-gray-500 font-semibold uppercase mb-2">Work Log for me</p>
                <h1 className="text-[36px] font-black tracking-tight mb-6 text-[#1d1d1f] text-center leading-[1.1]">
                    <span className="font-light tracking-tight">Daily Work</span>
                </h1>

                <TaskInputBar
                    isMobile={true}
                    taskInput={taskInput} setTaskInput={setTaskInput}
                    handleAddTask={handleAddTask} handleNewMonth={handleNewMonth}
                    docData={docData}
                />
            </div>

            <main className="relative z-10 bg-white/90 backdrop-blur-md rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-white/50 flex-1 w-full pt-8 px-4 pb-10">

                {/* 1. ปุ่มกดเปิดเอกสาร (แก้ให้คลิกแล้วเปิด Modal) */}
                <div className="max-w-[500px] mx-auto mb-6">
                    <button
                        onClick={() => setIsMobilePreviewOpen(true)}
                        className="w-full bg-[#1d1d1f] shadow-lg text-white px-6 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 text-[15px]"
                    >
                        <FileText size={18} /> 👀 ดูตัวอย่างเอกสาร (A4)
                    </button>
                </div>

                {/* 2. Task List (เอาเงื่อนไขซ่อน/แสดงออก ให้มันโชว์ตลอดเวลา) */}
                <div className="max-w-[500px] mx-auto flex flex-col gap-3">
                    <div className="text-center text-gray-500 text-[12px] font-semibold mb-1 uppercase tracking-widest">-- Task List --</div>
                    {pages.length === 0 || pages.every(p => p.length === 0) ? (
                        <div className="text-center text-gray-400 text-sm mt-4 italic">ยังไม่มีรายการปฏิบัติงาน</div>
                    ) : (
                        pages.map((pageContent) => pageContent.map(({ day, dayTasks }) => dayTasks.map((task) => (
                            <div key={task.id} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden active:scale-[0.98] transition-transform">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1d1d1f]"></div>
                                <div className="flex justify-between items-center ml-2">
                                    <span className="font-bold text-[#1d1d1f] bg-gray-100/80 px-3 py-1 rounded-lg text-[14px]">วันที่ {day}</span>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 p-2 -mr-2"><Trash2 size={18} /></button>
                                </div>
                                <p onClick={() => handleTaskClick(task)} className="text-gray-700 text-[15px] ml-2 mt-1 leading-relaxed">{task.description}</p>
                            </div>
                        ))))
                    )}
                </div>
            </main>

            {/* 3. 🌟 โค้ด Modal หน้าต่างเด้งพรีวิวเอกสาร (ดีไซน์ใหม่ ไร้กรอบ ขยายใหญ่ เลื่อนได้พอดี) */}
            {isMobilePreviewOpen && (
                <div className="fixed inset-0 z-[1000] flex flex-col items-center bg-black/85 backdrop-blur-sm animate-modal-pop overflow-hidden">

                    {/* ปุ่ม ✕ ลอยอยู่มุมขวาบนเด่นๆ */}
                    <button
                        onClick={() => setIsMobilePreviewOpen(false)}
                        className="absolute top-4 right-4 z-[1010] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-90 shadow-lg"
                    >
                        <span className="text-xl leading-none -mt-0.5">✕</span>
                    </button>

                    {/* พื้นที่แสดงเอกสาร (ระบบ Scroll เลื่อนขึ้น-ลงได้) */}
                    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-20 pb-32 flex justify-center items-start custom-scrollbar">

                        {/* 🔴 กล่องครอบที่ล็อคความสูง-กว้างให้เท่ากับขนาด 48% เป๊ะๆ (แก้ปัญหาเลื่อนทะลุ) */}
                        <div
                            className="relative shadow-2xl bg-white"
                            style={{ width: 'calc(210mm * 0.48)', height: 'calc(297mm * 0.48)' }}
                        >
                            {/* กระดาษ A4 ถูกจับให้ชิดซ้ายบน (origin-top-left) เพื่อไม่ให้ตำแหน่งเพี้ยนเวลาใส่กล่องครอบ */}
                            <div className="absolute top-0 left-0 transform scale-[0.48] origin-top-left">
                                <A4Document
                                    currentPage={currentPage}
                                    pages={pages}
                                    docData={docData}
                                    handleTextClick={handleTextClick}
                                    handleTaskClick={handleTaskClick}
                                    handleDeleteTask={handleDeleteTask}
                                />
                            </div>
                        </div>

                    </div>

                    {/* ปุ่มเปลี่ยนหน้า (ลอยอยู่ด้านล่างสุดของจอ) */}
                    {pages.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-6 py-2 px-6 bg-black/60 backdrop-blur-md border border-white/20 rounded-full z-10 shadow-xl">
                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className={`p-2 rounded-full transition-all ${currentPage === 0 ? 'text-gray-500' : 'text-white hover:bg-white/20 active:scale-90'}`}><ChevronLeft size={20} /></button>
                            <span className="font-bold text-[14px] text-gray-300 tracking-wider">PAGE {currentPage + 1} / {pages.length}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))} disabled={currentPage === pages.length - 1} className={`p-2 rounded-full transition-all ${currentPage === pages.length - 1 ? 'text-gray-500' : 'text-white hover:bg-white/20 active:scale-90'}`}><ChevronRight size={20} /></button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (isMobile === null) return null;

    return (
        <div className="min-h-screen text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white">
            {isMobile ? renderMobileView() : renderDesktopView()}
        </div>
    );
}