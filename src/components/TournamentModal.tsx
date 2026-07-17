import React, { useState } from 'react';
import { X, Trophy, Shield, UserCheck, Star, Users, CheckCircle } from 'lucide-react';
import { Tournament, TeamRegistration } from '../types';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onRegisterTeam: (registration: TeamRegistration) => void;
}

export default function TournamentModal({ isOpen, onClose, tournament, onRegisterTeam }: TournamentModalProps) {
  const [teamName, setTeamName] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player1Level, setPlayer1Level] = useState('2.5');
  const [player2, setPlayer2] = useState('');
  const [player2Level, setPlayer2Level] = useState('2.5');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [regDetails, setRegDetails] = useState<TeamRegistration | null>(null);

  if (!isOpen || !tournament) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !player1.trim() || !player2.trim() || !phone.trim() || !email.trim()) {
      alert('Vui lòng điền đầy đủ tất cả các trường thông tin để đăng ký!');
      return;
    }

    const newReg: TeamRegistration = {
      id: 'reg-' + Math.random().toString(36).substr(2, 9),
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      teamName: teamName,
      player1: `${player1} (Trình ${player1Level})`,
      player2: `${player2} (Trình ${player2Level})`,
      phone: phone,
      email: email,
      status: 'confirmed',
      createdAt: new Date().toLocaleString('vi-VN')
    };

    onRegisterTeam(newReg);
    setRegDetails(newReg);
    setIsSuccess(true);

    // reset fields
    setTeamName('');
    setPlayer1('');
    setPlayer2('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl border border-brand-border/40 overflow-hidden relative">
        
        {/* Header decoration */}
        <div className="bg-brand-red p-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            T
          </div>
          
          <div className="relative z-10">
            <span className="font-display font-bold text-[10px] tracking-widest bg-white/15 px-2.5 py-1 rounded-full uppercase">
              {tournament.tag} REGISTRATION
            </span>
            <h2 className="font-display font-black text-xl tracking-tight mt-1.5 flex items-center gap-2">
              <Trophy className="w-5.5 h-5.5 text-yellow-300 animate-bounce" />
              Đăng Ký Đội Thi Đấu
            </h2>
          </div>

          <button 
            onClick={onClose}
            className="relative z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess && regDetails ? (
          /* Success Card Display */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-5">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="font-display font-black text-2xl text-brand-dark mb-1">
              Đăng ký đội thành công!
            </h3>
            <p className="font-sans text-xs text-brand-gray max-w-sm mb-6 leading-relaxed">
              Hệ thống đã xác nhận đội <strong className="text-brand-red">{regDetails.teamName}</strong> tham gia giải đấu <strong>{tournament.name}</strong>. Vé thi đấu điện tử đã gửi tới hòm thư của bạn.
            </p>

            <div className="bg-brand-light-gray p-5 rounded-2xl border border-brand-border/40 w-full text-left space-y-2.5 font-sans text-xs text-brand-dark/80 mb-6">
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Mã số đăng ký:</span>
                <span className="font-mono font-bold text-brand-dark">{regDetails.id}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Tên Đội:</span>
                <span className="font-bold text-brand-red">{regDetails.teamName}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Vận động viên 1:</span>
                <span className="font-semibold text-brand-dark">{regDetails.player1}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-gray">Vận động viên 2:</span>
                <span className="font-semibold text-brand-dark">{regDetails.player2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray">Lệ phí giải đấu:</span>
                <span className="font-bold text-brand-dark">{tournament.registrationFee.toLocaleString('vi-VN')} VND / Đội</span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-xs px-8 py-3 rounded-full transition-colors cursor-pointer shadow-md"
            >
              Hoàn Tất Đăng Ký
            </button>
          </div>
        ) : (
          /* Input Fields form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            
            <div className="p-4 rounded-xl bg-brand-light-gray border border-brand-border/40 text-xs text-brand-gray font-sans flex items-start gap-2.5">
              <Star className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-brand-dark block mb-0.5">Sự kiện: {tournament.name}</span>
                <span>Yêu cầu trình độ trung bình cộng của 2 vận động viên tối đa là 3.5. Lệ phí giải đóng trực tiếp tại buổi bốc thăm chia bảng.</span>
              </div>
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Tên Đội Thi Đấu (Team Name)</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Thảo Điền Smashers"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark font-medium outline-none"
              />
            </div>

            {/* Player 1 Detail */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Tên Vận Động Viên 1</label>
                <input 
                  type="text" 
                  placeholder="Họ tên cầu thủ 1"
                  required
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Trình (DUPR)</label>
                <select 
                  value={player1Level} 
                  onChange={(e) => setPlayer1Level(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 rounded-lg px-2 py-2 text-xs text-brand-dark outline-none"
                >
                  <option value="1.5">1.5 (Người mới)</option>
                  <option value="2.0">2.0</option>
                  <option value="2.5">2.5 (Phong trào)</option>
                  <option value="3.0">3.0 (Khá)</option>
                  <option value="3.5">3.5 (Cứng)</option>
                  <option value="4.0+">4.0+ (Chuyên nghiệp)</option>
                </select>
              </div>
            </div>

            {/* Player 2 Detail */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Tên Vận Động Viên 2</label>
                <input 
                  type="text" 
                  placeholder="Họ tên cầu thủ 2"
                  required
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Trình (DUPR)</label>
                <select 
                  value={player2Level} 
                  onChange={(e) => setPlayer2Level(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 rounded-lg px-2 py-2 text-xs text-brand-dark outline-none"
                >
                  <option value="1.5">1.5 (Người mới)</option>
                  <option value="2.0">2.0</option>
                  <option value="2.5">2.5 (Phong trào)</option>
                  <option value="3.0">3.0 (Khá)</option>
                  <option value="3.5">3.5 (Cứng)</option>
                  <option value="4.0+">4.0+ (Chuyên nghiệp)</option>
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Số điện thoại Trưởng Nhóm</label>
                <input 
                  type="tel" 
                  placeholder="Số điện thoại"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Email nhận thông báo</label>
                <input 
                  type="email" 
                  placeholder="Địa chỉ email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                />
              </div>
            </div>

            {/* Price block & register */}
            <div className="pt-4 border-t border-brand-border/40 flex justify-between items-center">
              <div>
                <span className="block text-[10px] text-brand-gray font-semibold uppercase">Lệ phí một cặp:</span>
                <span className="font-display font-black text-lg text-brand-red">
                  {tournament.registrationFee.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <button 
                type="submit"
                className="bg-brand-red hover:bg-brand-red-hover text-white px-6 py-3 rounded-full font-sans font-bold text-xs transition-colors cursor-pointer transform active:scale-95 shadow-md"
              >
                Gửi Đăng Ký
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
