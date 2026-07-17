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
    fs.writeFileSync(DB_PATH, JSON.stringify(slots, null, 2), "utf-8");
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

// 1. Get Synced Booking Schedule
app.get("/api/alobo/sync", (req, res) => {
  const dateQuery = req.query.date as string || "2026-07-16";
  const allSlots = loadAloboBookings();
  
  // Filter by requested date (if matches), or map slots to dynamic date queries for realistic scheduling!
  const slotsForDate = allSlots.map(slot => ({
    ...slot,
    date: dateQuery // dynamically apply to requested date for fully responsive UI!
  }));
  
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
    const { slots: incomingSlots } = req.body;
    if (!incomingSlots || !Array.isArray(incomingSlots)) {
      return res.status(400).json({ success: false, error: "Invalid data format. Expected 'slots' array." });
    }

    const currentSlots = loadAloboBookings();

    // Update current database with matching court name and hour slot from incoming scraped data
    const updatedSlots = currentSlots.map(dbSlot => {
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
      message: `Đồng bộ trực tiếp thành công! Đã cập nhật ${incomingSlots.length} khung giờ từ Tampermonkey.`,
      lastUpdated: new Date().toLocaleString("vi-VN"),
      slots: updatedSlots
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
    const { rawJson } = req.body;
    if (!rawJson) {
      return res.status(400).json({ success: false, error: "Thiếu dữ liệu JSON của Alobo." });
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
        message: `Đồng bộ thủ công qua API Response thành công! Đã cập nhật ${parsedSlots.length} khung giờ.`,
        slots: updatedDb
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
