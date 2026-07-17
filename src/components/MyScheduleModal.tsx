import React from 'react';
import { X, Calendar, MapPin, Trash2, Clock, ShieldCheck, FileText } from 'lucide-react';
import { Booking } from '../types';

interface MyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
}

export default function MyScheduleModal({ isOpen, onClose, bookings, onCancelBooking }: MyScheduleModalProps) {
  if (!isOpen) return null;

  const formattedDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl border border-brand-border/40 overflow-hidden relative">
        
        {/* Header Block */}
        <div className="bg-brand-red p-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            S
          </div>
          
          <div className="relative z-10">
            <span className="font-display font-bold text-[10px] tracking-widest bg-white/15 px-2.5 py-1 rounded-full uppercase">
              BẢNG QUẢN LÝ LỊCH CHƠI
            </span>
            <h2 className="font-display font-black text-xl tracking-tight mt-1.5 flex items-center gap-2">
              <Calendar className="w-5.5 h-5.5" />
              Lịch Chơi Của Tôi
            </h2>
          </div>

          <button 
            onClick={onClose}
            className="relative z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 max-h-[60vh] overflow-y-auto dark-scroll space-y-4">
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-brand-gray/30 mx-auto mb-3" />
              <p className="font-sans text-sm text-brand-gray font-medium">Bạn chưa đăng ký đặt sân nào!</p>
              <p className="font-sans text-xs text-brand-gray/60 mt-1">Hãy bấm nút đặt sân trực tuyến trên thanh menu.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div 
                key={booking.id}
                className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 space-y-3 relative overflow-hidden group"
              >
                {/* Cancel button */}
                <button 
                  onClick={() => {
                    if (confirm('Bạn chắc chắn muốn huỷ lịch đặt sân này?')) {
                      onCancelBooking(booking.id);
                    }
                  }}
                  className="absolute top-4 right-4 text-brand-gray/50 hover:text-brand-red p-1.5 hover:bg-brand-red-light rounded-lg transition-colors cursor-pointer"
                  title="Huỷ lịch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1">
                    Đã Xác Nhận
                  </span>
                  <h3 className="font-display font-bold text-base text-brand-dark pr-6">
                    {booking.courtName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans text-brand-gray">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-red" />
                    <span>Ngày: <strong>{formattedDate(booking.date)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-red" />
                    <span>Giờ: <strong>{booking.timeSlot}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-sans text-brand-gray pt-1">
                  <MapPin className="w-4 h-4 text-brand-red flex-shrink-0" />
                  <span className="truncate">{booking.address}</span>
                </div>

                <div className="pt-2.5 border-t border-brand-border/40 flex justify-between items-center text-xs">
                  <span className="text-brand-gray">Mã số: <strong className="font-mono text-brand-dark">{booking.id}</strong></span>
                  <span className="font-bold text-brand-red">{booking.totalPrice.toLocaleString('vi-VN')} VND</span>
                </div>

                {booking.isOpenPlay && (
                  <div className="bg-brand-red-light/50 border border-brand-red/10 p-2.5 rounded-xl text-[11px] text-brand-red font-semibold">
                    🔥 Đang mở kèo giao lưu công khai tại Match Lobby!
                  </div>
                )}
              </div>
            ))
          )}

        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-brand-light-gray border-t border-brand-border/40 flex items-center gap-2 text-[10px] text-brand-gray font-sans">
          <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>Vui lòng mang mã đặt sân tới quầy check-in sân trước 15 phút để đảm bảo trải nghiệm chơi bóng tốt nhất.</span>
        </div>

      </div>
    </div>
  );
}
