import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

dotenv.config();

// Initialize Firebase if config exists
let firebaseApp: any = null;
let firestoreDb: any = null;
let isFirebaseActive = false;

const FIREBASE_CONFIG_PATH = path.join(process.cwd(), "firebase-applet-config.json");
if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
  try {
    const fbConfig = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf-8"));
    if (fbConfig.apiKey && fbConfig.projectId) {
      firebaseApp = initializeApp({
        apiKey: fbConfig.apiKey,
        authDomain: fbConfig.authDomain,
        projectId: fbConfig.projectId,
        storageBucket: fbConfig.storageBucket,
        messagingSenderId: fbConfig.messagingSenderId,
        appId: fbConfig.appId
      });
      firestoreDb = fbConfig.firestoreDatabaseId 
        ? getFirestore(firebaseApp, fbConfig.firestoreDatabaseId)
        : getFirestore(firebaseApp);
      isFirebaseActive = true;
      console.log(`[Firebase] Initialized successfully with project ID: ${fbConfig.projectId}`);
      // Clean up any test records in Firestore
      cleanupFirestoreTestRecords();
    }
  } catch (err) {
    console.error("[Firebase] Error initializing Firebase client SDK:", err);
  }
}

async function cleanupFirestoreTestRecords() {
  if (!isFirebaseActive || !firestoreDb) return;
  try {
    console.log("[Firebase] Cleaning up test records from Firestore...");
    // 1. Clean up test bookings
    const bookingsSnap = await getDocs(collection(firestoreDb, "bookings"));
    bookingsSnap.forEach(async (dDoc) => {
      const data = dDoc.data();
      const lowerName = (data.fullName || "").toLowerCase();
      if (lowerName.includes("test") || data.phone === "0901234567") {
        await deleteDoc(doc(firestoreDb, "bookings", dDoc.id));
        console.log(`[Firebase] Cleaned up test booking document: ${dDoc.id}`);
      }
    });

    // 2. Clean up test member registrations
    const membersSnap = await getDocs(collection(firestoreDb, "member_registrations"));
    membersSnap.forEach(async (dDoc) => {
      const data = dDoc.data();
      const lowerName = (data.fullName || "").toLowerCase();
      if (lowerName.includes("test") || data.phone === "0901234567" || lowerName === "duy") {
        await deleteDoc(doc(firestoreDb, "member_registrations", dDoc.id));
        console.log(`[Firebase] Cleaned up test member registration document: ${dDoc.id}`);
      }
    });
  } catch (err) {
    console.error("[Firebase] Error during test records cleanup:", err);
  }
}

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

// Landing Page Config System
const LANDING_PAGE_PATH = path.join(process.cwd(), "landing_page_config.json");

interface PriceRow {
  day: string;
  time: string;
  price: string;
}

interface PromoRow {
  title: string;
  time: string;
  price: string;
}

interface LandingPageConfig {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  visionTag: string;
  visionTitle: string;
  visionParagraph1: string;
  visionParagraph2: string;
  visionImage: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  visionBadgeTitle: string;
  visionBadgeText: string;
  priceTitle?: string;
  priceSection1Title?: string;
  priceRows1?: PriceRow[];
  priceSection2Title?: string;
  priceRows2?: PromoRow[];
}

const DEFAULT_LANDING_PAGE: LandingPageConfig = {
  heroTag: "SPORT PICKLE BOUNCE",
  heroTitle: "Khám phá tính năng",
  heroSubtitle: "Tổ chức buổi chơi chuyên nghiệp. Miễn phí 100%. Đặt sân nhanh chóng, tìm bạn cùng trình, tổ chức giải đấu bùng nổ.",
  heroImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1600",
  visionTag: "Tầm nhìn cộng đồng",
  visionTitle: "Chơi cùng nhau. Tiến bộ cùng nhau. Vươn tầm cùng nhau.",
  visionParagraph1: "Pickleball Bounce được tạo ra như một sân chơi mới cho cộng đồng đam mê pickleball. Từ người mới bắt đầu cầm vợt đến các vận động viên phong trào hay chuyên nghiệp, ai cũng có chỗ đứng và lộ trình phát triển rõ ràng.",
  visionParagraph2: "Chúng tôi kết nối hệ thống giải đấu kịch tính, các hoạt động truyền thông sôi nổi và mạng lưới sân bãi đối tác rộng lớn thành một hệ sinh thái chung, mang lại sự tiện nghi và hứng khởi tuyệt đối cho người chơi.",
  visionImage: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800",
  stat1Value: "12k+",
  stat1Label: "Hội viên active",
  stat2Value: "50+",
  stat2Label: "Sân đối tác",
  stat3Value: "180+",
  stat3Label: "Giải đấu lớn nhỏ",
  visionBadgeTitle: "Chinh phục đỉnh cao mới",
  visionBadgeText: "Sẵn sàng cùng đồng đội nâng hạng tuần này.",
  priceTitle: "BẢNG GIÁ SÂN",
  priceSection1Title: "Khách Vãng Lai",
  priceRows1: [
    { day: "T2 - T6", time: "16h - 22h", price: "250.000 đ" },
    { day: "T2 - CN", time: "6h - 16h", price: "150.000 đ" },
    { day: "T7 - CN", time: "16h - 22h", price: "200.000 đ" }
  ],
  priceSection2Title: "Ưu đãi tháng 10",
  priceRows2: [
    { title: "Khách vãng lai", time: "Mặc định", price: "250.000 đ" }
  ]
};

function loadLandingPageConfig(): LandingPageConfig {
  try {
    if (fs.existsSync(LANDING_PAGE_PATH)) {
      return JSON.parse(fs.readFileSync(LANDING_PAGE_PATH, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading landing page config", err);
  }
  return DEFAULT_LANDING_PAGE;
}

function saveLandingPageConfig(config: LandingPageConfig) {
  try {
    fs.writeFileSync(LANDING_PAGE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving landing page config", err);
  }
}

async function getFirebaseLandingPageConfig(): Promise<LandingPageConfig> {
  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "settings", "landing_page_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as LandingPageConfig;
        saveLandingPageConfig(data);
        return data;
      }
    } catch (err) {
      console.error("[Firebase] Error fetching landing page config:", err);
    }
  }
  return loadLandingPageConfig();
}

async function saveFirebaseLandingPageConfig(config: LandingPageConfig) {
  saveLandingPageConfig(config);
  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "settings", "landing_page_config");
      await setDoc(docRef, config);
      console.log("[Firebase] Saved landing page config to Firestore.");
    } catch (err) {
      console.error("[Firebase] Error saving landing page config to Firestore:", err);
    }
  }
}

// Ensure landing page config is initialized on startup
if (!fs.existsSync(LANDING_PAGE_PATH)) {
  saveLandingPageConfig(DEFAULT_LANDING_PAGE);
}

// Firebase Config Helpers
async function getFirebaseConfig(): Promise<AloboConfig> {
  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "settings", "alobo_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as AloboConfig;
      }
    } catch (err) {
      console.error("[Firebase] Error fetching alobo_config:", err);
    }
  }
  return loadConfig();
}

async function saveFirebaseConfig(config: AloboConfig) {
  saveConfig(config); // Always back up locally
  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "settings", "alobo_config");
      await setDoc(docRef, config);
      console.log("[Firebase] Saved config to Firestore.");
    } catch (err) {
      console.error("[Firebase] Error saving config to Firestore:", err);
    }
  }
}

// Firebase Bookings Helpers (Lượt đặt sân lẻ trên website)
const BOOKINGS_DB_PATH = path.join(process.cwd(), "bookings.json");

function loadLocalBookings(): any[] {
  try {
    if (fs.existsSync(BOOKINGS_DB_PATH)) {
      return JSON.parse(fs.readFileSync(BOOKINGS_DB_PATH, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading local bookings:", err);
  }
  return [];
}

function saveLocalBookings(b: any[]) {
  try {
    fs.writeFileSync(BOOKINGS_DB_PATH, JSON.stringify(b, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving local bookings:", err);
  }
}

async function getFirebaseBookings(): Promise<any[]> {
  if (isFirebaseActive && firestoreDb) {
    try {
      const querySnapshot = await getDocs(collection(firestoreDb, "bookings"));
      const bList: any[] = [];
      querySnapshot.forEach((dDoc) => {
        bList.push({ id: dDoc.id, ...dDoc.data() });
      });
      if (bList.length > 0) {
        bList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        saveLocalBookings(bList);
        return bList;
      }
    } catch (err) {
      console.error("[Firebase] Error fetching bookings:", err);
    }
  }
  return loadLocalBookings();
}

async function saveFirebaseBooking(booking: any) {
  const bList = loadLocalBookings();
  const index = bList.findIndex(b => b.id === booking.id);
  if (index >= 0) {
    bList[index] = booking;
  } else {
    bList.unshift(booking);
  }
  saveLocalBookings(bList);

  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "bookings", booking.id);
      await setDoc(docRef, booking);
      console.log(`[Firebase] Synced booking ${booking.id} to Firestore.`);
    } catch (err) {
      console.error(`[Firebase] Error syncing booking to Firestore:`, err);
    }
  }
}

async function deleteFirebaseBooking(id: string) {
  const bList = loadLocalBookings().filter(b => b.id !== id);
  saveLocalBookings(bList);

  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "bookings", id);
      await deleteDoc(docRef);
      console.log(`[Firebase] Deleted booking ${id} from Firestore.`);
    } catch (err) {
      console.error(`[Firebase] Error deleting booking:`, err);
    }
  }
}

// Firebase Member Registrations Helpers (Hội viên đăng ký gói tập)
const MEMBERS_DB_PATH = path.join(process.cwd(), "member_registrations.json");

function loadLocalMembers(): any[] {
  try {
    if (fs.existsSync(MEMBERS_DB_PATH)) {
      return JSON.parse(fs.readFileSync(MEMBERS_DB_PATH, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading local members:", err);
  }
  return [];
}

function saveLocalMembers(m: any[]) {
  try {
    fs.writeFileSync(MEMBERS_DB_PATH, JSON.stringify(m, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving local members:", err);
  }
}

async function getFirebaseMembers(): Promise<any[]> {
  if (isFirebaseActive && firestoreDb) {
    try {
      const querySnapshot = await getDocs(collection(firestoreDb, "member_registrations"));
      const mList: any[] = [];
      querySnapshot.forEach((dDoc) => {
        mList.push({ id: dDoc.id, ...dDoc.data() });
      });
      if (mList.length > 0) {
        mList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        saveLocalMembers(mList);
        return mList;
      }
    } catch (err) {
      console.error("[Firebase] Error fetching member registrations:", err);
    }
  }
  return loadLocalMembers();
}

async function saveFirebaseMember(member: any) {
  const mList = loadLocalMembers();
  const index = mList.findIndex(m => m.id === member.id);
  if (index >= 0) {
    mList[index] = member;
  } else {
    mList.unshift(member);
  }
  saveLocalMembers(mList);

  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "member_registrations", member.id);
      await setDoc(docRef, member);
      console.log(`[Firebase] Synced member registration ${member.id} to Firestore.`);
    } catch (err) {
      console.error(`[Firebase] Error syncing member registration:`, err);
    }
  }
}

async function deleteFirebaseMember(id: string) {
  const mList = loadLocalMembers().filter(m => m.id !== id);
  saveLocalMembers(mList);

  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "member_registrations", id);
      await deleteDoc(docRef);
      console.log(`[Firebase] Deleted member registration ${id} from Firestore.`);
    } catch (err) {
      console.error(`[Firebase] Error deleting member registration:`, err);
    }
  }
}

// Firebase Slots Helpers (Khung giờ đồng bộ Alobo)
async function getFirebaseSlots(dateStr: string): Promise<SyncedSlot[]> {
  let formattedDate = dateStr;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "court_slots", formattedDate);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.slots)) {
          return data.slots as SyncedSlot[];
        }
      }
    } catch (err) {
      console.error(`[Firebase] Error fetching slots for date ${formattedDate}:`, err);
    }
  }

  // Fallback to local
  let allSlots = loadAloboBookings();
  allSlots = ensureSlotsForDate(allSlots, formattedDate);
  return allSlots.filter(s => s.date === formattedDate);
}

// Helper to forward booking to Google Sheets via Apps Script Web App Webhook
async function forwardToGoogleSheets(booking: any) {
  const config = await getFirebaseConfig();
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
    await saveFirebaseConfig(config);
    return { success: false, error: "Chưa cấu hình Google Sheets Webhook URL trong hệ thống." };
  }

  // Double check if they accidentally pasted the Google Sheets Link in Webhook URL
  if (webhookUrl.includes("docs.google.com/spreadsheets")) {
    console.log("[Google Sheets] Forwarding skipped: Webhook URL contains a spreadsheet link instead of a Web App macro link.");
    config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
    await saveFirebaseConfig(config);
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
          await saveFirebaseConfig(config);
          return { success: false, error: `Lỗi Google Apps Script: ${respJson.message || respJson.error || JSON.stringify(respJson)}` };
        }
        
        logEntry.status = "success";
        console.log("[Google Sheets] Successfully forwarded booking!");
        config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
        await saveFirebaseConfig(config);
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
          await saveFirebaseConfig(config);
          return { success: false, error: friendlyError };
        }

        logEntry.status = "success";
        console.log("[Google Sheets] Forwarded but response was not JSON:", respText.substring(0, 100));
        config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
        await saveFirebaseConfig(config);
        return { success: true };
      }
    } else {
      const respText = await response.text();
      console.error("[Google Sheets] Server error from Apps Script webhook:", respText);
      config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
      await saveFirebaseConfig(config);
      return { success: false, error: `Lỗi máy chủ Google (${response.status}): ${respText.substring(0, 100)}` };
    }
  } catch (error: any) {
    console.error("[Google Sheets] Connection failed:", error);
    config.forwardLogs = [logEntry, ...config.forwardLogs].slice(0, 50);
    await saveFirebaseConfig(config);
    return { success: false, error: error.message || "Không thể kết nối tới Google Webhook." };
  }
}

// Sync newly detected booked slots to Sheets in background
async function autoSyncNewBookingsToSheets(oldSlots: SyncedSlot[], newSlots: SyncedSlot[]) {
  const config = await getFirebaseConfig();
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
          console.log(`[Google Sheets Auto-Sync] Synced newly booked slot locally: ${slotKey}`);
          
          // NOTE: As per user request, we do NOT automatically forward placeholder "Khách Alobo" 
          // background-synced bookings to Google Sheets. This prevents the spreadsheet from being 
          // spammed with anonymous "Khách Alobo (Sân X)" rows. 
          // We only write to Google Sheets when a customer places a booking directly on our website 
          // (Pickle Bounce portal), or when the user manually scrapes/saves detailed bookings from the Alobo dashboard.
          
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
    await saveFirebaseConfig(config);
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

    // Mirror to Firebase for each date present in slots
    if (isFirebaseActive && firestoreDb) {
      const dates = Array.from(new Set(slots.map(s => s.date)));
      for (const d of dates) {
        const dateSlots = slots.filter(s => s.date === d);
        const docRef = doc(firestoreDb, "court_slots", d);
        setDoc(docRef, { slots: dateSlots, lastUpdated: new Date().toISOString() }).catch(err => {
          console.error(`[Firebase] Error async mirroring slots for date ${d}:`, err);
        });
      }
    }
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
app.get("/api/alobo/config", async (req, res) => {
  const config = await getFirebaseConfig();
  res.json({ success: true, config });
});

// Update Config
app.post("/api/alobo/config", async (req, res) => {
  try {
    const { googleSheetWebhookUrl, googleSheetUrl } = req.body;
    const config = await getFirebaseConfig();
    config.googleSheetWebhookUrl = googleSheetWebhookUrl || "";
    config.googleSheetUrl = googleSheetUrl || "";
    await saveFirebaseConfig(config);
    res.json({ success: true, message: "Đã lưu cấu hình Google Sheets thành công!", config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear Sync Logs
app.post("/api/alobo/config/clear-logs", async (req, res) => {
  try {
    const config = await getFirebaseConfig();
    config.forwardLogs = [];
    await saveFirebaseConfig(config);
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
app.get("/api/alobo/sync", async (req, res) => {
  const dateQuery = req.query.date as string || "2026-07-16";
  
  let formattedDate = dateQuery;
  if (dateQuery.includes("/")) {
    const parts = dateQuery.split("/");
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  const slotsForDate = await getFirebaseSlots(formattedDate);
  
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

// Helper function to update local DB and automatically forward actual customer bookings to Google Sheets
async function processParsedSlotsAndForwardToSheets(
  parsedSlots: Array<{
    courtName: string;
    timeSlot: string;
    status: string;
    fullName?: string;
    phone?: string;
    price?: string;
    paymentStatus?: string;
  }>,
  formattedDate: string
) {
  if (!parsedSlots || parsedSlots.length === 0) return;

  console.log(`[processParsedSlotsAndForwardToSheets] Received ${parsedSlots.length} slots for ${formattedDate}`);

  // 1. Update the local database
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
      
      const dbHour = dbSlot.timeSlot.split(":")[0]?.trim();
      const psHour = ps.timeSlot.split(":")[0]?.trim();
      return namesMatch && dbHour && psHour && dbHour === psHour;
    });

    if (matched) {
      return { ...dbSlot, status: matched.status as "booked" | "locked" | "free" };
    }
    return dbSlot;
  });

  saveAloboBookings(updatedDb);

  // 2. Automatically forward bookings with actual customer details to Google Sheets
  const config = await getFirebaseConfig();
  if (!config.googleSheetSyncedSlots) {
    config.googleSheetSyncedSlots = [];
  }

  let sheetUpdated = false;

  for (const slot of parsedSlots) {
    if (slot.status === "booked") {
      const fullName = (slot.fullName || "Khách Alobo").trim();
      const phone = (slot.phone || "Alobo App").trim();

      // Only forward if there is an actual customer detail (either custom name or a real phone number)
      const hasRealName = fullName !== "Khách Alobo" && fullName !== "" && !fullName.toLowerCase().includes("locked") && !fullName.toLowerCase().includes("khoá");
      const hasRealPhone = phone !== "Alobo App" && phone !== "";

      if (hasRealName || hasRealPhone) {
        const slotKey = `${formattedDate}|${slot.courtName}|${slot.timeSlot}`;
        
        // Check if already synced to avoid duplicate rows
        if (!config.googleSheetSyncedSlots.includes(slotKey)) {
          console.log(`[Google Sheets Auto-Sync] Auto-forwarding detailed booking: ${fullName} (${phone}) on ${slot.courtName} at ${slot.timeSlot}`);
          
          const booking = {
            fullName: fullName,
            phone: phone,
            courtName: slot.courtName,
            date: formattedDate,
            timeSlot: slot.timeSlot,
            price: slot.price || "150.000 đ",
            paymentStatus: slot.paymentStatus || "Đã thanh toán (Alobo API)"
          };

          try {
            await forwardToGoogleSheets(booking);
            config.googleSheetSyncedSlots.push(slotKey);
            sheetUpdated = true;
          } catch (err) {
            console.error(`[Google Sheets Auto-Sync] Error forwarding detailed booking ${slotKey}:`, err);
          }
        }
      }
    }
  }

  if (sheetUpdated) {
    if (config.googleSheetSyncedSlots.length > 1000) {
      config.googleSheetSyncedSlots = config.googleSheetSyncedSlots.slice(-1000);
    }
    await saveFirebaseConfig(config);
  }
}

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
      Extract the court bookings / slot statuses for the pickleball facility (e.g. sport_pickle_bounce or courts Sân 1, Sân 2, Sân 3, Sân 4, Sân 5).
      We are interested in booking slots between 06:00 and 22:00.
      For each slot, determine:
      - courtName: Name of the court, e.g. "Sân 1", "Sân 2", etc.
      - timeSlot: The hourly time slot, e.g. "09:00 - 10:00", "07:00 - 08:00".
      - status: Must be strictly "booked" (occupied/reserved), "locked" (blocked by admin), or "free" (available).
      - fullName: Look deep into the JSON for user details, customer name, reservation name, or note associated with this slot. E.g., "Anh Khanh", "Anh Luân", "A Toàn". If no name is found, output "Khách Alobo".
      - phone: Search for a phone number associated with this customer or slot (usually starts with 0 or has 9-11 digits). If no phone number is found, output "Alobo App".
      - price: Search for price or amount. E.g. "150.000 đ". If not found, default to "150.000 đ".
      - paymentStatus: Search for payment status or payment method. E.g., "Đã thanh toán" or "Chưa thanh toán". Default to "Đã thanh toán (Alobo API)".

      Convert this raw API response into a structured JSON array matching this exact schema.
      Ensure the output is STRICTLY a JSON array, no markdown code blocks, no trailing comments.
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
              },
              fullName: { type: Type.STRING },
              phone: { type: Type.STRING },
              price: { type: Type.STRING },
              paymentStatus: { type: Type.STRING }
            },
            required: ["courtName", "timeSlot", "status"]
          }
        }
      }
    });

    const parsedText = modelResponse.text?.trim() || "[]";
    const parsedSlots = JSON.parse(parsedText) as Array<{ courtName: string; timeSlot: string; status: "booked" | "locked" | "free"; fullName?: string; phone?: string; price?: string; paymentStatus?: string }>;

    const formattedDate = new Date().toISOString().split('T')[0];
    
    await processParsedSlotsAndForwardToSheets(parsedSlots, formattedDate);

    return res.json({
      success: true,
      message: `Đồng bộ trực tiếp qua Alobo API và đẩy Google Sheets thành công! Đã phát hiện và đồng bộ ${parsedSlots.length} khung giờ.`,
      slots: parsedSlots
    });

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
      Extract the court bookings / slot statuses for the pickleball facility (e.g. sport_pickle_bounce or courts Sân 1, Sân 2, Sân 3, Sân 4, Sân 5).
      We are interested in booking slots between 06:00 and 22:00.
      For each slot, determine:
      - courtName: Name of the court, e.g. "Sân 1", "Sân 2", etc.
      - timeSlot: The hourly time slot, e.g. "09:00 - 10:00", "07:00 - 08:00".
      - status: Must be strictly "booked" (occupied/reserved), "locked" (blocked by admin), or "free" (available).
      - fullName: Look deep into the JSON for user details, customer name, reservation name, or note associated with this slot. E.g., "Anh Khanh", "Anh Luân", "A Toàn". If no name is found, output "Khách Alobo".
      - phone: Search for a phone number associated with this customer or slot (usually starts with 0 or has 9-11 digits). If no phone number is found, output "Alobo App".
      - price: Search for price or amount. E.g. "150.000 đ". If not found, default to "150.000 đ".
      - paymentStatus: Search for payment status or payment method. E.g., "Đã thanh toán" or "Chưa thanh toán". Default to "Đã thanh toán (Alobo API)".

      Convert this raw API response into a structured JSON array matching this exact schema.
      Ensure the output is STRICTLY a JSON array, no markdown code blocks, no trailing comments.
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
              },
              fullName: { type: Type.STRING },
              phone: { type: Type.STRING },
              price: { type: Type.STRING },
              paymentStatus: { type: Type.STRING }
            },
            required: ["courtName", "timeSlot", "status"]
          }
        }
      }
    });

    const parsedText = modelResponse.text?.trim() || "[]";
    const parsedSlots = JSON.parse(parsedText) as Array<{ courtName: string; timeSlot: string; status: "booked" | "locked" | "free"; fullName?: string; phone?: string; price?: string; paymentStatus?: string }>;

    if (parsedSlots && parsedSlots.length > 0) {
      await processParsedSlotsAndForwardToSheets(parsedSlots, formattedDate);

      const dbSlots = loadAloboBookings();
      return res.json({
        success: true,
        message: `Đồng bộ trực tiếp và tự động ghi nhận Google Sheets thành công cho ngày ${formattedDate}! Đã cập nhật ${parsedSlots.length} khung giờ.`,
        slots: dbSlots.filter(slot => slot.date === formattedDate)
      });
    }

    return res.status(400).json({ success: false, error: "Không tìm thấy dữ liệu đặt sân phù hợp trong JSON được gửi." });

  } catch (err: any) {
    console.error("Raw JSON sync error:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi khi xử lý JSON thô." });
  }
});

// 7. Paste raw copied text or HTML from Alobo detail page for AI-powered extraction
app.post("/api/alobo/parse-text-sync", async (req, res) => {
  try {
    const { rawText, date } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, error: "Thiếu dữ liệu văn bản để trích xuất." });
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
      You are an expert AI booking detail scraper. Analyze this raw text, HTML, or copy-pasted spreadsheet cells.
      Identify any and all booking entries within the text. Each booking entry should have a customer name, court name, and time slot.
      The text may be a single booking detail page, or multiple rows/columns copied from an Excel sheet or Google Sheet of bookings.
      
      Look for patterns like:
      - Customer Name (KH, Tên khách hàng, Họ tên, Tên, Người đặt, Khách hàng): E.g., "Anh Khanh", "Chị Hà", "A Toàn"
      - Phone Number (SĐT, Điện thoại, Số điện thoại, Sdt): usually starts with 0 and has 9-11 digits. If not found, use "Alobo App".
      - Court Name (Sân, Sân số, Court): E.g., "Sân 1", "Sân 2", etc.
      - Time Slot (Thời gian, Giờ, Giờ chơi, Khung giờ, Giờ đặt): E.g., "17:00 - 18:00", "08:00 - 09:00", etc. Format should be HH:mm - HH:mm.
      - Price (Tiền, Tổng đơn, Chuyển khoản, Đơn giá, Đơn giá/giờ, Tổng cộng): E.g., "150.000", "300.000 đ". If not found, use "150.000 đ".
      - Payment Status (Trạng thái, Giao dịch): E.g., "Đã thanh toán" or "Chưa thanh toán". If not found, use "Đã thanh toán (AI Copy-Paste)".

      Convert this raw text into a structured JSON ARRAY containing one or more booking objects matching this exact schema:
      [
        {
          "fullName": "Name of customer",
          "phone": "Phone number",
          "courtName": "Sân 1",
          "timeSlot": "17:00 - 18:00",
          "price": "150.000 đ",
          "paymentStatus": "Đã thanh toán (AI Copy-Paste)"
        }
      ]
      
      Ensure your outputs are completely accurate to the text. If any field is not found, use a reasonable default.
      Ensure the output is STRICTLY a JSON array, no markdown code blocks, no trailing comments.
    `;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: parsePrompt },
        { text: rawText }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              phone: { type: Type.STRING },
              courtName: { type: Type.STRING },
              timeSlot: { type: Type.STRING },
              price: { type: Type.STRING },
              paymentStatus: { type: Type.STRING }
            },
            required: ["fullName", "courtName", "timeSlot"]
          }
        }
      }
    });

    const parsedText = modelResponse.text?.trim() || "[]";
    const bookings = JSON.parse(parsedText) as Array<{
      fullName: string;
      phone?: string;
      courtName: string;
      timeSlot: string;
      price?: string;
      paymentStatus?: string;
      date?: string;
    }>;

    const results = [];
    if (bookings && bookings.length > 0) {
      const allSlots = loadAloboBookings();
      let updatedLocalDb = false;

      for (const booking of bookings) {
        if (!booking.fullName || !booking.courtName || !booking.timeSlot) continue;

        booking.date = formattedDate;
        if (!booking.phone) booking.phone = "Alobo App";
        if (!booking.price) booking.price = "150.000 đ";
        if (!booking.paymentStatus) booking.paymentStatus = "Đã thanh toán (AI Copy-Paste)";

        const result = await forwardToGoogleSheets(booking as any);
        results.push({ booking, result });

        // Update local database cache
        const targetCourt = booking.courtName;
        const targetTime = booking.timeSlot;
        
        allSlots.forEach(slot => {
          if (slot.date !== formattedDate) return;

          const isCourtMatch = slot.courtName.toLowerCase() === targetCourt.toLowerCase() ||
                               slot.courtName.includes(targetCourt) ||
                               targetCourt.includes(slot.courtName);
          
          const dbHour = slot.timeSlot.split(":")[0]?.trim();
          const bookingHour = targetTime.split(":")[0]?.trim();
          const isHourMatch = dbHour && bookingHour && dbHour === bookingHour;
          
          if (isCourtMatch && isHourMatch) {
            updatedLocalDb = true;
            slot.status = "booked" as "booked" | "locked" | "free";
          }
        });
      }

      if (updatedLocalDb) {
        saveAloboBookings(allSlots);
      }

      return res.json({
        success: true,
        message: `Trích xuất AI và đồng bộ Google Sheets thành công cho ${bookings.length} lượt đặt sân!`,
        bookings: bookings,
        results: results
      });
    }

    return res.status(400).json({ success: false, error: "Không tìm thấy dữ liệu đặt sân phù hợp trong văn bản được gửi." });

  } catch (err: any) {
    console.error("Parse text sync error:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi khi xử lý trích xuất văn bản AI." });
  }
});

// -------------------------------------------------------------
// CLOUD SYNCED WEBSITES & MEMBER DATA ENDPOINTS
// -------------------------------------------------------------

// Get all website bookings (persisted in Firestore if active, else local json)
app.get("/api/bookings", async (req, res) => {
  try {
    const list = await getFirebaseBookings();
    res.json({ success: true, bookings: list, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create/Update website booking
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = req.body;
    if (!booking.id) {
      booking.id = "B-" + Math.floor(1000 + Math.random() * 9000);
    }
    if (!booking.createdAt) {
      booking.createdAt = new Date().toISOString();
    }
    await saveFirebaseBooking(booking);
    res.json({ success: true, booking, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete website booking
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteFirebaseBooking(id);
    res.json({ success: true, message: `Deleted booking ${id}`, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all member registrations
app.get("/api/member-registrations", async (req, res) => {
  try {
    const list = await getFirebaseMembers();
    res.json({ success: true, memberRegistrations: list, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create/Update member registration
app.post("/api/member-registrations", async (req, res) => {
  try {
    const member = req.body;
    if (!member.id) {
      member.id = "MEM-" + Math.floor(1000 + Math.random() * 9000);
    }
    if (!member.createdAt) {
      member.createdAt = new Date().toLocaleString("vi-VN");
    }
    await saveFirebaseMember(member);
    res.json({ success: true, memberRegistration: member, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Parse raw member registration lists via Gemini and import them
app.post("/api/member-registrations/parse-raw", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, error: "Thiếu dữ liệu danh sách để phân tích." });
    }

    if (!ai) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY chưa cấu hình." });
    }

    const todayStr = new Date().toLocaleDateString("vi-VN"); // e.g. 20/07/2026

    const parsePrompt = `
      Bạn là một trợ lý AI phân tích danh sách đăng ký hội viên của sân Pickleball.
      Hãy phân tích nội dung danh sách thô, bảng Excel dán vào, hoặc CSV sau đây để trích xuất danh sách hội viên đăng ký gói tập.
      Hãy chuyển đổi thông tin về cấu trúc JSON hợp lệ khớp với các trường sau đây.

      Lưu ý đặc biệt cho các trường số:
      - totalPrice, depositAmount, remainingAmount, actualPaid: Phải là kiểu số nguyên (number). Hãy loại bỏ tất cả ký tự dấu chấm ".", chữ "đ", "VND", khoảng trắng... Ví dụ: "5.000.000 đ" thành 5000000. Nếu không thấy ghi cọc/trả, đặt depositAmount và actualPaid bằng totalPrice, và remainingAmount bằng 0.
      - durationMonths (Thời hạn tháng): Kiểu số nguyên. Ví dụ: "Combo 10 Buổi Nhập Môn" thường hạn dùng là 3 tháng. Nếu không chỉ rõ, tự ước lượng hợp lý (thường là 3 hoặc 6).

      Lưu ý cho ngày tháng:
      - contractDate (Ngày ký HĐ): Hãy trích xuất ngày ký HĐ dưới định dạng "dd/mm/yyyy" (ví dụ: "20/07/2026"). Nếu chỉ có ngày tháng như "18/07", hãy thêm năm 2026 thành "18/07/2026". Nếu không tìm thấy, mặc định dùng ngày hiện tại: "${todayStr}".
      - dob (Ngày sinh): Định dạng "YYYY-MM-DD" nếu có. Nếu không có đặt chuỗi rỗng "".

      Lưu ý cho gói tập:
      - packageType (Gói tập): Tên gói tập (ví dụ: "Combo 10 Buổi Nhập Môn", "Combo 20 Buổi Chuyên Sâu", "Gói tháng", v.v.)
      - hoursCount (Số giờ tập): ví dụ: "10 giờ tập", "20 giờ tập", "Gói tháng".
      - coachName (Tên HLV): ví dụ: "Coach Lisa", "Coach Tommy", hoặc để trống nếu không có.
      - serviceType (Dịch vụ): ví dụ: "Tập luyện cá nhân 1-1", "Học viên lớp nhóm", hoặc tự suy luận.
      - status: Chỉ được là 'confirmed' hoặc 'pending'. Mặc định 'confirmed'.
    `;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: parsePrompt },
        { text: rawText }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              phone: { type: Type.STRING },
              contractDate: { type: Type.STRING },
              dob: { type: Type.STRING },
              preferredTime: { type: Type.STRING },
              hoursCount: { type: Type.STRING },
              packageType: { type: Type.STRING },
              durationMonths: { type: Type.INTEGER },
              coachName: { type: Type.STRING },
              serviceType: { type: Type.STRING },
              totalPrice: { type: Type.INTEGER },
              depositAmount: { type: Type.INTEGER },
              remainingAmount: { type: Type.INTEGER },
              actualPaid: { type: Type.INTEGER },
              status: { 
                type: Type.STRING,
                description: "Must be 'confirmed' or 'pending'"
              }
            },
            required: ["fullName", "phone", "packageType"]
          }
        }
      }
    });

    const parsedText = modelResponse.text?.trim() || "[]";
    const importedMembers = JSON.parse(parsedText) as any[];

    const savedList: any[] = [];
    for (const m of importedMembers) {
      if (!m.id) {
        m.id = "MEM-" + Math.floor(1000 + Math.random() * 9000);
      }
      if (!m.createdAt) {
        m.createdAt = new Date().toLocaleString("vi-VN");
      }
      if (!m.contractDate) {
        m.contractDate = todayStr;
      }
      // Ensure numeric values are numbers
      m.totalPrice = Number(m.totalPrice) || 0;
      m.depositAmount = m.depositAmount !== undefined ? Number(m.depositAmount) : m.totalPrice;
      m.actualPaid = m.actualPaid !== undefined ? Number(m.actualPaid) : m.totalPrice;
      m.remainingAmount = m.remainingAmount !== undefined ? Number(m.remainingAmount) : (m.totalPrice - m.depositAmount);
      m.durationMonths = Number(m.durationMonths) || 3;
      m.status = m.status || 'confirmed';

      await saveFirebaseMember(m);
      savedList.push(m);
    }

    res.json({
      success: true,
      message: `Đã tự động trích xuất và nhập thành công ${savedList.length} hội viên bằng AI!`,
      members: savedList,
      isFirebaseActive
    });

  } catch (err: any) {
    console.error("AI Member Import Error:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi khi trích xuất danh sách hội viên bằng AI." });
  }
});

// Delete member registration
app.delete("/api/member-registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteFirebaseMember(id);
    res.json({ success: true, message: `Deleted member registration ${id}`, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Import/Initialize Firebase with frontend state
app.post("/api/firebase/bulk-sync", async (req, res) => {
  try {
    const { bookings, memberRegistrations } = req.body;
    let syncedCount = 0;

    if (isFirebaseActive && firestoreDb) {
      if (Array.isArray(bookings)) {
        for (const bk of bookings) {
          await saveFirebaseBooking(bk);
          syncedCount++;
        }
      }
      if (Array.isArray(memberRegistrations)) {
        for (const mb of memberRegistrations) {
          await saveFirebaseMember(mb);
          syncedCount++;
        }
      }
      res.json({ success: true, message: `Đã đồng bộ thành công ${syncedCount} bản ghi lên Firebase đám mây!`, isFirebaseActive });
    } else {
      res.status(400).json({ success: false, error: "Firebase chưa được kích hoạt hoặc không thể kết nối." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Firebase status endpoint
app.get("/api/firebase/status", (req, res) => {
  res.json({
    success: true,
    isFirebaseActive,
    projectId: isFirebaseActive ? (JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf-8")).projectId) : null
  });
});

// Landing Page endpoints
app.get("/api/landing-page", async (req, res) => {
  try {
    const config = await getFirebaseLandingPageConfig();
    res.json({ success: true, config, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/landing-page", async (req, res) => {
  try {
    const config = req.body;
    await saveFirebaseLandingPageConfig(config);
    res.json({ success: true, config, isFirebaseActive });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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
