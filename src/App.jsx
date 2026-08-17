import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
const MainCarousel = lazy(() => import('./pages/MainCarousel'));
const WorkLog = lazy(() => import('./pages/WorkLog'));
const Notes = lazy(() => import('./pages/Notes'));

export default function App() {
  return (
    // Suspense เอาไว้แสดงข้อความหรือไอคอนโหลดสำรอง ระหว่างที่รอดึงไฟล์หน้าใหม่
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] text-gray-400 font-sans text-sm">
        กำลังโหลด...
      </div>
    }>
      <Routes>
        <Route path="/" element={<MainCarousel />} />
        <Route path="/work-log" element={<WorkLog />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </Suspense>
  );
}