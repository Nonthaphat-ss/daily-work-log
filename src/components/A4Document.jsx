import { Trash2 } from 'lucide-react';
import { toThaiNumber } from '../utils/dateUtils';

export default function A4Document({
    pages,
    docData,
    handleTextClick,
    handleTaskClick,
    handleDeleteTask,
    currentPage = 0 // 🔴 รับตัวแปรหน้าปัจจุบันมา
}) {
    const editableClass = "whitespace-nowrap bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.05)] px-2 py-0.5 rounded-lg cursor-pointer hover:bg-white/70 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-300 text-[#0066cc] font-medium";

    // ป้องกัน Error กรณีตารางว่างเปล่า
    const safePageIndex = Math.max(0, Math.min(currentPage, pages.length - 1));
    const pageContent = pages[safePageIndex] || [];
    const pageIndex = safePageIndex;

    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[25.4mm] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] font-['TH_SarabunIT๙',_'TH_Sarabun_New',_serif] text-[#1d1d1f] text-[18px] leading-relaxed flex flex-col relative transition-transform">
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
                                    {toThaiNumber(day)} {docData.reportMonth}
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

            {pageIndex === Math.max(0, pages.length - 1) && (
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
    );
}