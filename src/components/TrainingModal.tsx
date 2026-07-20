import React, { useState } from 'react';
import { X, Trophy, Sparkles, User, Phone, CalendarDays, ClipboardCheck, DollarSign, Clock, Award } from 'lucide-react';
import { MemberRegistration } from '../types';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRegistration: (reg: MemberRegistration) => void;
}

export default function TrainingModal({ isOpen, onClose, onAddRegistration }: TrainingModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [preferredTime, setPreferredTime] = useState('Thứ 2, 4, 6 (18:00 - 20:00)');
  const [coachName, setCoachName] = useState('Coach Tommy (Chuyên nghiệp)');
  const [packageType, setPackageType] = useState('Combo 10 Buổi Nhập Môn');
  const [hoursCount, setHoursCount] = useState('10 giờ tập / 10 vé');
  const [durationMonths, setDurationMonths] = useState(3);
  const [serviceType, setServiceType] = useState('Tập luyện cá nhân 1-1');
  const [totalPrice, setTotalPrice] = useState(5000000);
  const [depositAmount, setDepositAmount] = useState(1000000); // Mặc định đặt cọc 1.000.000đ
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastReg, setLastReg] = useState<MemberRegistration | null>(null);

  if (!isOpen) return null;

  // Preset packages mapping
  const handlePackageChange = (pkgName: string) => {
    setPackageType(pkgName);
    if (pkgName === 'Combo 10 Buổi Nhập Môn') {
      setHoursCount('10 giờ tập');
      setDurationMonths(3);
      setServiceType('Tập luyện cá nhân 1-1');
      setTotalPrice(5000000);
      setDepositAmount(1000000);
    } else if (pkgName === 'Combo 20 Buổi Chuyên Sâu') {
      setHoursCount('20 giờ tập');
      setDurationMonths(6);
      setServiceType('Tập luyện cá nhân 1-1');
      setTotalPrice(9000000);
      setDepositAmount(2000000);
    } else if (pkgName === 'Khóa Học Nhóm Clinic Basic') {
      setHoursCount('12 giờ / 6 tuần');
      setDurationMonths(1.5);
      setServiceType('Lớp huấn luyện nhóm');
      setTotalPrice(2500000);
      setDepositAmount(500000);
    } else if (pkgName === 'Thẻ Hội Viên VIP 1 Tháng') {
      setHoursCount('Không giới hạn vé');
      setDurationMonths(1);
      setServiceType('Thành viên CLB');
      setTotalPrice(1500000);
      setDepositAmount(1500000);
    } else if (pkgName === 'Thẻ Hội Viên VIP 12 Tháng') {
      setHoursCount('Không giới hạn vé');
      setDurationMonths(12);
      setServiceType('Thành viên CLB');
      setTotalPrice(12000000);
      setDepositAmount(3000000);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !dob.trim()) {
      alert('Vui lòng điền đầy đủ Họ và tên, Số điện thoại và Ngày sinh!');
      return;
    }

    const remainingAmount = Math.max(0, totalPrice - depositAmount);
    const actualPaid = depositAmount; // Doanh thu thực tế đóng tại thời điểm ký

    const newReg: MemberRegistration = {
      id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
      contractDate: new Date().toLocaleDateString('vi-VN'), // NGÀY KÝ HĐ
      fullName,
      dob,
      phone,
      preferredTime,
      hoursCount,
      packageType,
      durationMonths,
      coachName,
      serviceType,
      totalPrice,
      depositAmount,
      remainingAmount,
      actualPaid,
      status: 'confirmed',
      createdAt: new Date().toLocaleString('vi-VN')
    };

    onAddRegistration(newReg);
    setLastReg(newReg);
    setIsSuccess(true);

    // Reset forms
    setFullName('');
    setPhone('');
    setDob('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl border border-brand-border/40 overflow-hidden relative">
        
        {/* Header decoration */}
        <div className="bg-[#4285F4] p-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            M
          </div>
          
          <div className="relative z-10">
            <span className="font-display font-bold text-[10px] tracking-widest bg-white/15 px-2.5 py-1 rounded-full uppercase">
              KÝ HỢP ĐỒNG THÀNH VIÊN & GÓI TẬP
            </span>
            <h2 className="font-display font-black text-2xl tracking-tight mt-1.5 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-300 animate-pulse" />
              Đăng Ký Thành Viên & Gói Tập
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
        {isSuccess && lastReg ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 scale-110">
              <ClipboardCheck className="w-10 h-10" />
            </div>

            <h3 className="font-display font-black text-2xl text-brand-dark mb-2">
              Đăng ký Gói Tập thành công!
            </h3>
            <p className="font-sans text-sm text-brand-gray max-w-md mb-8 leading-relaxed">
              Hợp đồng số <span className="font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">{lastReg.id}</span> đã được ghi nhận. Hệ thống đang tự động cập nhật thông tin lên Google Sheets của ban quản lý.
            </p>

            <div className="bg-brand-light-gray p-6 rounded-2xl border border-brand-border/40 w-full text-left space-y-3 font-sans text-xs text-brand-dark/80 mb-8 max-w-md">
              <div className="flex justify-between border-b border-brand-border/20 pb-2">
                <span className="text-brand-gray font-semibold">Khách hàng:</span>
                <span className="font-bold text-brand-dark">{lastReg.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/20 pb-2">
                <span className="text-brand-gray font-semibold">Gói tập:</span>
                <span className="font-bold text-[#4285F4]">{lastReg.packageType}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/20 pb-2">
                <span className="text-brand-gray font-semibold">HLV:</span>
                <span className="font-bold text-brand-dark">{lastReg.coachName}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/20 pb-2">
                <span className="text-brand-gray font-semibold">Tổng giá trị:</span>
                <span className="font-bold text-brand-red">{(lastReg.totalPrice).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/20 pb-2">
                <span className="text-brand-gray font-semibold">Đã đặt cọc:</span>
                <span className="font-bold text-green-600">{(lastReg.depositAmount).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray font-semibold">Còn lại:</span>
                <span className="font-bold text-brand-gray">{(lastReg.remainingAmount).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="bg-[#4285F4] hover:bg-blue-600 text-white font-sans font-bold px-8 py-3 rounded-full text-sm cursor-pointer transition-colors shadow-lg"
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="p-6 space-y-6 font-sans">
            
            {/* Split layout: Personal info vs package selections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Column: Personal info */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-[11px] uppercase tracking-widest text-brand-gray flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#4285F4]" />
                  Thông tin học viên / Hội viên
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark mb-1 uppercase">Họ và tên *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nhập họ tên đầy đủ..." 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-[#4285F4] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-brand-dark outline-none font-semibold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark mb-1 uppercase">Số điện thoại *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ví dụ: 0912345678..." 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-[#4285F4] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-brand-dark outline-none font-semibold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark mb-1 uppercase">Ngày sinh (Để ghi nhận) *</label>
                    <input 
                      type="date" 
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-[#4285F4] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-brand-dark outline-none font-semibold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark mb-1 uppercase">Lịch tập mong muốn</label>
                    <select 
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-[#4285F4] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-brand-dark outline-none font-semibold transition-all"
                    >
                      <option value="Thứ 2, 4, 6 (18:00 - 20:00)">Thứ 2, 4, 6 (18:00 - 20:00)</option>
                      <option value="Thứ 3, 5, Bảy (19:00 - 21:00)">Thứ 3, 5, Bảy (19:00 - 21:00)</option>
                      <option value="Cuối tuần Thứ Bảy, CN (8:00 - 10:00)">Cuối tuần Thứ Bảy, CN (8:00 - 10:00)</option>
                      <option value="Các buổi sáng ngày thường (6:00 - 8:00)">Các buổi sáng ngày thường (6:00 - 8:00)</option>
                      <option value="Khung giờ linh hoạt tự sắp xếp">Khung giờ linh hoạt tự sắp xếp</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Coaching & Package options */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-[11px] uppercase tracking-widest text-brand-gray flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-yellow-500" />
                  Gói tập & HLV đồng hành
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark mb-1 uppercase">Huấn luyện viên hướng dẫn</label>
                    <select 
                      value={coachName}
                      onChange={(e) => setCoachName(e.target.value)}
                      className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-[#4285F4] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-brand-dark outline-none font-semibold transition-all"
                    >
                      <option value="Coach Tommy (Đội tuyển)">Coach Tommy (Đội tuyển)</option>
                      <option value="Coach Lisa (Cựu tuyển thủ quốc gia)">Coach Lisa (Cựu tuyển thủ)</option>
                      <option value="Coach Henry (HLV Chuyên Nghiệp)">Coach Henry (HLV Chuyên nghiệp)</option>
                      <option value="Tự luyện tập / Không thuê HLV">Tự luyện tập / Không thuê HLV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark mb-1 uppercase">Chọn Gói Đăng Ký</label>
                    <select 
                      value={packageType}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      className="w-full bg-brand-light-gray border border-[#4285F4]/40 focus:border-[#4285F4] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-brand-dark outline-none font-semibold transition-all"
                    >
                      <option value="Combo 10 Buổi Nhập Môn">Combo 10 Buổi Nhập Môn (10 giờ/5tr)</option>
                      <option value="Combo 20 Buổi Chuyên Sâu">Combo 20 Buổi Chuyên Sâu (20 giờ/9tr)</option>
                      <option value="Khóa Học Nhóm Clinic Basic">Khóa Học Nhóm Clinic Basic (12 giờ/2.5tr)</option>
                      <option value="Thẻ Hội Viên VIP 1 Tháng">Thẻ Hội Viên VIP 1 Tháng (Thẻ/1.5tr)</option>
                      <option value="Thẻ Hội Viên VIP 12 Tháng">Thẻ Hội Viên VIP 12 Tháng (Thẻ/12tr)</option>
                    </select>
                  </div>

                  {/* Summary of automatically calculated elements */}
                  <div className="bg-brand-light-gray p-3.5 rounded-2xl border border-brand-border/30 text-[11px] space-y-1.5 text-left font-sans">
                    <div className="flex justify-between">
                      <span className="text-brand-gray">Dịch vụ:</span>
                      <span className="font-bold text-brand-dark">{serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray">Số giờ / Số vé:</span>
                      <span className="font-bold text-brand-dark">{hoursCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray">Thời hạn cam kết:</span>
                      <span className="font-bold text-brand-dark">{durationMonths} tháng</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-border/40 pt-1.5 mt-1">
                      <span className="text-brand-gray font-semibold">Tổng giá trị:</span>
                      <span className="font-bold text-brand-red">{totalPrice.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Payment / Deposit segment */}
            <div className="border-t border-brand-border/40 pt-5 space-y-4">
              <h4 className="font-display font-black text-[11px] uppercase tracking-widest text-brand-gray flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                Giao dịch & Thanh toán cọc
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-[10px] font-bold text-brand-dark mb-1 uppercase">Số tiền đặt cọc trước *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      max={totalPrice}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-green-600 focus:bg-white rounded-xl pl-8 pr-4 py-2.5 text-xs text-brand-dark outline-none font-semibold transition-all"
                    />
                    <span className="absolute left-3 top-2.5 text-brand-gray font-bold text-xs">₫</span>
                  </div>
                </div>

                <div className="sm:col-span-2 bg-green-50 p-3 rounded-2xl border border-green-200/50 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-brand-gray block text-[10px] uppercase font-bold">Số tiền còn lại cần đóng</span>
                    <span className="font-mono font-bold text-base text-brand-dark">{(totalPrice - depositAmount).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="text-right">
                    <span className="text-brand-gray block text-[10px] uppercase font-bold">Doanh thu thực tế ghi nhận</span>
                    <span className="font-mono font-bold text-base text-green-600">{(depositAmount).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Action Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2 text-left">
              <p className="text-[10px] text-brand-gray max-w-sm leading-relaxed">
                * Bằng việc ký đăng ký, thông tin của bạn sẽ được tự động chuyển lên bảng tính quản lý <strong>BÁO CÁO PICKLE BOUNCE</strong> để thực hiện ghi nhận sổ sách tức thời.
              </p>
              
              <button 
                type="submit"
                className="bg-[#4285F4] hover:bg-blue-600 text-white font-sans font-bold px-8 py-3 rounded-full text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 cursor-pointer whitespace-nowrap"
              >
                <ClipboardCheck className="w-4 h-4" /> Ký Đăng Ký & Lưu Lên Sheets
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
