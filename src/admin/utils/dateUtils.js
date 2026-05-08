/**
 * utils/dateUtils.js
 * ฟังก์ชัน helper เกี่ยวกับวันที่และเวลา (timezone Asia/Bangkok)
 */

/** คืน string วันที่วันนี้ในรูปแบบ YYYY-MM-DD (เวลาไทย) */
export function getTodayBangkok() {
       return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
}

/** แสดงเวลาในรูปแบบไทย เช่น 09:30:45 */
export function formatTime(dateStr) {
       return new Date(dateStr).toLocaleTimeString('th-TH')
}

/** แสดงวันที่ในรูปแบบไทย เช่น 5/5/2568 */
export function formatDate(dateStr) {
       if (!dateStr) return '—'
       return new Date(dateStr).toLocaleDateString('th-TH')
}
