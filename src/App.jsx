import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useState, useEffect } from 'react';
// แก้บั๊กที่ 1: เพิ่ม Trash2 เข้ามาในบรรทัดนี้แล้วครับ
import { Plus, Download, Settings2, X, ChevronRight, Edit3, Trash2, RefreshCcw } from 'lucide-react';
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
// 1. ฟังก์ชันหาจำนวนวันในแต่ละเดือน (เช็คปี พ.ศ. เพื่อคำนวณกุมภาพันธ์ให้ด้วย)
const getDaysInMonth = (monthName, yearThai) => {
  const months30 = ['เมษายน', 'มิถุนายน', 'กันยายน', 'พฤศจิกายน'];
  if (months30.includes(monthName)) return 30;

  if (monthName === 'กุมภาพันธ์') {
    // แปลงปี พ.ศ. เลขไทยกลับเป็นเลขอารบิกเพื่อคำนวณ ค.ศ.
    const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
    const yearCE = parseInt(cleanYear) - 543;
    const isLeap = (yearCE % 4 === 0 && yearCE % 100 !== 0) || (yearCE % 400 === 0);
    return isLeap ? 29 : 28;
  }
  return 31;
};

// 2. ฟังก์ชันเช็คว่าเป็นวันหยุดเสาร์-อาทิตย์ไหม
const isWeekend = (day, monthName, yearThai) => {
  const monthIndex = thaiMonths.indexOf(monthName);
  if (monthIndex === -1) return false;
  const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
  const yearCE = parseInt(cleanYear) - 543;

  const date = new Date(yearCE, monthIndex, parseInt(day));
  const dayOfWeek = date.getDay(); // 0 = อาทิตย์, 6 = เสาร์
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// 3. ฟังก์ชันดึงชื่อวัน (จันทร์-อาทิตย์)
const getThaiDayName = (day, monthName, yearThai) => {
  const monthIndex = thaiMonths.indexOf(monthName);
  if (monthIndex === -1) return '';
  const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
  const yearCE = parseInt(cleanYear) - 543;

  const date = new Date(yearCE, monthIndex, parseInt(day));
  const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  return days[date.getDay()];
};
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. เก็บข้อมูลทุกจุด (ตั้งค่าให้เช็คความจำเดิมก่อน ถ้าไม่มีค่อยใช้ค่าเริ่มต้น)
  const [docData, setDocData] = useState(() => {
    const savedDocData = localStorage.getItem('smartWorkLog_docData');
    if (savedDocData) return JSON.parse(savedDocData); // ถ้าเคยเซฟไว้ ให้ดึงมาใช้

    // ถ้าไม่มีข้อมูล ให้ใช้ค่าเริ่มต้น
    return {
      reportMonth: `${currentMonth} ${currentYear}`,
      docNumber: 'xxxx/xxx',
      docDay: 'xx',
      docMonth: currentMonth,
      docYear: currentYear,
      inspectorName: 'ชื่อผู้ตรวจ',
      inspectorPosition: 'ตำแหน่งผู้ตรวจ',
      contractNo: 'CNTR-xxxxx/xx',
      contractDate: `xx xxx ${currentYear}`,
      contractorName: '(ชื่อผู้รับจ้าง)',
      workStartDay: 'x',
      workEndDay: 'วันที่',
      workEndMonth: 'เดือน',
      workEndYear: currentYear,
    };
  });

  const [activeField, setActiveField] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const fieldLabels = {
    reportMonth: 'ประจำเดือน (ส่วนหัว)',
    docNumber: 'เลขที่บันทึกข้อความ (ลพ)',
    docDay: 'วันที่ลงบันทึก',
    docMonth: 'เดือนที่ลงบันทึก',
    docYear: 'ปีที่ลงบันทึก (พ.ศ.)',
    inspectorName: 'ชื่อผู้ตรวจรับพัสดุ',
    inspectorPosition: 'ตำแหน่งผู้ตรวจรับพัสดุ',
    contractNo: 'สัญญาเลขที่',
    contractDate: 'วันที่ลงสัญญา',
    contractorName: 'ชื่อผู้รับจ้าง',
    workStartDay: 'วันที่เริ่มงาน',
    workEndDay: 'วันที่สิ้นสุดงาน',
    workEndMonth: 'เดือนที่ปฏิบัติงาน',
    workEndYear: 'ปีที่ปฏิบัติงาน',
  };

  const handleTextClick = (fieldName) => {
    setActiveField(fieldName);
    setEditingTaskId(null); // ล้างค่าแก้ไขงานตาราง
    setIsSidebarOpen(true);
  };

  const handleTaskClick = (task) => {
    setEditingTaskId(task.id); // จำแค่ ID ของงานที่คลิก
    setActiveField(null);
    setIsSidebarOpen(true);
  };

  const handleInputChange = (e) => {
    setDocData({
      ...docData,
      [activeField]: e.target.value
    });
  };

  // ---------------------------------------------------------
  // โซนระบบตารางงาน (Task System)
  // ---------------------------------------------------------

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('smartWorkLog_tasks');
    if (savedTasks) return JSON.parse(savedTasks);
    return [];
  });

  // กำหนดค่าเริ่มต้นให้ชัดเจน เพื่อกัน Error uncontrolled input
  const [taskInput, setTaskInput] = useState({
    day: new Date().getDate().toString(), // ล็อกวันปัจจุบันตั้งแต่เริ่ม
    description: ''
  });

  const handleAddTask = () => {
    if (taskInput.day && taskInput.description) {
      setTasks([...tasks, {
        id: Date.now(),
        day: taskInput.day,
        description: taskInput.description
      }]);
      // ล้างช่องกรอก แต่เก็บวันที่ไว้ เผื่อเพิ่มงานวันเดียวกันหลายข้อ
      setTaskInput({ ...taskInput, description: '' });
    }
  };

  const handleNewMonth = () => {
    // มี Popup ถามเพื่อความชัวร์ ป้องกันการเผลอกดโดน
    if (window.confirm('คุณต้องการล้างตารางงานทั้งหมด เพื่อเริ่มเดือนใหม่ใช่หรือไม่?\n(ข้อมูลชื่อ ตำแหน่ง และสัญญาจะยังคงอยู่เหมือนเดิม)')) {
      setTasks([]); // สั่งเคลียร์งานในตารางให้เป็น 0
    }
  };

  const handleDeleteTask = (idToDelete) => {
    setTasks(tasks.filter(task => task.id !== idToDelete));
  };

  const editableClass = "text-[#0066cc] bg-[#0066cc]/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-[#0066cc]/20 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-[#0066cc]/30";

  const groupedTasks = tasks
    .sort((a, b) => Number(a.day) - Number(b.day))
    .reduce((acc, task) => {
      if (!acc[task.day]) acc[task.day] = [];
      acc[task.day].push(task);
      return acc;
    }, {});

  // 2. ลอจิกแบ่งหน้า (กะจำนวนแถวที่ใส่ได้ในแต่ละหน้า)
  const MAX_LINES_PAGE_1 = 8;  // หน้าแรกมีหัวกระดาษเยอะ เลยใส่ได้น้อย
  const MAX_LINES_PAGE_N = 18; // หน้าที่สองเป็นต้นไป ใส่ได้เยอะขึ้น

  const pages = [];
  let currentPageRows = [];
  let currentLinesCount = 0;

  const entries = Object.entries(groupedTasks);

  if (entries.length === 0) {
    pages.push([]); // ถ้าไม่มีงานเลย ก็ให้มีหน้า 1 ว่างๆ ไว้
  } else {
    entries.forEach(([day, dayTasks]) => {
      const lineWeight = dayTasks.length || 1; // นับจำนวนงานในวันนั้น (1 งาน = 1 บรรทัดโดยประมาณ)
      const isPage1 = pages.length === 0;
      const maxAllowed = isPage1 ? MAX_LINES_PAGE_1 : MAX_LINES_PAGE_N;

      // ถ้าเพิ่มงานวันนี้เข้าไปแล้วล้นหน้า ให้ตัดขึ้นหน้าใหม่
      if (currentLinesCount + lineWeight > maxAllowed && currentPageRows.length > 0) {
        pages.push(currentPageRows);
        currentPageRows = [];
        currentLinesCount = 0;
      }

      currentPageRows.push({ day, dayTasks });
      currentLinesCount += lineWeight;
    });
    // เก็บงานก้อนสุดท้ายเข้าหน้าสุดท้าย
    if (currentPageRows.length > 0) {
      pages.push(currentPageRows);
    }
  }
  // ---------------------------------------------------------
  // ลอจิก Export to Word
  // ---------------------------------------------------------
  const handleExportWord = async () => {
    try {
      // 1. โหลดไฟล์ Template ต้นฉบับจากโฟลเดอร์ public
      const response = await fetch('/template.docx');
      if (!response.ok) throw new Error('ไม่พบไฟล์ template.docx ในโฟลเดอร์ public');

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // 2. ใช้ PizZip อ่านไฟล์
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // 3. เตรียมข้อมูลตาราง (เรียงวันที่ และแปลงเป็นเลขไทยให้พร้อมก่อนส่งเข้า Word)
      const exportTasks = tasks
        .sort((a, b) => Number(a.day) - Number(b.day))
        .map(task => ({
          dayThai: toThaiNumber(task.day),
          description: task.description
        }));

      // 4. สั่งแทนที่ตัวแปรทั้งหมดในไฟล์ Word
      doc.render({
        ...docData, // ใส่ข้อมูลหัวกระดาษและลายเซ็นทั้งหมด
        tasks: exportTasks // ใส่ข้อมูลตาราง
      });

      // 5. สร้างไฟล์และดาวน์โหลดลงเครื่อง
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // ตั้งชื่อไฟล์ที่จะโหลด เช่น "บันทึกงาน_มิถุนายน ๒๕๖๙.docx"
      saveAs(out, `บันทึกงาน_${docData.reportMonth}.docx`);

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: โปรดตรวจสอบว่ามีไฟล์ template.docx อยู่ในโฟลเดอร์ public แล้ว');
    }
  };
  // ---------------------------------------------------------
  // ระบบ Auto-Save (Local Storage)
  // ---------------------------------------------------------

  // 1. ดึงข้อมูลที่เคยเซฟไว้กลับมาแสดงตอนเปิดเว็บใหม่
  useEffect(() => {
    const savedDocData = localStorage.getItem('smartWorkLog_docData');
    const savedTasks = localStorage.getItem('smartWorkLog_tasks');

    if (savedDocData) {
      setDocData(JSON.parse(savedDocData));
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // เซฟข้อมูลหัวกระดาษอัตโนมัติ ทุกครั้งที่มีการแก้ไข
  useEffect(() => {
    localStorage.setItem('smartWorkLog_docData', JSON.stringify(docData));
  }, [docData]);

  // เซฟข้อมูลตารางงานอัตโนมัติ ทุกครั้งที่มีการเพิ่มหรือลบงาน
  useEffect(() => {
    localStorage.setItem('smartWorkLog_tasks', JSON.stringify(tasks));
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans overflow-x-hidden selection:bg-[#0066cc] selection:text-white">

      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md text-white h-[44px] flex items-center px-4 md:px-8 text-xs tracking-wide z-50">
        <span className="font-semibold">Smart Work Log -</span>
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-[320px] bg-white/80 backdrop-blur-2xl border-r border-[#e0e0e0] shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-40 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pt-[60px] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[21px] font-semibold tracking-tight">เครื่องมือแก้ไข</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-[#1d1d1f]"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-[#7a7a7a] text-[14px] mb-6 leading-relaxed">
            คลิกที่ข้อความสีฟ้าบนเอกสารเพื่อทำการแก้ไขข้อมูลของเดือนนี้
          </p>

          {editingTaskId ? (
            <div className="bg-white p-5 rounded-[14px] border border-[#0066cc]/30 shadow-[0_4px_15px_rgba(0,102,204,0.08)] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-3 text-[#0066cc]">
                <Edit3 size={16} />
                <span className="font-semibold text-sm">
                  แก้ไขรายการงาน (วันที่ {toThaiNumber(tasks.find(t => t.id === editingTaskId)?.day)})
                </span>
              </div>
              <textarea
                value={tasks.find(t => t.id === editingTaskId)?.description || ''}
                onChange={(e) => {
                  const updatedDesc = e.target.value;
                  setTasks(tasks.map(t =>
                    t.id === editingTaskId ? { ...t, description: updatedDesc } : t
                  ));
                }}
                className="w-full border border-[#e0e0e0] rounded-lg px-4 py-3 bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white text-[15px] transition-all min-h-[100px]"
                placeholder="พิมพ์แก้ไขรายละเอียดงาน..."
                autoFocus
              />
              <button
                onClick={() => setEditingTaskId(null)}
                className="mt-3 w-full bg-[#0066cc] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#0071e3] transition-colors"
              >
                เสร็จสิ้น
              </button>
            </div>
          ) : activeField ? (
            <div className="bg-white p-5 rounded-[14px] border border-[#0066cc]/30 shadow-[0_4px_15px_rgba(0,102,204,0.08)] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-3 text-[#0066cc]">
                <Edit3 size={16} />
                <span className="font-semibold text-sm">{fieldLabels[activeField]}</span>
              </div>
              <input
                type="text"
                value={docData[activeField] || ''}
                onChange={handleInputChange}
                className="w-full border border-[#e0e0e0] rounded-lg px-4 py-3 bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white text-[15px] transition-all"
                placeholder="พิมพ์ข้อความที่นี่..."
                autoFocus
              />
            </div>
          ) : (
            <div className="flex-1 p-5 bg-[#f5f5f7] rounded-[11px] border border-[#e0e0e0] border-dashed flex items-center justify-center text-[#7a7a7a] text-sm">
              เลือกข้อความบนเอกสารหรือรายการงานเพื่อเริ่มแก้ไข
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed left-0 top-[100px] z-30 bg-white shadow-[4px_4px_15px_rgba(0,0,0,0.08)] border border-[#e0e0e0] border-l-0 p-3 rounded-r-xl text-[#1d1d1f] hover:text-[#0066cc] transition-all duration-300 flex items-center gap-2 ${isSidebarOpen ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <Settings2 size={20} />
        <span className="font-medium text-sm pr-1">เครื่องมือ</span>
        <ChevronRight size={16} className="text-gray-400" />
      </button>

      <main className="pt-[80px] pb-24 px-4 md:px-8 max-w-[1440px] mx-auto transition-all duration-500"
        style={{ paddingLeft: isSidebarOpen ? '340px' : '32px' }}
      >
        <h1 className="text-[40px] font-semibold tracking-tight mb-8 text-center transition-all">บันทึกงานประจำวัน</h1>

        {/* Quick Entry Panel (เชื่อมกับระบบ Add Task แล้ว) */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/80 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#e0e0e0] flex items-center p-1.5 transition-all focus-within:shadow-[0_4px_20px_rgba(0,102,204,0.15)] focus-within:border-[#0066cc]/30">
            <select
              value={taskInput.day || ''}
              onChange={(e) => setTaskInput({ ...taskInput, day: e.target.value })}
              className="bg-transparent pl-5 pr-4 py-3 outline-none text-[#1d1d1f] border-r border-[#e0e0e0] cursor-pointer appearance-none hover:bg-gray-50/50 rounded-l-full transition-colors text-[17px]"
            >
              <option value="">เลือกวันที่...</option>
              {Array.from({ length: getDaysInMonth(docData.docMonth, docData.docYear) }, (_, i) => {
                const dayNum = i + 1;
                const isHoliday = isWeekend(dayNum, docData.docMonth, docData.docYear);
                const dayName = getThaiDayName(dayNum, docData.docMonth, docData.docYear);

                return (
                  <option
                    key={dayNum}
                    value={dayNum}
                    style={{ color: isHoliday ? '#e63946' : '#1d1d1f' }}
                  >
                    วันที่ {dayNum} ({dayName}) {isHoliday ? ' 🔴 (วันหยุด)' : ''}
                  </option>
                );
              })}
            </select>
            <input
              type="text"
              value={taskInput.description || ''}
              onChange={(e) => setTaskInput({ ...taskInput, description: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="รายละเอียดงานที่ปฏิบัติ..."
              className="flex-1 bg-transparent px-5 py-3 outline-none text-[#1d1d1f] placeholder-[#7a7a7a] text-[17px]"
            />
            <button
              onClick={handleAddTask}
              className="bg-[#0066cc] text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-[#0071e3] transition-colors shrink-0"
            >
              <Plus size={18} /> Add to
            </button>
          </div>

          {/* ปุ่มขึ้นเดือนใหม่ (เพิ่มเข้ามาใหม่ตรงนี้ครับ) */}
          <div className="flex justify-end mt-4 px-4">
            <button
              onClick={handleNewMonth}
              className="text-[#e63946] hover:text-red-700 text-[14px] flex items-center gap-1.5 transition-colors opacity-70 hover:opacity-100"
            >
              <RefreshCcw size={14} /> ล้างตารางงาน (เริ่มเดือนใหม่)
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full px-2 md:px-0 bg-[#f5f5f7]/80 backdrop-blur-3xl rounded-[24px] p-6 md:p-10 shadow-inner border border-white overflow-x-auto flex flex-col items-center gap-8">

          {/* วนลูปสร้างกระดาษ A4 ตามจำนวนหน้าที่มี */}
          {pages.map((pageContent, pageIndex) => (
            <div
              key={pageIndex}
              className="bg-white w-[210mm] min-h-[297mm] p-[25.4mm] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] shrink-0 font-['TH_SarabunIT๙',_'TH_Sarabun_New',_serif] text-[#1d1d1f] text-[18px] leading-relaxed flex flex-col relative transition-transform hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]"
            >

              {/* ตรวจสอบว่าเป็นหน้าแรก หรือหน้าถัดไป */}
              {pageIndex === 0 ? (
                // --- ส่วนนี้คือ Format หน้าแรกของน้า (เหมือนเดิม 100%) ---
                <>
                  <div className="text-center font-bold text-[20px] mb-2">
                    รายละเอียดประกอบใบตรวจรับพัสดุ
                  </div>
                  <div className="text mb-2">
                    ประกอบการเบิกจ่ายเงิน จ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม <br></br>
                    ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span>
                  </div>

                  <div className="w-[38%] ml-auto mb-8">
                    <div>เขียนที่สำนักงานเทศบาลตำบลอุโมงค์</div>
                    <div>๒๓๔ หมู่ที่ ๕ ตำบลอุโมงค์ อำเภอเมืองลำพูน</div>
                    <div>จังหวัดลำพูน ๕๑๑๕๐</div>
                  </div>

                  <div className="text-justify indent-12 mb-4">
                    ตามบันทึกข้อความ ที่ ลพ <span className={editableClass} onClick={() => handleTextClick('docNumber')}>{docData.docNumber}</span>
                    {' '}ลงวันที่ <span className={editableClass} onClick={() => handleTextClick('docDay')}>{docData.docDay}</span>
                    {' '}เดือน <span className={editableClass} onClick={() => handleTextClick('docMonth')}>{docData.docMonth}</span>
                    {' '}พ.ศ. <span className={editableClass} onClick={() => handleTextClick('docYear')}>{docData.docYear}</span>
                    {' '}แต่งตั้งผู้ตรวจรับพัสดุ เพื่อทำหน้าที่ตรวจรับงานจ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span> ได้แก่ <span className={editableClass} onClick={() => handleTextClick('inspectorName')}>{docData.inspectorName}</span> ตำแหน่ง <span className={editableClass} onClick={() => handleTextClick('inspectorPosition')}>{docData.inspectorPosition}</span>
                  </div>

                  <div className="text-justify indent-12 mb-8">
                    ผู้รับจ้างได้ปฏิบัติงานให้เป็นไปตามบันทึกข้อตกลงค่าจ้างเหมาบริการ สัญญาเลขที่ <span className={editableClass} onClick={() => handleTextClick('contractNo')}>{docData.contractNo}</span>
                    {' '}ลงวันที่ <span className={editableClass} onClick={() => handleTextClick('contractDate')}>{docData.contractDate}</span>
                    {' '}ซึ่งผู้รับจ้าง คือ <span className={editableClass} onClick={() => handleTextClick('contractorName')}>{docData.contractorName}</span>
                    {' '}ได้ปฏิบัติงานตามบันทึกข้อตกลงจ้างข้างต้น ระหว่างวันที่ <span className={editableClass} onClick={() => handleTextClick('workStartDay')}>{docData.workStartDay}</span>
                    {' '}ถึง <span className={editableClass} onClick={() => handleTextClick('workEndDay')}>{docData.workEndDay}</span>
                    {' '}<span className={editableClass} onClick={() => handleTextClick('workEndMonth')}>{docData.workEndMonth}</span>
                    {' '}<span className={editableClass} onClick={() => handleTextClick('workEndYear')}>{docData.workEndYear}</span> ดังนี้
                  </div>
                </>
              ) : (
                // --- หน้าที่ 2 เป็นต้นไป ให้โชว์แค่เลขหน้า ---
                <div className="text-center font-bold text-[18px] mb-6">
                  - {toThaiNumber(pageIndex + 1)} -
                </div>
              )}

              {/* ส่วนตารางของน้า (เปลี่ยนตัวแปรลูปนิดหน่อย เพื่อให้ตรงกับหน้า) */}
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
                        {/* ช่องรายละเอียดงาน (ปรับให้คลิกเพื่อแก้ไขข้อความได้แล้ว) */}
                        <td className="border border-black p-3 text-left align-top">
                          {dayTasks.map((task) => (
                            <div key={task.id} className="relative group pr-10 mb-2 last:mb-0">
                              {/* ครอบข้อความงานด้วย tag span และใส่สไตล์ให้กดได้เหมือนหัวกระดาษ */}
                              <span
                                onClick={() => handleTaskClick(task)}
                                className="cursor-pointer hover:text-[#0066cc] hover:bg-[#0066cc]/5 px-1 rounded transition-colors block"
                                title="คลิกเพื่อแก้ไขงานนี้"
                              >
                                - {task.description}
                              </span>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                title="ลบงานนี้"
                              >
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

              {/* ส่วนลายเซ็น จะโผล่มาเฉพาะ "หน้าสุดท้าย" เท่านั้น */}
              {pageIndex === pages.length - 1 && (
                <div className="mt-auto pt-4 flex flex-col text-[18px]">
                  <div className="font-bold">ความเห็นผู้ตรวจรับพัสดุ</div>
                  <div className="indent-12 mt-2">
                    เรื่อง การปฏิบัติงานจ้างเหมาบริการ เพื่อช่วยปฏิบัติงานสุขาภิบาลและอนามัยสิ่งแวดล้อม ประจำเดือน <span className={editableClass} onClick={() => handleTextClick('reportMonth')}>{docData.reportMonth}</span>
                  </div>
                  <div className="indent-[100px] mt-2">
                    - ตรวจสอบแล้ว เป็นไปตามข้อตกลง ครบถ้วนถูกต้อง
                  </div>
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
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        {/* ปุ่ม Export (ย่อขนาดลงนิดนึงบนมือถือ) */}
        <div className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50">
          <button
            onClick={handleExportWord}
            className="bg-gradient-to-r from-[#0066cc] to-[#0071e3] text-white px-5 md:px-6 py-3 md:py-4 rounded-full shadow-[0_10px_30px_rgba(0,102,204,0.3)] flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-[15px] md:text-[17px] font-medium border border-white/20 backdrop-blur-md"
          >
            <Download size={20} /> <span className="hidden md:inline">Export to Word</span><span className="md:hidden">Export</span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;