export const toThaiNumber = (numStr) => {
    if (!numStr) return '';
    const thaiNums = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    return numStr.toString().replace(/\d/g, (d) => thaiNums[d]);
};

export const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const currentDate = new Date();
export const currentMonth = thaiMonths[currentDate.getMonth()];
export const currentYear = toThaiNumber(currentDate.getFullYear() + 543);

export const getDaysInMonth = (monthName, yearThai) => {
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

export const isWeekend = (day, monthName, yearThai) => {
    const monthIndex = thaiMonths.indexOf(monthName);
    if (monthIndex === -1) return false;
    const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
    const yearCE = parseInt(cleanYear) - 543;
    const date = new Date(yearCE, monthIndex, parseInt(day));
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
};

export const getThaiDayName = (day, monthName, yearThai) => {
    const monthIndex = thaiMonths.indexOf(monthName);
    if (monthIndex === -1) return '';
    const cleanYear = yearThai.toString().replace(/[๐-๙]/g, d => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d));
    const yearCE = parseInt(cleanYear) - 543;
    const date = new Date(yearCE, monthIndex, parseInt(day));
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    return days[date.getDay()];
};