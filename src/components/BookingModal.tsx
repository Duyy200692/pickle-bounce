import React, { useState } from 'react';
import { X, Calendar, MapPin, Sparkles, Shield, User, Phone, CheckCircle, Info } from 'lucide-react';
import { Court, Booking } from '../types';
import { INITIAL_COURTS } from '../data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  onAddBooking: (booking: Booking) => void;
}

export default function BookingModal({ isOpen, onClose, courts, onAddBooking }: BookingModalProps) {
  const [selectedCourt, setSelectedCourt] = useState<Court>(() => courts[0] || INITIAL_COURTS[0]!);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]! // default tomorrow
  );
  const [selectedSlot, setSelectedSlot] = useState<string>(() => (courts[0] || INITIAL_COURTS[0]!).slots[0]!);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isOpenPlay, setIsOpenPlay] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  React.useEffect(() => {
    if (isOpen && courts.length > 0) {
      if (!courts.some(c => c.id === selectedCourt.id)) {
        setSelectedCourt(courts[0]!);
        setSelectedSlot(courts[0]!.slots[0]!);
      }
    }
  }, [isOpen, courts, selectedCourt.id]);

  if (!isOpen) return null;

  const getPricePerHour = (dateStr: string, slotStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      const day = dateObj.getDay(); // 0: Sunday, 6: Saturday
      const isWeekend = day === 0 || day === 6;
      const isPeakSlot = slotStr.includes('16:00') || slotStr.includes('18:00') || slotStr.includes('20:00');
      
      if (isWeekend || isPeakSlot) {
        return 180000; // Peak Hour
      }
      return 150000; // Normal Hour
    } catch (e) {
      return 150000;
    }
  };

  const calculatedPricePerHour = getPricePerHour(selectedDate, selectedSlot);
  const totalCalculatedPrice = calculatedPricePerHour * 2;

  const handleCourtChange = (courtId: string) => {
    const court = courts.find(c => c.id === courtId);
    if (court) {
      setSelectedCourt(court);
      setSelectedSlot(court.slots[0]!);
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Vui lòng điền đầy đủ họ tên và số điện thoại liên hệ!');
      return;
    }

    const newBooking: Booking = {
      id: 'book-' + Math.random().toString(36).substr(2, 9),
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      address: selectedCourt.address,
      date: selectedDate,
      timeSlot: selectedSlot,
      fullName: fullName,
      phone: phone,
      status: 'confirmed',
      totalPrice: totalCalculatedPrice,
      isOpenPlay: isOpenPlay,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    onAddBooking(newBooking);
    setLastBooking(newBooking);
    setIsSuccess(true);
    
    // reset form fields
    setFullName('');
    setPhone('');
    setIsOpenPlay(false);
  };

  const formattedDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl border border-brand-border/40 overflow-hidden relative">
        
        {/* Header decoration */}
        <div className="bg-brand-red p-6 text-white flex justify-between items-center relative overflow-hidden">
          {/* Subtle logo background print */}
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            P
          </div>
          
          <div className="relative z-10">
            <span className="font-display font-bold text-[10px] tracking-widest bg-white/15 px-2.5 py-1 rounded-full uppercase">
              BẢO CHỨNG CHẤT LƯỢNG
            </span>
            <h2 className="font-display font-black text-2xl tracking-tight mt-1.5 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-red-light animate-pulse" />
              Đặt Sân Trực Tuyến
            </h2>
          </div>

          <button 
            onClick={onClose}
            className="relative z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {isSuccess && lastBooking ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 scale-110">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="font-display font-black text-2xl text-brand-dark mb-2">
              Đặt sân thành công!
            </h3>
            <p className="font-sans text-sm text-brand-gray max-w-md mb-8 leading-relaxed">
              Mã đặt sân <span className="font-mono font-bold text-brand-red bg-brand-red-light px-2 py-0.5 rounded">{lastBooking.id}</span> đã được ghi nhận trên hệ thống. Nhân viên sân sẽ hỗ trợ giữ chỗ cho bạn.
            </p>

            <div className="bg-brand-light-gray p-6 rounded-2xl border border-brand-border/40 w-full text-left space-y-3 font-sans text-sm text-brand-dark/80 mb-8 max-w-md">
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Sân đấu:</span>
                <span className="font-bold text-brand-dark">{lastBooking.courtName}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Ngày chơi:</span>
                <span className="font-bold text-brand-dark">{formattedDate(lastBooking.date)}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Khung giờ:</span>
                <span className="font-bold text-brand-dark">{lastBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Tổng phí tạm tính:</span>
                <span className="font-bold text-brand-red">{(lastBooking.totalPrice).toLocaleString('vi-VN')} VND</span>
              </div>
              {lastBooking.isOpenPlay && (
                <div className="bg-brand-red-light/50 border border-brand-red/10 p-3 rounded-lg text-xs text-brand-red font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 animate-spin" />
                  <span>Kèo mở! Người chơi khác có thể tìm thấy bạn trên Match Lobby để giao lưu ghép trận.</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsSuccess(false)}
                className="bg-brand-light-gray hover:bg-brand-border/60 text-brand-dark font-sans font-bold text-xs px-6 py-3 rounded-full transition-colors cursor-pointer"
              >
                Đặt thêm sân khác
              </button>
              <button 
                onClick={onClose}
                className="bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-xs px-6 py-3 rounded-full transition-colors cursor-pointer shadow-lg shadow-brand-red/20"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleBook} className="p-6 sm:p-8 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Select Location */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                  Chọn Cụm Sân
                </label>
                <select 
                  value={selectedCourt.id} 
                  onChange={(e) => handleCourtChange(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 hover:border-brand-red/30 focus:border-brand-red/80 focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-3 text-sm text-brand-dark font-medium transition-all outline-none"
                >
                  {courts.map(court => (
                    <option key={court.id} value={court.id}>{court.name}</option>
                  ))}
                </select>
                <div className="mt-2 flex items-start gap-1.5 text-xs text-brand-gray font-sans">
                  <MapPin className="w-3.5 h-3.5 text-brand-red flex-shrink-0 mt-0.5" />
                  <span>{selectedCourt.address}</span>
                </div>
              </div>

              {/* Select Date */}
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                  Chọn Ngày Chơi
                </label>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-2.5 text-sm text-brand-dark font-medium transition-all outline-none"
                />
              </div>

            </div>

            {/* Select Slot */}
            <div>
              <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                Chọn Khung Giờ (2 Giờ mỗi ca)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {selectedCourt.slots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-2.5 rounded-xl border font-sans font-semibold text-xs transition-all cursor-pointer ${
                      selectedSlot === slot 
                        ? 'bg-brand-red border-brand-red text-white shadow-md shadow-brand-red/10' 
                        : 'bg-white border-brand-border/40 text-brand-dark hover:border-brand-red hover:bg-brand-red-light/30'
                    }`}
                  >
                    {slot.split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-brand-border/40">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-brand-gray/60" />
                  <input 
                    type="text" 
                    placeholder="Nguyễn Văn A"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-dark outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                  Số điện thoại liên hệ
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-brand-gray/60" />
                  <input 
                    type="tel" 
                    placeholder="0901234567"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-dark outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Toggle Open Play (Highly engaging matching trigger) */}
            <div className="p-4 rounded-2xl bg-brand-light-gray border border-brand-border/40 flex items-start gap-3">
              <input 
                id="openplay" 
                type="checkbox"
                checked={isOpenPlay}
                onChange={(e) => setIsOpenPlay(e.target.checked)}
                className="mt-1 w-4 h-4 text-brand-red border-brand-border focus:ring-brand-red rounded"
              />
              <div className="flex-1">
                <label htmlFor="openplay" className="font-display font-bold text-sm text-brand-dark cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-red animate-float" />
                  Mở kèo giao lưu (Open Play)
                </label>
                <p className="font-sans text-xs text-brand-gray mt-0.5 leading-relaxed">
                  Cho phép người chơi khác tìm thấy trận đấu của bạn trên Match Lobby để tham gia ghép đội và giao lưu chia tiền sân cùng bạn.
                </p>
              </div>
            </div>

            {/* Summary Price & Submit */}
            <div className="pt-4 border-t border-brand-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-brand-gray font-semibold uppercase">Tổng chi phí (2 Giờ):</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    calculatedPricePerHour === 180000 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {calculatedPricePerHour === 180000 ? 'Giờ vàng (180k/h)' : 'Giờ thường (150k/h)'}
                  </span>
                </div>
                <span className="font-display font-black text-2xl text-brand-red">
                  {totalCalculatedPrice.toLocaleString('vi-VN')} VND
                </span>
                <span className="block text-[10px] text-brand-gray mt-0.5">Thanh toán trực tiếp tại quầy check-in sân</span>
              </div>

              <button 
                type="submit"
                className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-sm px-10 py-4 rounded-full transition-all duration-300 shadow-lg shadow-brand-red/30 cursor-pointer transform active:scale-95"
              >
                Xác Nhận Đặt Sân
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
