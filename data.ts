
import { Project, Feedback } from './types.ts';

const SHEET_ID = '1nA3qDu3zBU8ljaa7XB9G5TQ487CLVW-uvFdIAlClHzs';
const PROJECTS_GID = '706042723';
const FEEDBACK_GID = '165366722'; 

// URL để đọc dữ liệu (gviz)
const PROJECTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${PROJECTS_GID}`;
const FEEDBACK_READ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${FEEDBACK_GID}`;

// URL Script để Ghi dữ liệu
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzkTHa-rrhuCiphb-za4hSPcaYTeIFh3uYBHFa8CtF8IyBEP3trZDrNj6IkVF7VYvMp6A/exec'; 

/**
 * MÃ GOOGLE APPS SCRIPT (Copy vào Tiện ích mở rộng -> Apps Script):
 * 
 * function doPost(e) {
 *   try {
 *     var sheet = SpreadsheetApp.openById('1nA3qDu3zBU8ljaa7XB9G5TQ487CLVW-uvFdIAlClHzs').getSheetByName('Feedback');
 *     var data = JSON.parse(e.postData.contents);
 *     
 *     // Ghi vào dòng cuối: [Ngày giờ, Tên, Số điện thoại, Lời nhắn]
 *     sheet.appendRow([new Date(), data.name, data.phone, data.message]);
 *     
 *     return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
 *   } catch (err) {
 *     return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
 *   }
 * }
 */

export async function submitFeedback(name: string, phone: string, message: string): Promise<boolean> {
  try {
    if (!SCRIPT_URL || SCRIPT_URL.includes('placeholder')) {
      console.warn("Chưa cấu hình SCRIPT_URL");
      return false;
    }

    // Gửi dữ liệu dưới dạng text/plain để tránh lỗi CORS Preflight phức tạp của Google Apps Script
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ name, phone, message })
    });
    
    // Vì mode 'no-cors' không trả về response body, ta mặc định là thành công nếu không có lỗi crash
    return true;
  } catch (err) {
    console.error("Lỗi gửi feedback:", err);
    return false;
  }
}

export async function fetchFeedbacks(): Promise<Feedback[]> {
  try {
    const response = await fetch(`${FEEDBACK_READ_URL}&t=${Date.now()}`);
    if (!response.ok) return [];
    
    const text = await response.text();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return [];
    
    const jsonData = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    const rows = jsonData.table.rows;

    if (!rows || rows.length === 0) return [];

    return rows.map((row: any) => {
      const c = row.c;
      // Hàm an toàn để lấy giá trị từ ô
      const v = (idx: number) => {
        if (!c[idx]) return '';
        return c[idx].f || (c[idx].v !== null ? String(c[idx].v) : '');
      };

      return {
        timestamp: v(0),
        name: v(1),
        phone: v(2),
        message: v(3)
      };
    })
    .filter((item:any) => item.name || item.phone) // Loại bỏ dòng trống
    .reverse(); 
  } catch (error) {
    console.error("Lỗi lấy feedback:", error);
    return [];
  }
}

function parseSheetDate(val: any): string {
  if (!val) return new Date().toISOString();
  const strVal = String(val);
  const dateMatch = strVal.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (dateMatch) {
    const [_, y, m, d] = dateMatch;
    return new Date(parseInt(y), parseInt(m), parseInt(d)).toISOString();
  }
  const date = new Date(strVal);
  return !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

function convertDriveUrl(url: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1544333346-64c4fe0cd271?auto=format&fit=crop&q=80&w=800';
  const driveIdMatch = url.match(/[-\w]{25,}/);
  if (driveIdMatch) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[0]}&sz=w1200`;
  }
  return url;
}

export async function fetchProjectsFromSheet(): Promise<Project[]> {
  try {
    const response = await fetch(`${PROJECTS_URL}&t=${Date.now()}`);
    if (!response.ok) throw new Error('Lỗi kết nối');
    const text = await response.text();
    const jsonData = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = jsonData.table.rows;
    if (!rows || rows.length === 0) return FALLBACK_PROJECTS;

    return rows.map((row: any, index: number) => {
      const c = row.c;
      const getVal = (idx: number) => (c[idx] ? (c[idx].v !== null ? c[idx].v : '') : '');
      return {
        id: getVal(0)?.toString() || `p-${index}`,
        title: getVal(1) || 'Công trình của chú Út',
        category: (getVal(2) || 'Tất cả') as any,
        description: getVal(3) || 'Đang cập nhật nội dung...',
        imageUrl: convertDriveUrl(getVal(4)?.toString() || ''),
        date: parseSheetDate(getVal(5)),
        location: getVal(6) || 'TP. Hồ Chí Minh'
      };
    });
  } catch (error) {
    return FALLBACK_PROJECTS;
  }
}

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'fb1',
    title: 'Bếp Củi Cách Tân Gò Vấp',
    category: 'Bếp Củi',
    description: 'Hệ thống bếp củi không khói, tối ưu nhiệt lượng.',
    imageUrl: 'https://images.unsplash.com/photo-1544333346-64c4fe0cd271?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    location: 'Quận Gò Vấp, TP.HCM'
  }
];

export const contactInfo = {
  name: 'Lưu thiệu (chú Út)',
  title: 'Thợ xây bếp chuyên nghiệp',
  services: 'Chuyên xây bếp lò - Nhận sửa chữa',
  fuels: 'Nguyên liệu đốt: củi, than, ga',
  products: 'Tủ - nồi hấp cơm inox 304 - 100%',
  phone: '0909 144462',
  email: 'lienhe@bepquan.vn',
  address: '84/47 HUỲNH KHƯƠNG AN, P.5, Q.GÒ VẤP, TP.HCM',
  facebook: 'https://facebook.com/bepquan.xaydung'
};
