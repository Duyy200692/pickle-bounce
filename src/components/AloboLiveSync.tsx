import React, { useState, useEffect, useRef } from "react";
import { 
  RefreshCw, Upload, Sparkles, Check, AlertCircle, 
  HelpCircle, ShieldAlert, Zap, Calendar, Play, Copy, Code, ExternalLink, Terminal,
  Globe, Send, FileText, Database
} from "lucide-react";
import { motion } from "motion/react";

interface SyncedSlot {
  courtName: string;
  timeSlot: string;
  status: "booked" | "locked" | "free";
  date: string;
}

export default function AloboLiveSync() {
  const [date, setDate] = useState("2026-07-16");
  const [slots, setSlots] = useState<SyncedSlot[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"userscript" | "direct-api" | "paste-json">("userscript");
  const [copied, setCopied] = useState(false);

  // Direct API Sync States
  const [apiUrl, setApiUrl] = useState("https://user-global.alobo.vn/v2/user/branch/detail/sport_pickle_bounce");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiHeadersText, setApiHeadersText] = useState("");
  const [apiBodyText, setApiBodyText] = useState("");
  
  // Raw JSON Paste Sync States
  const [rawJsonText, setRawJsonText] = useState("");

  // Drag and drop states
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic host detection for Userscript output
  const appOrigin = typeof window !== "undefined" ? window.location.origin : "https://ais-pre-m4i6tghifj35swvbdvdnxq-197039547577.asia-southeast1.run.app";

  const fetchSyncData = async (targetDate: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/alobo/sync?date=${targetDate}`);
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
        setLastUpdated(data.lastUpdated);
        setError(null);
      } else {
        setError("Không thể tải dữ liệu đồng bộ.");
      }
    } catch (err) {
      setError("Không kết nối được với máy chủ backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // Call server to fetch from direct Alobo API
  const handleFetchFromLiveApi = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccess(null);
    try {
      let parsedHeaders = {};
      if (apiHeadersText.trim()) {
        try {
          parsedHeaders = JSON.parse(apiHeadersText);
        } catch (e) {
          setError("Headers phải ở định dạng JSON thô hợp lệ. Ví dụ: { \"Authorization\": \"Bearer token\" }");
          setIsSyncing(false);
          return;
        }
      }

      let parsedBody = null;
      if (apiBodyText.trim()) {
        try {
          parsedBody = JSON.parse(apiBodyText);
        } catch (e) {
          parsedBody = apiBodyText; // fallback as string
        }
      }

      const response = await fetch("/api/alobo/fetch-live-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: apiUrl,
          headers: parsedHeaders,
          method: apiMethod,
          body: parsedBody
        })
      });

      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
        setSuccess(data.message);
      } else {
        setError(data.error || "Không thể đồng bộ từ API. Vui lòng kiểm tra lại URL/Headers.");
      }
    } catch (err: any) {
      setError("Lỗi kết nối khi đồng bộ API: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Call server to parse pasted JSON
  const handleSyncRawJson = async () => {
    if (!rawJsonText.trim()) {
      setError("Vui lòng dán dữ liệu JSON phản hồi từ API của Alobo.");
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSuccess(null);
    try {
      let parsedJson;
      try {
        parsedJson = JSON.parse(rawJsonText);
      } catch (e) {
        parsedJson = rawJsonText; // send as string if not valid JSON, backend will handle it
      }

      const response = await fetch("/api/alobo/sync-raw-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawJson: parsedJson })
      });

      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
        setSuccess(data.message);
      } else {
        setError(data.error || "Không thể phân tách được JSON phản hồi. Vui lòng thử lại.");
      }
    } catch (err: any) {
      setError("Lỗi kết nối khi gửi dữ liệu JSON: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Poll for live real-time updates every 3 seconds to ensure ultra-fresh states!
  useEffect(() => {
    fetchSyncData(date);
    const interval = setInterval(() => {
      fetchSyncData(date);
    }, 3000);
    return () => clearInterval(interval);
  }, [date]);

  // Handle simulated real-time booking from alobo.vn
  const handleSimulateBooking = async () => {
    setSimulating(true);
    try {
      const response = await fetch("/api/alobo/simulate-booking", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => setSuccess(null), 4000);
        fetchSyncData(date);
      } else {
        setError(data.message);
        setTimeout(() => setError(null), 4000);
      }
    } catch (err) {
      setError("Không thể kết nối máy chủ giả lập.");
    } finally {
      setSimulating(false);
    }
  };

  // Reset alobo bookings
  const handleReset = async () => {
    try {
      const response = await fetch("/api/alobo/reset", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
        setSuccess("Đã đặt lại trạng thái sân mặc định thành công!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Lỗi khi khôi phục trạng thái sân.");
    }
  };

  // Handle Drag & Drop / Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng tải lên một tệp hình ảnh hợp lệ (PNG, JPEG, v.v.)");
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Clean = base64Data.split(",")[1]; // remove prefix

        // Post to Gemini scan endpoint
        const response = await fetch("/api/alobo/sync-screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Image: base64Clean,
            mimeType: file.type
          })
        });

        const data = await response.json();
        if (data.success) {
          setSlots(data.slots);
          setSuccess(data.message);
          setIsDragActive(false);
        } else {
          setError(data.error || "Không thể nhận dạng ảnh đặt sân. Đảm bảo ảnh rõ nét.");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Có lỗi xảy ra trong quá trình xử lý tệp ảnh.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Courts matching alobo.vn
  const courtsList = ["Sân 1", "Sân 2", "Sân 3", "Sân 4", "Sân 5"];
  
  // Time slots matching alobo.vn
  const hourHeaders = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  // Map 1-hour slots correctly to visual grid matching alobo
  const getSlotStatus = (courtName: string, hourStr: string) => {
    const matched = slots.find(s => {
      const isCourt = s.courtName.toLowerCase() === courtName.toLowerCase() || s.courtName.includes(courtName);
      const isHour = s.timeSlot.startsWith(hourStr);
      return isCourt && isHour;
    });
    return matched ? matched.status : "free";
  };

  // Generated Userscript Content
  const userscriptCode = `// ==UserScript==
// @name         Alobo Live Real-time Sync (Pickle Bounce)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Tự động đồng bộ tình trạng đặt sân từ alobo.vn sang Pickle Bounce của bạn theo thời gian thực!
// @author       Pickle Bounce Dev
// @match        https://datlich.alobo.vn/userBooking*
// @match        https://datlich.alobo.vn/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    console.log("[Alobo Sync] Trình cào dữ liệu thời gian thực đã hoạt động!");

    // URL trang Pickle Bounce của bạn (Tự động nhận diện)
    const TARGET_BACKEND = "${appOrigin}";

    function scrapeAndSync() {
        const slots = [];
        
        // 1. Tìm tất cả hàng biểu thị thông tin sân
        const rows = document.querySelectorAll("tr");
        if (rows.length === 0) return;

        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll("td");
            if (cells.length === 0) return;
            
            // Lấy tên sân từ cột đầu tiên
            let courtName = cells[0].textContent?.trim() || "";
            if (!courtName.includes("Sân")) {
                const possibleCourt = row.querySelector(".court-name, th");
                if (possibleCourt) courtName = possibleCourt.textContent?.trim() || "";
            }
            
            if (!courtName) {
                courtName = "Sân " + rowIndex;
            }

            // Danh sách giờ tương ứng các cột của Alobo
            const hours = [
                "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
                "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
            ];

            cells.forEach((cell, cellIdx) => {
                if (cellIdx === 0) return; // Bỏ qua cột tên sân
                
                const hourStr = hours[cellIdx - 1];
                if (!hourStr) return;

                // Kiểm tra màu nền computed để xác định trạng thái đặt lịch
                const bg = window.getComputedStyle(cell).backgroundColor;
                let status = "free";

                // Đã đặt (Màu đỏ sẫm)
                if (bg.includes("211") || bg.includes("178") || bg.includes("220") || bg.includes("dc3545") || bg.includes("red")) {
                    status = "booked";
                } 
                // Khoá (Màu xám)
                else if (bg.includes("161") || bg.includes("108") || bg.includes("gray") || bg.includes("grey") || bg.includes("128")) {
                    status = "locked";
                }

                slots.push({
                    courtName: courtName,
                    timeSlot: hourStr + " - " + (parseInt(hourStr) + 1) + ":00",
                    status: status
                });
            });
        });

        // 2. Gửi dữ liệu cào được về máy chủ Pickle Bounce
        if (slots.length > 0) {
            GM_xmlhttpRequest({
                method: "POST",
                url: TARGET_BACKEND + "/api/alobo/sync-scraped",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({ slots: slots }),
                onload: function(response) {
                    console.log("[Alobo Sync] Đồng bộ thành công:", response.responseText);
                    updateFloatingBadge(true);
                },
                onerror: function(err) {
                    console.error("[Alobo Sync] Lỗi gửi dữ liệu:", err);
                    updateFloatingBadge(false);
                }
            });
        }
    }

    // Tạo widget trạng thái nhỏ góc phải màn hình Alobo để quản lý viên dễ theo dõi
    let badge = document.getElementById("alobo-sync-badge");
    if (!badge) {
        badge = document.createElement("div");
        badge.id = "alobo-sync-badge";
        badge.style.position = "fixed";
        badge.style.bottom = "20px";
        badge.style.right = "20px";
        badge.style.padding = "12px 18px";
        badge.style.backgroundColor = "#2D61E5";
        badge.style.color = "white";
        badge.style.borderRadius = "14px";
        badge.style.fontSize = "12px";
        badge.style.fontWeight = "bold";
        badge.style.zIndex = "999999";
        badge.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
        badge.style.fontFamily = "sans-serif";
        badge.style.display = "flex";
        badge.style.alignItems = "center";
        badge.style.gap = "8px";
        badge.style.transition = "all 0.3s ease";
        document.body.appendChild(badge);
    }

    function updateFloatingBadge(isSuccess) {
        if (!badge) return;
        if (isSuccess) {
            badge.style.backgroundColor = "#10B981";
            badge.innerHTML = '⚡ <span>Pickle Bounce: Live Sync Active (' + new Date().toLocaleTimeString() + ')</span>';
        } else {
            badge.style.backgroundColor = "#EF4444";
            badge.innerHTML = '❌ <span>Pickle Bounce: Sync Error</span>';
        }
    }

    // Cào và cập nhật tự động mỗi 2 giây
    setInterval(scrapeAndSync, 2000);
    scrapeAndSync();

})();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userscriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="alobo-live-sync" className="py-20 bg-[#f4fbf7] border-t border-brand-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full text-emerald-800 text-xs font-bold mb-3 animate-pulse-gentle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              KẾT NỐI ALOBO LIVE SYNC HOẠT ĐỘNG
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark tracking-tight leading-none">
              Đặt Lịch Ngày Trực Quan (Thời gian thực)
            </h2>
            <p className="font-sans text-sm text-brand-gray mt-2.5 max-w-xl">
              Trang web của chúng tôi liên tục đồng bộ dữ liệu thời gian thực với hệ thống đặt sân <span className="font-semibold text-brand-blue">alobo.vn</span>. Giúp bạn luôn theo dõi chính xác trạng thái trống sân.
            </p>
          </div>

          {/* Date Selector & Sync Info */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-brand-border/60 shadow-sm">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="font-sans font-bold text-xs text-brand-dark outline-none bg-transparent"
              />
            </div>

            <button 
              onClick={() => fetchSyncData(date)}
              disabled={isLoading}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white flex items-center gap-2 font-sans font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Legend status markers */}
        <div className="flex flex-wrap items-center gap-6 mb-6 bg-white p-4 rounded-2xl border border-brand-border/40 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-white border border-gray-300 rounded shadow-inner"></span>
            <span className="font-sans font-bold text-xs text-brand-dark">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[#D34F4F] rounded border border-[#b23e3e]"></span>
            <span className="font-sans font-bold text-xs text-brand-dark">Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[#A1A1A1] rounded border border-[#808080]"></span>
            <span className="font-sans font-bold text-xs text-brand-dark">Khoá</span>
          </div>
          <div className="md:ml-auto text-xs font-mono text-brand-gray flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Cập nhật mới nhất: <strong className="text-emerald-700">{lastUpdated || "Đang kết nối..."}</strong></span>
          </div>
        </div>

        {/* Real-time Grid View (Matching exactly alobo visual layout) */}
        <div className="bg-white rounded-3xl border border-brand-border/40 shadow-xl overflow-x-auto relative mb-12">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-brand-blue animate-spin" />
                <span className="font-sans text-xs text-brand-gray font-bold">Đang đồng bộ dữ liệu alobo...</span>
              </div>
            </div>
          )}
          
          <div className="min-w-[1000px] p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-[12%] pb-4 text-left font-display font-black text-xs text-brand-dark uppercase tracking-wider">
                    Sân đấu
                  </th>
                  {hourHeaders.map(h => (
                    <th key={h} className="pb-4 text-center font-sans font-bold text-[11px] text-brand-gray/80 w-[5.5%] border-b border-brand-border/20">
                      <div>{h}</div>
                      <div className="h-1.5 w-0.5 bg-yellow-500 mx-auto mt-1"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courtsList.map((court, idx) => (
                  <tr key={idx} className="hover:bg-brand-light-gray/25 transition-colors">
                    {/* Court label with Category headers */}
                    <td className="py-4 font-display font-bold text-sm text-brand-dark border-r border-brand-border/20 pr-4">
                      <div className="flex flex-col">
                        <span className="text-brand-blue">{court}</span>
                        <span className="text-[10px] font-medium text-brand-gray/60 mt-0.5">
                          {idx < 2 ? "Sân ngoài trời" : "Sân trong nhà"}
                        </span>
                      </div>
                    </td>
                    {/* Hour boxes */}
                    {hourHeaders.map(h => {
                      const status = getSlotStatus(court, h);
                      let bgColor = "bg-white hover:bg-brand-blue-light/20 cursor-pointer";
                      let borderColor = "border-gray-200";
                      
                      if (status === "booked") {
                        bgColor = "bg-[#D34F4F]";
                        borderColor = "border-[#b23e3e]";
                      } else if (status === "locked") {
                        bgColor = "bg-[#A1A1A1]";
                        borderColor = "border-[#808080]";
                      }

                      return (
                        <td key={h} className="py-2.5 px-0.5 border-b border-brand-border/20">
                          <div 
                            className={`h-9 w-full rounded border ${bgColor} ${borderColor} transition-all duration-300 shadow-sm flex items-center justify-center`}
                            title={`${court} lúc ${h} - Trạng thái: ${status === "booked" ? "Đã đặt" : status === "locked" ? "Khoá" : "Trống"}`}
                          >
                            {status === "booked" && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tab Selection Area for Synchronizers */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6 border-b border-brand-border/20 pb-3">
          <button 
            onClick={() => setActiveTab("userscript")}
            className={`font-display font-black text-sm px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "userscript" 
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" 
                : "text-brand-gray hover:text-brand-dark hover:bg-brand-light-gray"
            }`}
          >
            <Code className="w-4 h-4" />
            Phương án 1: Tampermonkey Userscript (Tự động)
          </button>
          
          <button 
            onClick={() => setActiveTab("direct-api")}
            className={`font-display font-black text-sm px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "direct-api" 
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" 
                : "text-brand-gray hover:text-brand-dark hover:bg-brand-light-gray"
            }`}
          >
            <Globe className="w-4 h-4" />
            Phương án 2: Gọi trực tiếp Alobo API (Bypass CORS)
          </button>

          <button 
            onClick={() => setActiveTab("paste-json")}
            className={`font-display font-black text-sm px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "paste-json" 
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" 
                : "text-brand-gray hover:text-brand-dark hover:bg-brand-light-gray"
            }`}
          >
            <Database className="w-4 h-4" />
            Phương án 3: Dán dữ liệu JSON phản hồi (Cực nhanh)
          </button>
        </div>

        {/* Sync Panel Content based on Active Tab */}
        <div className="bg-white p-8 rounded-3xl border border-brand-border/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-emerald-400 to-yellow-400"></div>

          {isSyncing && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-brand-blue animate-pulse" />
              </div>
              <h4 className="font-display font-black text-base text-brand-dark mb-1">
                Đang xử lý đồng bộ dữ liệu...
              </h4>
              <p className="font-sans text-xs text-brand-gray max-w-sm">
                Đang truyền gửi yêu cầu và phân tích thông qua trí tuệ nhân tạo Gemini để đồng bộ lịch đặt sân.
              </p>
            </div>
          )}

          {activeTab === "userscript" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left side: Guide & Info */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-brand-blue-light text-brand-blue rounded-2xl flex items-center justify-center">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-brand-dark">
                        Tự động đồng bộ bằng Userscript
                      </h3>
                      <span className="text-xs text-brand-gray">Thời gian thực mỗi 2 giây</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-brand-gray leading-relaxed">
                    Phương pháp này cho phép trình duyệt tự động đọc trạng thái trống sân trực tiếp từ tab alobo.vn đang mở và đồng bộ không dây về hệ thống này hoàn toàn ngầm.
                  </p>

                  <div className="space-y-3.5">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-brand-dark">
                      Hướng dẫn nhanh trong 3 bước:
                    </h4>
                    
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue font-sans font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="font-sans text-xs text-brand-gray leading-tight">
                        Cài tiện ích <strong className="text-brand-dark">Tampermonkey</strong> từ Chrome Web Store.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue font-sans font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="font-sans text-xs text-brand-gray leading-tight">
                        Chọn <strong className="text-brand-dark">Create a new script</strong> trong menu Tampermonkey.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue font-sans font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="font-sans text-xs text-brand-gray leading-tight">
                        Dán đè toàn bộ mã nguồn bên phải vào rồi nhấn <strong className="text-brand-dark">Save (Ctrl+S)</strong>.
                      </div>
                    </div>
                  </div>

                  {/* Status indicator info */}
                  <div className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-4 flex gap-3 items-start">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="font-sans text-[11px] text-emerald-800 leading-relaxed">
                      <strong>Đang hoạt động:</strong> Khi bạn mở trang 
                      <a href="https://datlich.alobo.vn/userBooking" target="_blank" rel="noreferrer" className="text-brand-blue underline mx-1 font-bold inline-flex items-center gap-0.5">
                        alobo.vn/userBooking <ExternalLink className="w-2.5 h-2.5" />
                      </a>, dữ liệu được truyền liên tục về đây cực kỳ mượt mà.
                    </div>
                  </div>
                </div>

                {/* Simulated actions integrated here for better density */}
                <div className="pt-6 border-t border-brand-border/40 space-y-3">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-brand-dark block">
                    Thử nghiệm đồng bộ nhanh (Simulator):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleSimulateBooking}
                      disabled={simulating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 font-sans font-bold text-[11px] py-2.5 px-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      {simulating ? "Đang giả lập..." : "Giả lập Đặt sân"}
                    </button>

                    <button 
                      onClick={handleReset}
                      className="bg-brand-light-gray hover:bg-brand-border/40 text-brand-dark border border-brand-border/30 flex items-center justify-center gap-1.5 font-sans font-bold text-[11px] py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-brand-gray" />
                      Reset sân đấu
                    </button>
                  </div>

                  {/* Error / Success Notifications */}
                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: Code viewer with Copy & Download */}
              <div className="lg:col-span-7 flex flex-col h-full bg-brand-dark rounded-2xl overflow-hidden shadow-2xl min-h-[420px]">
                <div className="flex justify-between items-center bg-zinc-900 px-5 py-3.5 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="font-mono text-xs text-zinc-500 ml-2">alobo-sync.user.js</span>
                  </div>

                  <button 
                    onClick={copyToClipboard}
                    className="bg-brand-blue hover:bg-brand-blue-hover text-white flex items-center gap-2 font-sans font-bold text-xs px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Đã sao chép!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Sao chép mã nguồn
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 overflow-y-auto h-[380px] font-mono text-[10.5px] text-zinc-300 bg-zinc-950 leading-relaxed select-all scrollbar-thin whitespace-pre-wrap">
                  {userscriptCode}
                </div>
              </div>
            </div>
          )}

          {activeTab === "direct-api" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left side: Guide & Instructions */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-brand-blue-light text-brand-blue rounded-2xl flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-dark">
                      Kết nối trực tiếp qua API Alobo
                    </h3>
                    <span className="text-xs text-brand-gray">Gọi API không bị rào cản CORS</span>
                  </div>
                </div>

                <p className="font-sans text-xs text-brand-gray leading-relaxed">
                  Vì trình duyệt chặn các yêu cầu trực tiếp từ trang web này đến hệ thống <code>user-global.alobo.vn</code> (lỗi CORS), chúng tôi đã xây dựng một <strong>Cơ chế ủy nhiệm (Server Proxy)</strong> ở máy chủ Node.js của chúng tôi.
                </p>

                <div className="bg-yellow-50 border border-yellow-200/50 rounded-2xl p-4 space-y-2">
                  <h4 className="font-display font-bold text-xs text-yellow-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    Cách tìm API đặt sân thực tế:
                  </h4>
                  <ol className="list-decimal pl-4 font-sans text-[11px] text-yellow-900 space-y-1">
                    <li>Mở trang đặt sân trên Alobo bằng Chrome.</li>
                    <li>F12 mở <strong>Network tab</strong>, chọn lọc <strong>Fetch/XHR</strong>.</li>
                    <li>Bấm tải lại trang hoặc bấm đổi ngày trên lịch đặt sân.</li>
                    <li>Tìm một request gọi tới <code>user-global.alobo.vn/v2/user/...</code> (thường chứa chữ <code>booking</code>, <code>matrix</code> hoặc <code>get_slots</code>).</li>
                    <li>Nhấp chuột phải chọn <strong>Copy URL</strong> và dán vào ô bên phải. Đừng quên sao chép các Header quan trọng như <code>Authorization</code> hoặc <code>Cookie</code> (nếu có)!</li>
                  </ol>
                </div>
              </div>

              {/* Right side: Config inputs */}
              <div className="lg:col-span-7 bg-brand-light-gray/40 border border-brand-border/40 p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label className="block text-[11px] font-bold text-brand-dark mb-1 uppercase">Phương thức</label>
                    <select 
                      value={apiMethod} 
                      onChange={(e) => setApiMethod(e.target.value)}
                      className="w-full bg-white border border-brand-border/60 rounded-xl px-3 py-2 text-xs font-sans font-bold text-brand-dark outline-none focus:border-brand-blue"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>
                  <div className="col-span-9">
                    <label className="block text-[11px] font-bold text-brand-dark mb-1 uppercase">Đường dẫn Request URL</label>
                    <input 
                      type="text" 
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://user-global.alobo.vn/v2/user/branch/detail/sport_pickle_bounce"
                      className="w-full bg-white border border-brand-border/60 rounded-xl px-3 py-2 text-xs font-sans text-brand-dark outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-brand-dark uppercase">Headers tùy chỉnh (Định dạng JSON)</label>
                    <span className="text-[10px] text-brand-gray">Nhập JSON: {"{ \"Authorization\": \"Bearer ...\" }"}</span>
                  </div>
                  <textarea 
                    value={apiHeadersText}
                    onChange={(e) => setApiHeadersText(e.target.value)}
                    placeholder='{
  "Authorization": "Nhập token Alobo của bạn tại đây nếu cần"
}'
                    rows={3}
                    className="w-full bg-white border border-brand-border/60 rounded-xl p-3 text-xs font-mono text-brand-dark outline-none focus:border-brand-blue resize-none"
                  />
                </div>

                {apiMethod !== "GET" && (
                  <div>
                    <label className="block text-[11px] font-bold text-brand-dark mb-1 uppercase">Request Body (JSON)</label>
                    <textarea 
                      value={apiBodyText}
                      onChange={(e) => setApiBodyText(e.target.value)}
                      placeholder='{
  "branch_slug": "sport_pickle_bounce",
  "date": "2026-07-16"
}'
                      rows={3}
                      className="w-full bg-white border border-brand-border/60 rounded-xl p-3 text-xs font-mono text-brand-dark outline-none focus:border-brand-blue resize-none"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={handleFetchFromLiveApi}
                    disabled={isSyncing}
                    className="bg-brand-blue hover:bg-brand-blue-hover text-white flex items-center justify-center gap-2 font-sans font-bold text-xs px-6 py-3 rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSyncing ? "Đang đồng bộ qua Proxy..." : "Kết nối & Đồng bộ ngay"}
                  </button>

                  <button 
                    onClick={() => {
                      setApiUrl("https://user-global.alobo.vn/v2/user/branch/detail/sport_pickle_bounce");
                      setApiMethod("GET");
                      setApiHeadersText("");
                      setApiBodyText("");
                    }}
                    className="bg-white hover:bg-brand-light-gray/40 text-brand-gray border border-brand-border/60 flex items-center justify-center gap-2 font-sans font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Nhập lại mặc định
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "paste-json" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left side: Instructions */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-brand-blue-light text-brand-blue rounded-2xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-dark">
                      Phân tích JSON bằng AI Gemini
                    </h3>
                    <span className="text-xs text-brand-gray">Dán trực tiếp phản hồi từ API Alobo</span>
                  </div>
                </div>

                <p className="font-sans text-xs text-brand-gray leading-relaxed">
                  Nếu bạn không muốn thiết lập Proxy rắc rối, bạn chỉ cần sao chép toàn bộ <strong>Phản hồi JSON (Response JSON)</strong> từ tab Network của Alobo và dán trực tiếp vào đây. Trí tuệ nhân tạo Gemini sẽ ngay lập tức đọc hiểu cấu trúc bất kỳ và chuyển đổi tự động về dữ liệu lịch đặt sân của bạn!
                </p>

                <div className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-4 space-y-2 text-[11px] text-emerald-900">
                  <span className="font-display font-bold uppercase tracking-wider block">Ưu điểm vượt trội:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Hoàn toàn an toàn:</strong> Không cần gửi Token hay Cookie của bạn đi.</li>
                    <li><strong>Thông minh 100%:</strong> Bất kể định dạng JSON của Alobo thay đổi thế nào, Gemini vẫn phân tích chính xác tuyệt đối.</li>
                    <li><strong>Tốc độ cực nhanh:</strong> Cập nhật trạng thái sân chỉ sau 2 giây.</li>
                  </ul>
                </div>
              </div>

              {/* Right side: Input JSON field */}
              <div className="lg:col-span-7 bg-brand-light-gray/40 border border-brand-border/40 p-6 rounded-2xl flex flex-col space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-dark mb-1 uppercase">Dán dữ liệu JSON phản hồi (Response) từ Alobo</label>
                  <textarea 
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    placeholder='Nhấp chuột phải vào request "sport_pickle_bounce" -> Copy -> Copy Response. Rồi dán vào đây...'
                    rows={12}
                    className="w-full bg-white border border-brand-border/60 rounded-xl p-3 text-[10.5px] font-mono text-brand-dark outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleSyncRawJson}
                    disabled={isSyncing}
                    className="bg-brand-blue hover:bg-brand-blue-hover text-white flex items-center justify-center gap-2 font-sans font-bold text-xs px-6 py-3 rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isSyncing ? "Gemini đang đọc hiểu..." : "Phân tích bằng AI Gemini & Đồng bộ"}
                  </button>

                  <button 
                    onClick={() => setRawJsonText("")}
                    className="bg-white hover:bg-brand-light-gray/40 text-brand-gray border border-brand-border/60 flex items-center justify-center gap-2 font-sans font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Xóa trống
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
