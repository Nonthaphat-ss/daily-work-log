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
        color: '#a855f7', // Electric Purple (ม่วงนีออน)
        center: [-28, 8, -6],
        description: 'ขั้นตอนและกระบวนการปฏิบัติงาน'
    },
    {
        id: 'cat-tech',
        name: 'Technical',
        color: '#8b5cf6', // Violet (ม่วงอมน้ำเงิน)
        center: [-16, -14, 10],
        description: 'องค์ความรู้ทางเทคนิคและโค้ดดิ้ง'
    },
    {
        id: 'cat-trouble',
        name: 'Troubleshooting',
        color: '#2dd4bf', // Teal (เขียวอมฟ้า)
        center: [16, -12, -8],
        description: 'การแก้ปัญหาและแนวทางรับมือ'
    },
    {
        id: 'cat-exp',
        name: 'Experience',
        color: '#10b981', // Emerald (เขียวมรกต)
        center: [30, 10, 6],
        description: 'บันทึกบทเรียนและประสบการณ์'
    }
];

export const GALAXY_SETTINGS = {
    cameraDistance: 65,
    minNodeSize: 0.8,
    maxNodeSize: 2.5,
    contentLengthDivisor: 500,
    linkOpacity: 0.22,
    background: '#000000'
};