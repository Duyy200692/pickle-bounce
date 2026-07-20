import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini API Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Store alobo synced bookings in local JSON or memory
const DB_PATH = path.join(process.cwd(), "alobo_bookings.json");

interface SyncedSlot {
  courtName: string; // "Sân 1", "Sân 2", etc.
  timeSlot: string;  // "09:00 - 10:00", "17:00 - 18:00", etc.
  status: "booked" | "locked" | "free";
  date: string;      // "16/07/2026" or YYYY-MM-DD
}

// Default initial state matching the user's screenshot exactly!
const DEFAULT_SYNCED_SLOTS: SyncedSlot[] = [
  // Sân 1
  { courtName: "Sân 1", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "09:00 - 10:00", status: "booked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "14:00 - 15:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "15:00 - 16:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "16:00 - 17:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "19:00 - 20:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "20:00 - 21:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 1", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-16" },

  // Sân 2
  { courtName: "Sân 2", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "14:00 - 15:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "15:00 - 16:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "16:00 - 17:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "19:00 - 20:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "20:00 - 21:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 2", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-16" },

  // Sân 3
  { courtName: "Sân 3", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "14:00 - 15:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "15:00 - 16:00", status: "booked", date: "2026-07-16" }, // Sân 3 has 14:30 - 17:00 booked (visually)
  { courtName: "Sân 3", timeSlot: "16:00 - 17:00", status: "booked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "18:00 - 19:00", status: "booked", date: "2026-07-16" }, // 18:00 - 21:00 booked
  { courtName: "Sân 3", timeSlot: "19:00 - 20:00", status: "booked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "20:00 - 21:00", status: "booked", date: "2026-07-16" },
  { courtName: "Sân 3", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-16" },

  // Sân 4
  { courtName: "Sân 4", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "14:00 - 15:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "15:00 - 16:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "16:00 - 17:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "19:00 - 20:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "20:00 - 21:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 4", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-16" },

  // Sân 5
  { courtName: "Sân 5", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "14:00 - 15:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "15:00 - 16:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "16:00 - 17:00", status: "locked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "17:00 - 18:00", status: "booked", date: "2026-07-16" }, // 17:00 - 19:00 booked
  { courtName: "Sân 5", timeSlot: "18:00 - 19:00", status: "booked", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "19:00 - 20:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "20:00 - 21:00", status: "free", date: "2026-07-16" },
  { courtName: "Sân 5", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-16" },
];

// Config for Google Sheets Integration
const CONFIG_PATH = path.join(process.cwd(), "alobo_config.json");

interface AloboConfig {
  googleSheetWebhookUrl: string;
  googleSheetUrl: string;
  googleSheetSyncedSlots?: string[]; // array of "date|courtName|timeSlot" keys to prevent duplicates
  forwardLogs: Array<{
    id: string;
    fullName: string;
    phone: string;
    courtName: string;
    date: string;
    timeSlot: string;
    price: string;
    paymentStatus: string;
    syncedAt: string;
    status: "success" | "failed";
  }>;
}

const DEFAULT_CONFIG: AloboConfig = {
  googleSheetWebhookUrl: "",
  googleSheetUrl: "",
  googleSheetSyncedSlots: [],
  forwardLogs: []
};

function loadConfig(): AloboConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading config file", err);
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: AloboConfig) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving config file", err);
  }
}

// Ensure config file is initialized on startup
if (!fs.existsSync(CONFIG_PATH)) {
  saveConfig(DEFAULT_CONFIG);
}

// Helper to forward booking to Google Sheets via Apps Script Web App Webhook
async function forwardToGoogleSheets(booking: any) {
  const config = loadConfig();
  const webhookUrl = config.googleSheetWebhookUrl;
  
  const logEntry = {
    id: "gsl-" + Math.random().toString(36).substr(2, 9),
    fullName: booking.fullName || "",
    phone: booking.phone || "",
    courtName: booking.courtName || booking.packageType || "Gói đăng ký",
    date: booking.date || booking.contractDate || new Date().toISOString().split('T')[0],
    timeSlot: booking.timeSlot || booking.preferredTime || "N/A",
    price: booking.price || (booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') + " đ" : "0 đ"),
    paymentStatus: booking.paymentStatus || (booking.depositAmount ? `Đã cọc ${booking.depositAmount.toLocaleString('vi-VN')} đ` : "Đã đặt"),
    syncedAt: new Date().toLocaleString("vi-VN"),
    status: "failed" as "success" | "failed"
  };

  if (!webhookUrl) {
    console.log("[Google Sheets] Forwarding skipped: Webhook URL is empty.");
    config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
    saveConfig(config);
    return { success: false, error: "Chưa cấu hình Google Sheets Webhook URL trong hệ thống." };
  }

  // Double check if they accidentally pasted the Google Sheets Link in Webhook URL
  if (webhookUrl.includes("docs.google.com/spreadsheets")) {
    console.log("[Google Sheets] Forwarding skipped: Webhook URL contains a spreadsheet link instead of a Web App macro link.");
    config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
    saveConfig(config);
    return { success: false, error: "Lỗi cấu hình: Webhook URL là link bảng tính, không phải link Apps Script Web App." };
  }

  try {
    const formattedData: any = {
      action: booking.action || "addBooking",
      ...booking,
      syncedAt: logEntry.syncedAt
    };

    // Enrich with Vietnamese fields for seamless compatibility with Apps Script
    formattedData.ngay_ky = booking.contractDate || booking.date || "";
    formattedData.ho_ten = booking.fullName || "";
    formattedData.ngay_sinh = booking.dob || "";
    formattedData.sdt = booking.phone || "";
    formattedData.thoi_gian = booking.preferredTime || booking.timeSlot || "";
    formattedData.gio_tap = booking.hoursCount || "";
    formattedData.goi_tap = booking.packageType || booking.courtName || "";
    formattedData.thoi_han = booking.durationMonths || "";
    formattedData.hlv = booking.coachName || "";
    formattedData.dich_vu = booking.serviceType || "Pickleball";
    formattedData.gia_tri = booking.totalPrice || booking.price || 0;
    formattedData.dat_coc = booking.depositAmount || 0;
    formattedData.con_lai = booking.remainingAmount || 0;
    formattedData.thuc_te = booking.actualPaid || 0;

    console.log(`[Google Sheets] Forwarding to webhook: ${webhookUrl}`, formattedData);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Apps Script redirects, and usually returns 200 or 302
    if (response.ok) {
      const respText = await response.text();
      let respJson: any = null;
      let isJson = false;
      try {
        respJson = JSON.parse(respText);
        isJson = true;
      } catch (e) {
        isJson = false;
      }

      if (isJson) {
        if (respJson && (respJson.status === "error" || respJson.status === "failed" || respJson.success === false)) {
          logEntry.status = "failed";
          console.error("[Google Sheets] Apps Script returned error status:", respJson);
          config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
          saveConfig(config);
          return { success: false, error: `Lỗi Google Apps Script: ${respJson.message || respJson.error || JSON.stringify(respJson)}` };
        }
        
        logEntry.status = "success";
        console.log("[Google Sheets] Successfully forwarded booking!");
        config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
        saveConfig(config);
        return { success: true };
      } else {
        // If it is HTML, check for authentication or compilation error indications
        const isHtml = respText.toLowerCase().includes("<html") || respText.toLowerCase().includes("<!doctype");
        if (isHtml) {
          logEntry.status = "failed";
          let friendlyError = "Lỗi kết nối: Google trả về trang HTML thay vì JSON.";
          if (respText.includes("Sign in") || respText.includes("Service Login") || respText.includes("accounts.google.com") || respText.includes("login")) {
            friendlyError = "Lỗi phân quyền Apps Script: Bạn chưa phân quyền 'Bất kỳ ai' (Anyone) khi Triển khai (Deploy). Vui lòng Triển khai mới, ở mục 'Ai có quyền truy cập' chọn 'Bất kỳ ai' (Anyone).";
          } else if (respText.includes("script_error") || respText.includes("Script error") || respText.includes("Lỗi tập lệnh") || respText.includes("syntax error") || respText.includes("ReferenceError")) {
            friendlyError = "Lỗi tập lệnh Google Apps Script: Code của bạn bị lỗi cú pháp hoặc lỗi logic (ví dụ: thiếu dấu ngoặc nhọn } ở hàm 'myFunction' dòng 1). Vui lòng dán lại mã Apps Script mẫu chuẩn.";
          } else {
            friendlyError = "Lỗi phản hồi Google Apps Script: Web App trả về giao diện HTML. Hãy chắc chắn bạn đã Deploy đúng dạng 'Web App' với cấu hình Access: 'Anyone'.";
          }
          console.error("[Google Sheets] HTML response received:", friendlyError);
          config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
          saveConfig(config);
          return { success: false, error: friendlyError };
        }

        logEntry.status = "success";
        console.log("[Google Sheets] Forwarded but response was not JSON:", respText.substring(0, 100));
        config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
        saveConfig(config);
        return { success: true };
      }
    } else {
      const respText = await response.text();
      console.error("[Google Sheets] Server error from Apps Script webhook:", respText);
      config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
      saveConfig(config);
      return { success: false, error: `Lỗi máy chủ Google (${response.status}): ${respText.substring(0, 100)}` };
    }
  } catch (error: any) {
    console.error("[Google Sheets] Connection failed:", error);
    config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
    saveConfig(config);
    return { success: false, error: error.message || "Không thể kết nối tới Google Webhook." };
  }
}

// Sync newly detected booked slots to Sheets in background
async function autoSyncNewBookingsToSheets(oldSlots: SyncedSlot[], newSlots: SyncedSlot[]) {
  const config = loadConfig();
  if (!config.googleSheetSyncedSlots) {
    config.googleSheetSyncedSlots = [];
  }

  let updated = false;

  for (const newSlot of newSlots) {
    if (newSlot.status === "booked") {
      const slotKey = `${newSlot.date}|${newSlot.courtName}|${newSlot.timeSlot}`;
      
      // Check if already synced
      if (!config.googleSheetSyncedSlots.includes(slotKey)) {
        // Find if this was already booked in oldSlots (to sync transitions to booked only)
        const oldSlot = oldSlots.find(
          os => os.courtName === newSlot.courtName && 
                os.timeSlot === newSlot.timeSlot && 
                os.date === newSlot.date
        );

        if (!oldSlot || oldSlot.status !== "booked") {
          console.log(`[Google Sheets Auto-Sync] Syncing newly booked slot: ${slotKey}`);
          
          const booking = {
            fullName: `Khách Alobo (${newSlot.courtName})`,
            phone: "Sân đặt từ xa",
            courtName: newSlot.courtName,
            date: newSlot.date,
            timeSlot: newSlot.timeSlot,
            price: "150.000 đ",
            paymentStatus: "Đã đặt (Alobo.vn)"
          };

          // Async forward to Google Sheets (letting it process in background)
          forwardToGoogleSheets(booking).catch(err => {
            console.error(`[Google Sheets Auto-Sync] Error forwarding slot ${slotKey}:`, err);
          });
          
          config.googleSheetSyncedSlots.push(slotKey);
          updated = true;
        }
      }
    }
  }

  if (updated) {
    if (config.googleSheetSyncedSlots.length > 1000) {
      config.googleSheetSyncedSlots = config.googleSheetSyncedSlots.slice(-1000);
    }
    saveConfig(config);
  }
}

function getInitialSlotsForDate(dateStr: string): SyncedSlot[] {
  let formattedDate = dateStr;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  // If it's Monday July 20th, 2026, initialize with the exact screenshot schedule!
  if (formattedDate === "2026-07-20") {
    return [
      // Sân 1
      { courtName: "Sân 1", timeSlot: "06:00 - 07:00", status: "locked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "07:00 - 08:00", status: "locked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "08:00 - 09:00", status: "locked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "09:00 - 10:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "10:00 - 11:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "11:00 - 12:00", status: "locked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "12:00 - 13:00", status: "locked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "13:00 - 14:00", status: "locked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "14:00 - 15:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "15:00 - 16:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "16:00 - 17:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "17:00 - 18:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "18:00 - 19:00", status: "free", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "19:00 - 20:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "20:00 - 21:00", status: "booked", date: formattedDate },
      { courtName: "Sân 1", timeSlot: "21:00 - 22:00", status: "free", date: formattedDate },

      // Sân 2
      { courtName: "Sân 2", timeSlot: "06:00 - 07:00", status: "locked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "07:00 - 08:00", status: "locked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "08:00 - 09:00", status: "locked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "09:00 - 10:00", status: "locked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "10:00 - 11:00", status: "locked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "11:00 - 12:00", status: "locked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "12:00 - 13:00", status: "locked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "13:00 - 14:00", status: "booked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "14:00 - 15:00", status: "booked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "15:00 - 16:00", status: "booked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "16:00 - 17:00", status: "booked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "17:00 - 18:00", status: "free", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "18:00 - 19:00", status: "free", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "19:00 - 20:00", status: "booked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "20:00 - 21:00", status: "booked", date: formattedDate },
      { courtName: "Sân 2", timeSlot: "21:00 - 22:00", status: "booked", date: formattedDate },

      // Sân 3
      { courtName: "Sân 3", timeSlot: "06:00 - 07:00", status: "booked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "07:00 - 08:00", status: "locked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "08:00 - 09:00", status: "locked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "09:00 - 10:00", status: "locked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "10:00 - 11:00", status: "locked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "11:00 - 12:00", status: "locked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "12:00 - 13:00", status: "locked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "13:00 - 14:00", status: "locked", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "14:00 - 15:00", status: "free", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "15:00 - 16:00", status: "free", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "16:00 - 17:00", status: "free", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "17:00 - 18:00", status: "free", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "18:00 - 19:00", status: "free", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "19:00 - 20:00", status: "free", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "20:00 - 21:00", status: "free", date: formattedDate },
      { courtName: "Sân 3", timeSlot: "21:00 - 22:00", status: "free", date: formattedDate },

      // Sân 4
      { courtName: "Sân 4", timeSlot: "06:00 - 07:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "07:00 - 08:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "08:00 - 09:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "09:00 - 10:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "10:00 - 11:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "11:00 - 12:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "12:00 - 13:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "13:00 - 14:00", status: "locked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "14:00 - 15:00", status: "free", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "15:00 - 16:00", status: "free", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "16:00 - 17:00", status: "free", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "17:00 - 18:00", status: "free", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "18:00 - 19:00", status: "free", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "19:00 - 20:00", status: "booked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "20:00 - 21:00", status: "booked", date: formattedDate },
      { courtName: "Sân 4", timeSlot: "21:00 - 22:00", status: "free", date: formattedDate },

      // Sân 5
      { courtName: "Sân 5", timeSlot: "06:00 - 07:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "07:00 - 08:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "08:00 - 09:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "09:00 - 10:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "10:00 - 11:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "11:00 - 12:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "12:00 - 13:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "13:00 - 14:00", status: "locked", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "14:00 - 15:00", status: "free", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "15:00 - 16:00", status: "free", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "16:00 - 17:00", status: "free", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "17:00 - 18:00", status: "free", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "18:00 - 19:00", status: "free", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "19:00 - 20:00", status: "free", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "20:00 - 21:00", status: "free", date: formattedDate },
      { courtName: "Sân 5", timeSlot: "21:00 - 22:00", status: "free", date: formattedDate }
    ];
  }

  return DEFAULT_SYNCED_SLOTS.map(slot => ({
    ...slot,
    date: formattedDate
  }));
}

function ensureSlotsForDate(allSlots: SyncedSlot[], dateStr: string): SyncedSlot[] {
  let formattedDate = dateStr;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  const exists = allSlots.some(slot => slot.date === formattedDate);
  if (!exists) {
    const initial = getInitialSlotsForDate(formattedDate);
    allSlots.push(...initial);
  }
  return allSlots;
}

function loadAloboBookings(): SyncedSlot[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading Alobo DB", err);
  }
  return DEFAULT_SYNCED_SLOTS;
}

function saveAloboBookings(slots: SyncedSlot[]) {
  try {
    let oldSlots: SyncedSlot[] = [];
    if (fs.existsSync(DB_PATH)) {
      try {
        const content = fs.readFileSync(DB_PATH, "utf-8");
        oldSlots = JSON.parse(content);
      } catch (e) {
        console.error("Error reading old slots inside saveAloboBookings:", e);
      }
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(slots, null, 2), "utf-8");

    // Async trigger Sheets auto-sync
    autoSyncNewBookingsToSheets(oldSlots, slots).catch(err => {
      console.error("[Google Sheets Auto-Sync] Error in background sync:", err);
    });
  } catch (err) {
    console.error("Error writing Alobo DB", err);
  }
}

// Ensure database is initialized on startup
if (!fs.existsSync(DB_PATH)) {
  saveAloboBookings(DEFAULT_SYNCED_SLOTS);
}

// -------------------------------------------------------------
// BACKEND API ENDPOINTS
// -------------------------------------------------------------

// Config & Logs retrieval
app.get("/api/alobo/config", (req, res) => {
  const config = loadConfig();
  res.json({ success: true, config });
});

// Update Config
app.post("/api/alobo/config", (req, res) => {
  try {
    const { googleSheetWebhookUrl, googleSheetUrl } = req.body;
    const config = loadConfig();
    config.googleSheetWebhookUrl = googleSheetWebhookUrl || "";
    config.googleSheetUrl = googleSheetUrl || "";
    saveConfig(config);
    res.json({ success: true, message: "Đã lưu cấu hình Google Sheets thành công!", config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear Sync Logs
app.post("/api/alobo/config/clear-logs", (req, res) => {
  try {
    const config = loadConfig();
    config.forwardLogs = [];
    saveConfig(config);
    res.json({ success: true, message: "Đã xoá sạch nhật ký đồng bộ!", config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Google Sheets Connection
app.post("/api/alobo/test-sheet", async (req, res) => {
  try {
    const testBooking = {
      fullName: "Nguyễn Văn Test",
      phone: "0909888888",
      courtName: "Sân 3",
      date: "2026-07-18",
      timeSlot: "17:00 - 18:00",
      price: "150.000 đ",
      paymentStatus: "Đã thanh toán (Kiểm tra hệ thống)"
    };
    
    const result = await forwardToGoogleSheets(testBooking);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Direct Forward Booking Route
app.post("/api/alobo/forward-booking", async (req, res) => {
  try {
    const { action, fullName, phone } = req.body;
    
    // If it's a registration or custom action, bypass simple booking validation
    if (action && action !== "addBooking") {
      const result = await forwardToGoogleSheets(req.body);
      return res.json({ success: true, result, payload: req.body });
    }

    const { courtName, date, timeSlot, price, paymentStatus } = req.body;
    if (!fullName || !phone || !courtName) {
      return res.status(400).json({ success: false, error: "Thiếu thông tin bắt buộc (Tên khách hàng, Số điện thoại, Sân đấu)." });
    }

    const booking = {
      fullName,
      phone,
      courtName,
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || "09:00 - 10:00",
      price: price || "150.000",
      paymentStatus: paymentStatus || "Đã thanh toán"
    };

    const result = await forwardToGoogleSheets(booking);

    // Also update the local database so the visual timeline on the page reflects this slot as "booked" in real-time!
    try {
      const allSlots = loadAloboBookings();
      const targetCourt = booking.courtName;
      const targetTime = booking.timeSlot;
      
      let updatedLocalSlot = false;
      const updatedSlots = allSlots.map(slot => {
        const isCourtMatch = slot.courtName.toLowerCase() === targetCourt.toLowerCase() ||
                             slot.courtName.includes(targetCourt) ||
                             targetCourt.includes(slot.courtName);
        
        const dbHour = slot.timeSlot.split(":")[0]?.trim();
        const bookingHour = targetTime.split(":")[0]?.trim();
        const isHourMatch = dbHour && bookingHour && dbHour === bookingHour;
        
        if (isCourtMatch && isHourMatch) {
          updatedLocalSlot = true;
          return {
            ...slot,
            status: "booked" as "booked" | "locked" | "free"
          };
        }
        return slot;
      });
      
      if (updatedLocalSlot) {
        saveAloboBookings(updatedSlots);
      }
    } catch (dbErr) {
      console.error("Failed to update local bookings cache:", dbErr);
    }

    res.json({ success: true, result, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1. Get Synced Booking Schedule
app.get("/api/alobo/sync", (req, res) => {
  const dateQuery = req.query.date as string || "2026-07-16";
  
  let formattedDate = dateQuery;
  if (dateQuery.includes("/")) {
    const parts = dateQuery.split("/");
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  let allSlots = loadAloboBookings();
  allSlots = ensureSlotsForDate(allSlots, formattedDate);
  saveAloboBookings(allSlots);

  const slotsForDate = allSlots.filter(slot => slot.date === formattedDate);
  
  res.json({
    success: true,
    lastUpdated: new Date().toLocaleString("vi-VN"),
    source: "datlich.alobo.vn/san/sport_pickle_bounce",
    slots: slotsForDate
  });
});

// 2. Clear or Reset synchronization
app.post("/api/alobo/reset", (req, res) => {
  saveAloboBookings(DEFAULT_SYNCED_SLOTS);
  res.json({
    success: true,
    message: "Reset Alobo schedules to default snapshot",
    slots: DEFAULT_SYNCED_SLOTS
  });
});

// 2.5. Direct sync scraped data from Tampermonkey userscript
app.post("/api/alobo/sync-scraped", (req, res) => {
  try {
    const { slots: incomingSlots, date } = req.body;
    if (!incomingSlots || !Array.isArray(incomingSlots)) {
      return res.status(400).json({ success: false, error: "Invalid data format. Expected 'slots' array." });
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    let formattedDate = dateStr;
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    let currentSlots = loadAloboBookings();
    currentSlots = ensureSlotsForDate(currentSlots, formattedDate);

    // Update current database with matching court name and hour slot from incoming scraped data
    const updatedSlots = currentSlots.map(dbSlot => {
      if (dbSlot.date !== formattedDate) {
        return dbSlot;
      }

      // Find matching item
      const matched = incomingSlots.find(is => {
        const namesMatch = dbSlot.courtName.toLowerCase() === is.courtName.toLowerCase() ||
                           dbSlot.courtName.includes(is.courtName) ||
                           is.courtName.includes(dbSlot.courtName);
        
        const dbHour = dbSlot.timeSlot.split(":")[0]?.trim();
        const isHour = is.timeSlot.split(":")[0]?.trim();
        const hoursMatch = dbHour && isHour && dbHour === isHour;

        return namesMatch && hoursMatch;
      });

      if (matched) {
        return {
          ...dbSlot,
          status: matched.status as "booked" | "locked" | "free"
        };
      }
      return dbSlot;
    });

    saveAloboBookings(updatedSlots);

    res.json({
      success: true,
      message: `Đồng bộ trực tiếp thành công cho ngày ${formattedDate}! Đã cập nhật ${incomingSlots.length} khung giờ từ Tampermonkey.`,
      lastUpdated: new Date().toLocaleString("vi-VN"),
      slots: updatedSlots.filter(slot => slot.date === formattedDate)
    });
  } catch (error: any) {
    console.error("Scraped sync error:", error);
    res.status(500).json({ success: false, error: error.message || "Xảy ra lỗi khi đồng bộ dữ liệu cào." });
  }
});

// 3. Simulate a new random real-time booking event
app.post("/api/alobo/simulate-booking", (req, res) => {
  const allSlots = loadAloboBookings();
  
  // Find a free slot to book
  const freeSlots = allSlots.filter(s => s.status === "free");
  if (freeSlots.length > 0) {
    const randomSlot = freeSlots[Math.floor(Math.random() * freeSlots.length)]!;
    randomSlot.status = "booked";
    saveAloboBookings(allSlots);
    
    res.json({
      success: true,
      message: `Simulated live booking on alobo: ${randomSlot.courtName} (${randomSlot.timeSlot})`,
      slot: randomSlot
    });
  } else {
    res.json({
      success: false,
      message: "No free slots left to simulate booking!"
    });
  }
});

// 4. Gemini AI screenshot parser
app.post("/api/alobo/sync-screenshot", async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;
    if (!base64Image) {
      return res.status(400).json({ success: false, error: "Missing image base64 data" });
    }

    if (!ai) {
      return res.status(500).json({ 
        success: false, 
        error: "GEMINI_API_KEY is not configured on this workspace. Please set it in Settings > Secrets." 
      });
    }

    const promptText = `
You are an expert AI parser. Analyze this screenshot of the pickleball court schedule board from the 'datlich.alobo.vn' platform.
The image contains court names in a column (e.g., Sân 1, Sân 2, Sân 3, Sân 4, Sân 5, Sân 6) and hour slots across the top (from 6:00 to 22:00).
Look at each court row and determine the booking status of each hour block:
- Red indicates "Đã đặt" (booked).
- Gray indicates "Khoá" (locked).
- White/Blank/Greenish indicates "Trống" (free).

Extract the complete list of court slots and output STRICTLY a JSON array matching this exact schema:
[
  {
    "courtName": "Sân 1",
    "timeSlot": "09:00 - 10:00",
    "status": "booked"
  },
  {
    "courtName": "Sân 3",
    "timeSlot": "18:00 - 19:00",
    "status": "booked"
  },
  {
    "courtName": "Sân 3",
    "timeSlot": "15:00 - 16:00",
    "status": "locked"
  }
]
Use "booked" for Red slots, "locked" for Gray slots, and "free" for White/uncolored slots.
Only output the valid JSON array without any markdown wrappers or backticks.
`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Image
      }
    };

    const textPart = {
      text: promptText
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              courtName: { type: Type.STRING },
              timeSlot: { type: Type.STRING },
              status: { 
                type: Type.STRING,
                description: "Must be 'booked', 'locked', or 'free'" 
              }
            },
            required: ["courtName", "timeSlot", "status"]
          }
        }
      }
    });

    const parsedText = response.text?.trim() || "[]";
    const parsedSlots = JSON.parse(parsedText) as Array<{ courtName: string, timeSlot: string, status: "booked" | "locked" | "free" }>;

    if (parsedSlots && parsedSlots.length > 0) {
      // Load current database
      const dbSlots = loadAloboBookings();
      
      // Update our database slots matching courtName and timeSlot
      const updatedDb = dbSlots.map(dbSlot => {
        // Try to match parsed slot
        const matched = parsedSlots.find(ps => {
          const namesMatch = dbSlot.courtName.toLowerCase() === ps.courtName.toLowerCase() ||
                             dbSlot.courtName.includes(ps.courtName) ||
                             ps.courtName.includes(dbSlot.courtName);
          
          // match timeslots like "09:00 - 10:00" or just matching hours
          const dbHour = dbSlot.timeSlot.split(":")[0];
          const psHour = ps.timeSlot.split(":")[0];
          const hoursMatch = dbHour === psHour;

          return namesMatch && hoursMatch;
        });

        if (matched) {
          return {
            ...dbSlot,
            status: matched.status
          };
        }
        return dbSlot;
      });

      saveAloboBookings(updatedDb);

      return res.json({
        success: true,
        message: `Đồng bộ thành công! Đã phát hiện và cập nhật ${parsedSlots.length} khung giờ từ ảnh chụp màn hình.`,
        parsedCount: parsedSlots.length,
        slots: updatedDb
      });
    }

    return res.json({
      success: false,
      error: "Không thể nhận diện được các khung giờ trong ảnh. Vui lòng kiểm tra lại chất lượng hình ảnh!"
    });

  } catch (error: any) {
    console.error("Gemini sync error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Xảy ra lỗi khi phân tích ảnh bằng Gemini."
    });
  }
});

// 5. Fetch directly from Alobo API (Bypassing CORS on server-side)
app.post("/api/alobo/fetch-live-api", async (req, res) => {
  try {
    const { url, headers, method, body } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: "Thiếu URL API của Alobo." });
    }

    const requestOptions: RequestInit = {
      method: method || "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        ...headers
      }
    };

    if (body && (method === "POST" || method === "PUT")) {
      requestOptions.body = typeof body === "object" ? JSON.stringify(body) : body;
    }

    console.log(`[Proxy Fetch] Sending request to: ${url}`);
    const fetchResponse = await fetch(url, requestOptions);
    
    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      return res.status(fetchResponse.status).json({
        success: false,
        error: `Máy chủ Alobo phản hồi mã lỗi ${fetchResponse.status}: ${errorText.substring(0, 200)}`
      });
    }

    const rawData = await fetchResponse.json();

    if (!ai) {
      return res.json({
        success: true,
        message: "Lấy dữ liệu thành công! Tuy nhiên, GEMINI_API_KEY chưa cấu hình để tự động parse cấu trúc này.",
        rawData
      });
    }

    // Use Gemini to intelligently parse the API JSON response
    const parsePrompt = `
      You are an expert sports booking JSON parser. Analyze this raw JSON data retrieved from alobo.vn's internal API.
      Extract the court bookings / slot statuses for the pickleball facility (e.g. sport_pickle_bounce) and match them to our standard format.
      We are interested in booking slots between 06:00 and 22:00 for the courts (Sân 1, Sân 2, Sân 3, Sân 4, Sân 5).
      Identify which slots are booked (occupied/reserved), locked (blocked by admin), or free (available).
      Convert this raw API response into a structured JSON array matching this exact schema:
      [
        {
          "courtName": "Sân 1",
          "timeSlot": "09:00 - 10:00",
          "status": "booked"
        }
      ]
      Ensure statuses are strictly "booked", "locked", or "free".
      Only output the valid JSON array without any markdown wrappers.
    `;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: parsePrompt },
        { text: JSON.stringify(rawData) }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              courtName: { type: Type.STRING },
              timeSlot: { type: Type.STRING },
              status: { 
                type: Type.STRING,
                description: "Must be 'booked', 'locked', or 'free'" 
              }
            },
            required: ["courtName", "timeSlot", "status"]
          }
        }
      }
    });

    const parsedText = modelResponse.text?.trim() || "[]";
    const parsedSlots = JSON.parse(parsedText) as Array<{ courtName: string, timeSlot: string, status: "booked" | "locked" | "free" }>;

    if (parsedSlots && parsedSlots.length > 0) {
      const dbSlots = loadAloboBookings();
      const updatedDb = dbSlots.map(dbSlot => {
        const matched = parsedSlots.find(ps => {
          const namesMatch = dbSlot.courtName.toLowerCase() === ps.courtName.toLowerCase() ||
                             dbSlot.courtName.includes(ps.courtName) ||
                             ps.courtName.includes(dbSlot.courtName);
          const dbHour = dbSlot.timeSlot.split(":")[0];
          const psHour = ps.timeSlot.split(":")[0];
          return namesMatch && dbHour === psHour;
        });

        if (matched) {
          return { ...dbSlot, status: matched.status };
        }
        return dbSlot;
      });

      saveAloboBookings(updatedDb);

      return res.json({
        success: true,
        message: `Đồng bộ trực tiếp qua Alobo API thành công! Đã phát hiện và cập nhật ${parsedSlots.length} khung giờ.`,
        slots: updatedDb
      });
    }

    return res.json({
      success: true,
      message: "Lấy dữ liệu API thành công nhưng không thể phân tích các khung giờ.",
      rawData
    });

  } catch (err: any) {
    console.error("Direct API sync error:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi khi đồng bộ trực tiếp từ API." });
  }
});

// 6. Paste raw API Response JSON
app.post("/api/alobo/sync-raw-json", async (req, res) => {
  try {
    const { rawJson, date } = req.body;
    if (!rawJson) {
      return res.status(400).json({ success: false, error: "Thiếu dữ liệu JSON của Alobo." });
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    let formattedDate = dateStr;
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    if (!ai) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY chưa cấu hình." });
    }

    const parsePrompt = `
      You are an expert sports booking JSON parser. Analyze this raw JSON data retrieved from alobo.vn's internal API.
      Extract the court bookings / slot statuses for the pickleball facility (e.g. sport_pickle_bounce) and match them to our standard format.
      We are interested in booking slots between 06:00 and 22:00 for the courts (Sân 1, Sân 2, Sân 3, Sân 4, Sân 5).
      Identify which slots are booked (occupied/reserved), locked (blocked by admin), or free (available).
      Convert this raw API response into a structured JSON array matching this exact schema:
      [
        {
          "courtName": "Sân 1",
          "timeSlot": "09:00 - 10:00",
          "status": "booked"
        }
      ]
      Ensure statuses are strictly "booked", "locked", or "free".
      Only output the valid JSON array without any markdown wrappers.
    `;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: parsePrompt },
        { text: typeof rawJson === "string" ? rawJson : JSON.stringify(rawJson) }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              courtName: { type: Type.STRING },
              timeSlot: { type: Type.STRING },
              status: { 
                type: Type.STRING,
                description: "Must be 'booked', 'locked', or 'free'" 
              }
            },
            required: ["courtName", "timeSlot", "status"]
          }
        }
      }
    });

    const parsedText = modelResponse.text?.trim() || "[]";
    const parsedSlots = JSON.parse(parsedText) as Array<{ courtName: string, timeSlot: string, status: "booked" | "locked" | "free" }>;

    if (parsedSlots && parsedSlots.length > 0) {
      let dbSlots = loadAloboBookings();
      dbSlots = ensureSlotsForDate(dbSlots, formattedDate);

      const updatedDb = dbSlots.map(dbSlot => {
        if (dbSlot.date !== formattedDate) {
          return dbSlot;
        }

        const matched = parsedSlots.find(ps => {
          const namesMatch = dbSlot.courtName.toLowerCase() === ps.courtName.toLowerCase() ||
                             dbSlot.courtName.includes(ps.courtName) ||
                             ps.courtName.includes(dbSlot.courtName);
          const dbHour = dbSlot.timeSlot.split(":")[0];
          const psHour = ps.timeSlot.split(":")[0];
          return namesMatch && dbHour === psHour;
        });

        if (matched) {
          return { ...dbSlot, status: matched.status };
        }
        return dbSlot;
      });

      saveAloboBookings(updatedDb);

      return res.json({
        success: true,
        message: `Đồng bộ thủ công qua API Response thành công cho ngày ${formattedDate}! Đã cập nhật ${parsedSlots.length} khung giờ.`,
        slots: updatedDb.filter(slot => slot.date === formattedDate)
      });
    }

    return res.status(400).json({ success: false, error: "Không tìm thấy dữ liệu đặt sân phù hợp trong JSON được gửi." });

  } catch (err: any) {
    console.error("Raw JSON sync error:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi khi xử lý JSON thô." });
  }
});

// -------------------------------------------------------------
// VITE AND STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
