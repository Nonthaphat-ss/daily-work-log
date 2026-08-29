export const DEFAULT_CATEGORIES = [
    {
        id: 'cat-core',
        name: 'Core System',
        color: '#00f2fe', // Bright Cyan (ฟ้าสว่างจ้าตรงกลาง)
        center: [0, 0, 0],
        description: 'ศูนย์กลางสถาปัตยกรรมและโครงสร้างหลัก'
    },
    {
        id: 'cat-proc',
        name: 'Procedures',
        color: '#9333ea', // Electric Purple (ม่วงนีออน)
        center: [-18, 5, -4], // 👈 ดึงให้เข้ามาใกล้กันมากขึ้น
        description: 'ขั้นตอนและกระบวนการปฏิบัติงาน'
    },
    {
        id: 'cat-tech',
        name: 'Technical',
        color: '#3b82f6', // Electric Blue (น้ำเงินคราม)
        center: [-10, -10, 6], // 👈 ดึงให้เข้ามาใกล้กันมากขึ้น
        description: 'องค์ความรู้ทางเทคนิคและโค้ดดิ้ง'
    },
    {
        id: 'cat-trouble',
        name: 'Troubleshooting',
        color: '#06b6d4', // Teal (เขียวอมฟ้า)
        center: [10, -8, -5], // 👈 ดึงให้เข้ามาใกล้กันมากขึ้น
        description: 'การแก้ปัญหาและแนวทางรับมือ'
    },
    {
        id: 'cat-exp',
        name: 'Experience',
        color: '#10b981', // Emerald (เขียวมรกต)
        center: [18, 6, 4], // 👈 ดึงให้เข้ามาใกล้กันมากขึ้น
        description: 'บันทึกบทเรียนและประสบการณ์'
    }
];

export const GALAXY_SETTINGS = {
    cameraDistance: 65,
    minNodeSize: 0.7,
    maxNodeSize: 2.2,
    contentLengthDivisor: 500,
    linkOpacity: 0.35, // ปรับความเข้มของเส้นให้พอดิบพอดี
    background: '#000000'
};