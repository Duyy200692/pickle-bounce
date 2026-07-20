import React, { useState, useEffect } from "react";
import { RefreshCw, Calendar } from "lucide-react";

interface SyncedSlot {
  courtName: string;
  timeSlot: string;
  status: "booked" | "locked" | "free";
  date: string;
}

const INITIAL_SLOTS: SyncedSlot[] = [
  // Sân 1
  { courtName: "Sân 1", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "09:00 - 10:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "10:00 - 11:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "14:00 - 15:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "15:00 - 16:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "16:00 - 17:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "17:00 - 18:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "19:00 - 20:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "20:00 - 21:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 1", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-20" },

  // Sân 2
  { courtName: "Sân 2", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "13:00 - 14:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "14:00 - 15:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "15:00 - 16:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "16:00 - 17:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "19:00 - 20:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "20:00 - 21:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 2", timeSlot: "21:00 - 22:00", status: "booked", date: "2026-07-20" },

  // Sân 3
  { courtName: "Sân 3", timeSlot: "06:00 - 07:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "14:00 - 15:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "15:00 - 16:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "16:00 - 17:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "19:00 - 20:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "20:00 - 21:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 3", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-20" },

  // Sân 4
  { courtName: "Sân 4", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "14:00 - 15:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "15:00 - 16:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "16:00 - 17:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "19:00 - 20:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "20:00 - 21:00", status: "booked", date: "2026-07-20" },
  { courtName: "Sân 4", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-20" },

  // Sân 5
  { courtName: "Sân 5", timeSlot: "06:00 - 07:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "07:00 - 08:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "08:00 - 09:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "09:00 - 10:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "10:00 - 11:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "11:00 - 12:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "12:00 - 13:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "13:00 - 14:00", status: "locked", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "14:00 - 15:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "15:00 - 16:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "16:00 - 17:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "17:00 - 18:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "18:00 - 19:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "19:00 - 20:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "20:00 - 21:00", status: "free", date: "2026-07-20" },
  { courtName: "Sân 5", timeSlot: "21:00 - 22:00", status: "free", date: "2026-07-20" },
];

export default function AloboLiveSync() {
  const [date, setDate] = useState("2026-07-20");
  const [slots, setSlots] = useState<SyncedSlot[]>(INITIAL_SLOTS);
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleString("vi-VN"));
  const [isLoading, setIsLoading] = useState(false);

  const fetchSyncData = async (targetDate: string, showOverlay = false) => {
    if (showOverlay) {
      setIsLoading(true);
    }
    try {
      const response = await fetch(`/api/alobo/sync?date=${targetDate}`);
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
        setLastUpdated(data.lastUpdated);
      } else {
        console.warn("Could not sync latest Alobo data, keeping cached data.");
      }
    } catch (err) {
      console.warn("Backend connection error during background fetch. Keeping cached data.");
    } finally {
      if (showOverlay) {
        setIsLoading(false);
      }
    }
  };

  // Poll for live real-time updates every 3 seconds to ensure ultra-fresh states!
  useEffect(() => {
    fetchSyncData(date, false);
    const interval = setInterval(() => {
      fetchSyncData(date, false);
    }, 3000);
    return () => clearInterval(interval);
  }, [date]);

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

  return (
    <section id="alobo-live-sync" className="py-20 bg-[#f4fbf7] border-t border-brand-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full text-emerald-800 text-xs font-bold mb-3">
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
              onClick={() => fetchSyncData(date, true)}
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

      </div>
    </section>
  );
}
