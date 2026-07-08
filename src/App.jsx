import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import bgImg from './assets/bgforweb.png';
import './App.css'
import { useState, useEffect, useMemo } from 'react';

import {
  Plus, Download, Settings2, X, ChevronRight, Edit3, Trash2,
  RefreshCcw, Target, ListTodo, CheckCircle2, AlertCircle,
  PlusCircle, List, FileText
} from 'lucide-react';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

const toThaiNumber = (numStr) => {
  if (!numStr) return '';
  const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return numStr.toString().replace(/\d/g, (d) => thaiNums[d]);
};

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const currentDate = new Date();
const currentMonth = thaiMonths[currentDate.getMonth()];
const currentYear = toThaiNumber(currentDate.getFullYear() + 543);

const getDaysInMonth = (monthName, yearThai) => {
  const months30 = ['เมษายน', 'มิถุนายน', 'กันยายน', 'พฤศจิกายน'];
  if (months30.includes(monthName)) return 30;
  if (monthName === 'กุมภาพันธ์') {
    const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
    const yearCE = parseInt(cleanYear) - 543;
    const isLeap = (yearCE % 4 === 0 && yearCE % 100 !== 0) || (yearCE % 400 === 0);
    return isLeap ? 29 : 28;
  }
  return 31;
};

const isWeekend = (day, monthName, yearThai) => {
  const monthIndex = thaiMonths.indexOf(monthName);
  if (monthIndex === -1) return false;
  const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
  const yearCE = parseInt(cleanYear) - 543;
  const date = new Date(yearCE, monthIndex, parseInt(day));
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const getThaiDayName = (day, monthName, yearThai) => {
  const monthIndex = thaiMonths.indexOf(monthName);
  if (monthIndex === -1) return '';
  const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
  const yearCE = parseInt(cleanYear) - 543;
  const date = new Date(yearCE, monthIndex, parseInt(day));
  const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  return days[date.getDay()];
};

// ==========================================
// 🚀 MAIN APPLICATION COMPONENT
// ==========================================
function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('edit');
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

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
    setSidebarTab('edit'); setIsSidebarOpen(true);
  };

  const handleTaskClick = (task) => {
    setEditingTaskId(task.id); setActiveField(null);
    setSidebarTab('edit'); setIsSidebarOpen(true);
  };

  const handleInputChange = (e) => setDocData({ ...docData, [activeField]: e.target.value });

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
    if (isMobile) setIsSidebarOpen(false);
  };

  useEffect(() => { localStorage.setItem('smartWorkLog_docData', JSON.stringify(docData)); }, [docData]);
  useEffect(() => { localStorage.setItem('smartWorkLog_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('smartWorkLog_targets', JSON.stringify(targets)); }, [targets]);

  const handleExportWord = async () => {
    try {
      const response = await fetch('/template.docx');
      if (!response.ok) throw new Error('ไม่พบไฟล์ template.docx ในโฟลเดอร์ public');
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

  const editableClass = "whitespace-nowrap bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.05)] px-2 py-0.5 rounded-lg cursor-pointer hover:bg-white/70 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-300 text-[#0066cc] font-medium";

  // 🚀 แก้ความหน่วง 1: จำการคำนวณหน้ากระดาษไว้ จะคำนวณใหม่ก็ต่อเมื่อมีการ กดเพิ่ม/ลบงาน เท่านั้น
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

  // 🚀 แก้ความหน่วง 2: จำหน้าตา A4 ทั้งก้อนไว้! ไม่ต้องสร้างใหม่ตอนพิมพ์งานทีละตัวอักษร
  const memoizedA4Pages = useMemo(() => (
    <div className="w-full flex-col items-center gap-8 flex overflow-x-auto custom-scrollbar pb-8 px-4 md:px-0">
      {pages.map((pageContent, pageIndex) => (
        <div key={pageIndex} className="bg-white w-[210mm] min-h-[297mm] p-[25.4mm] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] shrink-0 font-['TH_SarabunIT๙',_'TH_Sarabun_New',_serif] text-[#1d1d1f] text-[18px] leading-relaxed flex flex-col relative transition-transform hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]">
          {pageIndex === 0 ? (
            <>
              <div className="text-center font-bold text-[20px] mb-2">รายละเอียดประกอบใบตรวจรับพัสดุ</div>
              <div className="text mb-2">
                ประกอบการเบิกจ่ายเงิน จ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม <br />
                ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span>
              </div>
              <div className="w-[38%] ml-auto mb-8">
                <div>เขียนที่สำนักงานเทศบาลตำบลอุโมงค์</div>
                <div>๒๓๔ หมู่ที่ ๕ ตำบลอุโมงค์ อำเภอเมืองลำพูน</div>
                <div>จังหวัดลำพูน ๕๑๑๕๐</div>
              </div>
              <div className="text-justify indent-12 mb-4 leading-[1.8]">
                ตามบันทึกข้อความ ที่ ลพ <span className={editableClass} onClick={() => handleTextClick('docNumber')}>{docData.docNumber}</span>{' '}
                ลงวันที่ <span className={editableClass} onClick={() => handleTextClick('docDay')}>{docData.docDay}</span>{' '}
                เดือน <span className={editableClass} onClick={() => handleTextClick('docMonth')}>{docData.docMonth}</span>{' '}
                พ.ศ. <span className={editableClass} onClick={() => handleTextClick('docYear')}>{docData.docYear}</span>{' '}
                แต่งตั้งผู้ตรวจรับพัสดุ เพื่อทำหน้าที่ตรวจรับงานจ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span> ได้แก่ <span className={editableClass} onClick={() => handleTextClick('inspectorName')}>{docData.inspectorName}</span> ตำแหน่ง <span className={editableClass} onClick={() => handleTextClick('inspectorPosition')}>{docData.inspectorPosition}</span>
              </div>
              <div className="text-justify indent-12 mb-8 leading-[1.8]">
                ผู้รับจ้างได้ปฏิบัติงานให้เป็นไปตามบันทึกข้อตกลงค่าจ้างเหมาบริการ สัญญาเลขที่ <span className={editableClass} onClick={() => handleTextClick('contractNo')}>{docData.contractNo}</span>{' '}
                ลงวันที่ <span className={editableClass} onClick={() => handleTextClick('contractDate')}>{docData.contractDate}</span>{' '}
                ซึ่งผู้รับจ้าง คือ <span className={editableClass} onClick={() => handleTextClick('contractorName')}>{docData.contractorName}</span>{' '}
                ได้ปฏิบัติงานตามบันทึกข้อตกลงจ้างข้างต้น ระหว่างวันที่ <span className={editableClass} onClick={() => handleTextClick('workStartDay')}>{docData.workStartDay}</span>{' '}
                ถึง <span className={editableClass} onClick={() => handleTextClick('workEndDay')}>{docData.workEndDay}</span>{' '}
                <span className={editableClass} onClick={() => handleTextClick('workEndMonth')}>{docData.workEndMonth}</span>{' '}
                <span className={editableClass} onClick={() => handleTextClick('workEndYear')}>{docData.workEndYear}</span> ดังนี้
              </div>
            </>
          ) : (
            <div className="text-center font-bold text-[18px] mb-6">- {toThaiNumber(pageIndex + 1)} -</div>
          )}

          <table className="w-full border-collapse border border-black text-center mt-8 mb-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-2 w-[30%]">วัน/เดือน/ปี</th>
                <th className="border border-black p-2 w-[50%]">งานที่ปฏิบัติ</th>
                <th className="border border-black p-2 w-[20%]">ลายมือชื่อ</th>
              </tr>
            </thead>
            <tbody>
              {pageContent.length === 0 ? (
                <tr>
                  <td colSpan="3" className="border border-black p-4 text-center text-gray-400 italic font-sans text-sm">
                    ยังไม่มีรายการปฏิบัติงาน ลองเพิ่มงานจากกล่องด้านบน
                  </td>
                </tr>
              ) : (
                pageContent.map(({ day, dayTasks }) => (
                  <tr key={day}>
                    <td className="border border-black p-3 align-top">
                      {toThaiNumber(day)} {docData.docMonth} {docData.docYear}
                    </td>
                    <td className="border border-black p-3 text-left align-top">
                      {dayTasks.map((task) => (
                        <div key={task.id} className="relative group pr-10 mb-2 last:mb-0">
                          <span onClick={() => handleTaskClick(task)} className="cursor-pointer hover:text-[#0066cc] hover:bg-[#0066cc]/5 px-1 rounded transition-colors block" title="คลิกเพื่อแก้ไขงานนี้">
                            - {task.description}
                          </span>
                          <button onClick={() => handleDeleteTask(task.id)} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </td>
                    <td className="border border-black p-3"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {pageIndex === pages.length - 1 && (
            <div className="mt-auto pt-4 flex flex-col text-[18px]">
              <div className="font-bold">ความเห็นผู้ตรวจรับพัสดุ</div>
              <div className="indent-12 mt-2">
                เรื่อง การปฏิบัติงานจ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span>
              </div>
              <div className="indent-[100px] mt-2">- ตรวจสอบแล้ว เป็นไปตามข้อตกลง ครบถ้วนถูกต้อง</div>
              <div className="mt-12 flex flex-col items-center self-end w-[60%] text-center">
                <div>(ลงชื่อ)...........................................................ผู้ตรวจรับพัสดุ</div>
                <div className="mt-2 leading-relaxed">
                  (<span className={editableClass} onClick={() => handleTextClick('inspectorName')}>{docData.inspectorName}</span>)
                </div>
                <div><span className={editableClass} onClick={() => handleTextClick('inspectorPosition')}>{docData.inspectorPosition}</span></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ), [pages, docData]);

  // ==========================================
  // 🧩 RENDER FUNCTIONS
  // ==========================================

  const renderA4Pages = () => (
    <div className="max-w-5xl mx-auto w-full flex-col items-start md:items-center gap-8 flex overflow-x-auto custom-scrollbar pb-8 px-4 md:px-0">
      {pages.map((pageContent, pageIndex) => (
        <div key={pageIndex} className="bg-white w-[210mm] min-h-[297mm] p-[25.4mm] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] shrink-0 font-['TH_SarabunIT๙',_'TH_Sarabun_New',_serif] text-[#1d1d1f] text-[18px] leading-relaxed flex flex-col relative transition-transform hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]">
          {pageIndex === 0 ? (
            <>
              <div className="text-center font-bold text-[20px] mb-2">รายละเอียดประกอบใบตรวจรับพัสดุ</div>
              <div className="text mb-2">
                ประกอบการเบิกจ่ายเงิน จ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม <br />
                ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span>
              </div>
              <div className="w-[38%] ml-auto mb-8">
                <div>เขียนที่สำนักงานเทศบาลตำบลอุโมงค์</div>
                <div>๒๓๔ หมู่ที่ ๕ ตำบลอุโมงค์ อำเภอเมืองลำพูน</div>
                <div>จังหวัดลำพูน ๕๑๑๕๐</div>
              </div>
              <div className="text-justify indent-12 mb-4 leading-[1.8]">
                ตามบันทึกข้อความ ที่ ลพ <span className={editableClass} onClick={() => handleTextClick('docNumber')}>{docData.docNumber}</span>{' '}
                ลงวันที่ <span className={editableClass} onClick={() => handleTextClick('docDay')}>{docData.docDay}</span>{' '}
                เดือน <span className={editableClass} onClick={() => handleTextClick('docMonth')}>{docData.docMonth}</span>{' '}
                พ.ศ. <span className={editableClass} onClick={() => handleTextClick('docYear')}>{docData.docYear}</span>{' '}
                แต่งตั้งผู้ตรวจรับพัสดุ เพื่อทำหน้าที่ตรวจรับงานจ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span> ได้แก่ <span className={editableClass} onClick={() => handleTextClick('inspectorName')}>{docData.inspectorName}</span> ตำแหน่ง <span className={editableClass} onClick={() => handleTextClick('inspectorPosition')}>{docData.inspectorPosition}</span>
              </div>
              <div className="text-justify indent-12 mb-8 leading-[1.8]">
                ผู้รับจ้างได้ปฏิบัติงานให้เป็นไปตามบันทึกข้อตกลงค่าจ้างเหมาบริการ สัญญาเลขที่ <span className={editableClass} onClick={() => handleTextClick('contractNo')}>{docData.contractNo}</span>{' '}
                ลงวันที่ <span className={editableClass} onClick={() => handleTextClick('contractDate')}>{docData.contractDate}</span>{' '}
                ซึ่งผู้รับจ้าง คือ <span className={editableClass} onClick={() => handleTextClick('contractorName')}>{docData.contractorName}</span>{' '}
                ได้ปฏิบัติงานตามบันทึกข้อตกลงจ้างข้างต้น ระหว่างวันที่ <span className={editableClass} onClick={() => handleTextClick('workStartDay')}>{docData.workStartDay}</span>{' '}
                ถึง <span className={editableClass} onClick={() => handleTextClick('workEndDay')}>{docData.workEndDay}</span>{' '}
                <span className={editableClass} onClick={() => handleTextClick('workEndMonth')}>{docData.workEndMonth}</span>{' '}
                <span className={editableClass} onClick={() => handleTextClick('workEndYear')}>{docData.workEndYear}</span> ดังนี้
              </div>
            </>
          ) : (
            <div className="text-center font-bold text-[18px] mb-6">- {toThaiNumber(pageIndex + 1)} -</div>
          )}

          <table className="w-full border-collapse border border-black text-center mt-8 mb-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-2 w-[30%]">วัน/เดือน/ปี</th>
                <th className="border border-black p-2 w-[50%]">งานที่ปฏิบัติ</th>
                <th className="border border-black p-2 w-[20%]">ลายมือชื่อ</th>
              </tr>
            </thead>
            <tbody>
              {pageContent.length === 0 ? (
                <tr>
                  <td colSpan="3" className="border border-black p-4 text-center text-gray-400 italic font-sans text-sm">
                    ยังไม่มีรายการปฏิบัติงาน ลองเพิ่มงานจากกล่องด้านบน
                  </td>
                </tr>
              ) : (
                pageContent.map(({ day, dayTasks }) => (
                  <tr key={day}>
                    <td className="border border-black p-3 align-top">
                      {toThaiNumber(day)} {docData.docMonth} {docData.docYear}
                    </td>
                    <td className="border border-black p-3 text-left align-top">
                      {dayTasks.map((task) => (
                        <div key={task.id} className="relative group pr-10 mb-2 last:mb-0">
                          <span onClick={() => handleTaskClick(task)} className="cursor-pointer hover:text-[#0066cc] hover:bg-[#0066cc]/5 px-1 rounded transition-colors block" title="คลิกเพื่อแก้ไขงานนี้">
                            - {task.description}
                          </span>
                          <button onClick={() => handleDeleteTask(task.id)} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </td>
                    <td className="border border-black p-3"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {pageIndex === pages.length - 1 && (
            <div className="mt-auto pt-4 flex flex-col text-[18px]">
              <div className="font-bold">ความเห็นผู้ตรวจรับพัสดุ</div>
              <div className="indent-12 mt-2">
                เรื่อง การปฏิบัติงานจ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span>
              </div>
              <div className="indent-[100px] mt-2">- ตรวจสอบแล้ว เป็นไปตามข้อตกลง ครบถ้วนถูกต้อง</div>
              <div className="mt-12 flex flex-col items-center self-end w-[60%] text-center">
                <div>(ลงชื่อ)...........................................................ผู้ตรวจรับพัสดุ</div>
                <div className="mt-2 leading-relaxed">
                  (<span className={editableClass} onClick={() => handleTextClick('inspectorName')}>{docData.inspectorName}</span>)
                </div>
                <div><span className={editableClass} onClick={() => handleTextClick('inspectorPosition')}>{docData.inspectorPosition}</span></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSidebar = () => (
    <>
      {isSidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* 🔴 ปรับความกว้าง Sidebar บนคอมให้กินพื้นที่แค่ 30% (สูงสุดไม่เกิน 450px) */}
      <div className={`fixed top-0 left-0 h-full w-[85vw] md:w-[30%] max-w-[450px] bg-white/95 backdrop-blur-2xl border-r border-[#e0e0e0] shadow-[20px_0_40px_rgba(0,0,0,0.1)] z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pt-[60px] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>        <div className="h-full flex flex-col">

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

  // 3. โซนสำหรับ Desktop (ลบการดันหน้าจอออก เอกสารจะอยู่ตรงกลางเสมอ)
  const renderDesktopView = () => (
    // 🔴 สั่งดันหน้าจอ 30% เวลาเปิด Sidebar และตัวเนื้อหาจะปรับกึ่งกลางของพื้นที่ที่เหลือแบบอัตโนมัติ
    <div className={`w-full transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'md:pl-[30%]' : 'pl-0'}`}>

      <div className="pt-[140px] pb-[80px] px-8 flex flex-col items-center w-full relative z-20">
        <h1 className="text-[56px] font-bold tracking-tight mb-8 text-black drop-shadow-lg text-center">บันทึกงานประจำวัน</h1>

        <div className="max-w-3xl w-full mx-auto mb-4 relative z-20">
          <div className="bg-white/30 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/50 p-1.5 flex items-center">

            <div className="relative flex-none w-[140px] h-[44px] flex items-center pl-4 border-r border-white/40 font-medium text-[#1d1d1f] hover:bg-white/20 transition-colors rounded-l-full cursor-pointer" onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}>
              <span className="truncate w-full">{taskInput.day ? `วันที่ ${taskInput.day}` : 'เลือกวันที่...'}</span>
              {isDateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30 cursor-default" onClick={(e) => { e.stopPropagation(); setIsDateMenuOpen(false); }}></div>
                  <div className="absolute top-[120%] left-0 w-[220px] max-h-[300px] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-40 p-2 flex flex-col gap-1 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                    <div onClick={() => { setTaskInput({ ...taskInput, day: '' }); setIsDateMenuOpen(false); }} className="px-3 py-2 hover:bg-gray-100/50 rounded-xl cursor-pointer text-sm text-center text-gray-500">-- ยกเลิก --</div>
                    {Array.from({ length: getDaysInMonth(docData.docMonth, docData.docYear) }, (_, i) => {
                      const dayNum = i + 1; const isHoliday = isWeekend(dayNum, docData.docMonth, docData.docYear); const dayName = getThaiDayName(dayNum, docData.docMonth, docData.docYear); const isSelected = taskInput.day == dayNum;
                      return (
                        <div key={dayNum} onClick={() => { setTaskInput({ ...taskInput, day: dayNum }); setIsDateMenuOpen(false); }} className={`px-3 py-2.5 rounded-xl cursor-pointer text-[15px] transition-all flex justify-between items-center ${isSelected ? 'bg-[#1d1d1f] text-white shadow-md' : 'hover:bg-white/60 text-[#1d1d1f]'}`}>
                          <span className={isHoliday && !isSelected ? 'text-[#e63946]' : ''}>วันที่ {dayNum} ({dayName})</span>
                          {isHoliday && <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#e63946]'}`}></span>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <input type="text" value={taskInput.description || ''} onChange={(e) => setTaskInput({ ...taskInput, description: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="รายละเอียดงานที่ปฏิบัติ..." className="flex-1 bg-transparent px-5 py-3 outline-none text-[#1d1d1f] placeholder-gray-700/70 text-[17px]" />
            <button onClick={handleAddTask} className="flex-none bg-[#1d1d1f] text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-black transition-colors"><Plus size={18} /> Add</button>
          </div>
          <div className="flex justify-end mt-4"><button onClick={handleNewMonth} className="text-white hover:text-red-200 text-[14px] flex items-center gap-1.5 transition-colors drop-shadow-md"><RefreshCcw size={14} /> ล้างตารางงาน (เริ่มเดือนใหม่)</button></div>
        </div>
      </div>

      {/* 🔴 ใช้ตัวแปร memoizedA4Pages ที่จำไว้แล้ว แทนการเรนเดอร์ใหม่ */}
      <main className="relative z-10 bg-[#fdfdfd] rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] min-h-screen pt-16 pb-24 px-8 w-full flex flex-col items-center">
        {memoizedA4Pages}
      </main>
    </div>
  );

  const renderMobileView = () => (
    <div className="w-full flex flex-col">
      <div className="pt-[100px] pb-[40px] px-4 flex flex-col items-center w-full relative z-20">
        <h1 className="text-[32px] font-bold tracking-tight mb-6 text-black drop-shadow-md text-center">บันทึกงานประจำวัน</h1>
        <div className="w-full max-w-[500px] mx-auto">
          <div className="bg-white/30 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/50 p-1.5 flex items-center gap-2 relative z-10">
            <div className="relative flex-none w-10 h-10 bg-white/70 rounded-full flex items-center justify-center font-bold text-[#1d1d1f]">
              {taskInput.day || '?'}
              <select value={taskInput.day || ''} onChange={(e) => setTaskInput({ ...taskInput, day: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <option value="">?</option>
                {Array.from({ length: getDaysInMonth(docData.docMonth, docData.docYear) }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
              </select>
            </div>
            <input type="text" value={taskInput.description || ''} onChange={(e) => setTaskInput({ ...taskInput, description: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="รายละเอียดงาน..." className="flex-1 bg-transparent px-2 py-2 outline-none text-[#1d1d1f] placeholder-gray-700/70 text-[16px] min-w-0" />
            <button onClick={handleAddTask} className="flex-none bg-[#1d1d1f] text-white w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"><Plus size={18} /></button>
          </div>
          <div className="flex justify-end mt-4"><button onClick={handleNewMonth} className="text-white bg-black/20 px-4 py-1.5 rounded-full text-[13px] flex items-center gap-1.5"><RefreshCcw size={14} /> เริ่มเดือนใหม่</button></div>
        </div>
      </div>

      <main className="relative z-10 bg-[#fdfdfd] rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] min-h-screen pt-8 pb-24 w-full">
        <div className="px-4 max-w-[500px] mx-auto mb-6">
          <button onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)} className="w-full bg-white border border-[#e0e0e0] shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-[#1d1d1f] px-6 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 text-[15px]">
            {isMobilePreviewOpen ? (<><List size={18} /> กลับไปแก้ไขรายการ</>) : (<><FileText size={18} /> 👀 ดูตัวอย่างเอกสาร (A4)</>)}
          </button>
        </div>

        {!isMobilePreviewOpen ? (
          <div className="px-4 max-w-[500px] mx-auto flex flex-col gap-3">
            <div className="text-center text-gray-500 text-[14px] font-medium mb-1">-- รายการงานทั้งหมด --</div>
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
        ) : (
          memoizedA4Pages
        )}
      </main>
    </div>
  );

  // ==========================================
  // 🏁 MAIN RENDER
  // ==========================================
  if (isMobile === null) return null;

  return (
    <div className="min-h-screen text-[#1d1d1f] font-sans overflow-x-hidden selection:bg-[#0066cc] selection:text-white" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

      {/* 🔴 Navbar: ทับอยู่สูงสุด (Z-70) */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md text-white h-[44px] flex items-center px-4 md:px-8 text-xs tracking-wide z-[70]">
        <span className="font-semibold">Smart Work Log -</span>
      </nav>

      {renderSidebar()}

      {/* 🔴 ปุ่มเปิด Sidebar: อยู่ด้านล่าง Sidebar (Z-40) */}
      <button onClick={() => setIsSidebarOpen(true)} className={`fixed left-0 top-[100px] z-[40] bg-white shadow-md border border-[#e0e0e0] border-l-0 p-3 rounded-r-xl text-[#1d1d1f] flex items-center gap-2 transition-transform duration-300 ${isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        <Settings2 size={20} /><span className="font-medium text-sm pr-1">เครื่องมือ</span><ChevronRight size={16} className="text-gray-400" />
      </button>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* 🔴 ปุ่ม Export ลอยตัว (Desktop) ซ่อนตัวเมื่อเปิด Sidebar (Z-40) */}
      {!isMobile && (
        <div className="fixed bottom-8 right-8 z-[40]">
          <button onClick={handleExportWord} className="bg-gradient-to-r from-[#1d1d1f] to-[#3a3a3c] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-[17px] font-medium border border-white/20 backdrop-blur-md">
            <Download size={20} /> Export to Word
          </button>
        </div>
      )}

    </div>
  );
}

export default App;