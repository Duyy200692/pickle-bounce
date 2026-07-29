import React, { useState, useEffect } from 'react';
import { X, Trophy, Star, CheckCircle, FileText, Image as ImageIcon, Download, ExternalLink, Calendar, Users, Tag, DollarSign, Sparkles } from 'lucide-react';
import { Tournament, TeamRegistration } from '../types';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onRegisterTeam: (registration: TeamRegistration) => void;
  initialTab?: 'register' | 'rules' | 'gallery';
}

export default function TournamentModal({ 
  isOpen, 
  onClose, 
  tournament, 
  onRegisterTeam,
  initialTab = 'register'
}: TournamentModalProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'rules' | 'gallery'>('register');
  const [teamName, setTeamName] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player1Level, setPlayer1Level] = useState('2.5');
  const [player2, setPlayer2] = useState('');
  const [player2Level, setPlayer2Level] = useState('2.5');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [regDetails, setRegDetails] = useState<TeamRegistration | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsSuccess(false);
      setRegDetails(null);
    }
  }, [isOpen, initialTab, tournament]);

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

  const handleDownloadImage = (imgUrl: string, idx: number) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.target = '_blank';
    a.download = `${tournament.name.toLowerCase().replace(/\s+/g, '-')}-hinh-${idx + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const galleryList = tournament.gallery && tournament.gallery.length > 0
    ? tournament.gallery
    : [tournament.image].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-brand-border/40 overflow-hidden relative my-auto">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-brand-red via-red-600 to-brand-dark p-5 sm:p-6 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            T
          </div>
          
          <div className="relative z-10 pr-6">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[10px] tracking-widest bg-white/20 px-2.5 py-1 rounded-full uppercase">
                {tournament.tag || 'BOUNCE CUP'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tournament.status === 'Đang mở' ? 'bg-emerald-500 text-white' :
                tournament.status === 'Sắp diễn ra' ? 'bg-amber-500 text-white' :
                'bg-slate-700 text-white'
              }`}>
                {tournament.status || 'Đang mở'}
              </span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight mt-1.5 leading-snug">
              {tournament.name}
            </h2>
          </div>

          <button 
            onClick={onClose}
            className="relative z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="bg-slate-900 px-4 pt-3 flex gap-2 border-b border-slate-800 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2.5 rounded-t-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-white text-brand-dark shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-brand-red" />
            Thông Tin & Đăng Ký
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 rounded-t-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-white text-brand-dark shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            Điều Lệ Giải Đấu
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2.5 rounded-t-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-white text-brand-dark shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            Hình Ảnh & Album ({galleryList.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow dark-scroll">
          
          {/* TAB 1: REGISTER & INFO */}
          {activeTab === 'register' && (
            <div>
              {isSuccess && regDetails ? (
                /* Success Card Display */
                <div className="py-4 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <h3 className="font-display font-black text-2xl text-brand-dark mb-1">
                    Đăng ký đội thành công!
                  </h3>
                  <p className="font-sans text-xs text-brand-gray max-w-sm mb-6 leading-relaxed">
                    Hệ thống đã xác nhận đội <strong className="text-brand-red">{regDetails.teamName}</strong> tham gia giải đấu <strong>{tournament.name}</strong>.
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
                /* Registration form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Overview Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-brand-border/40 text-xs">
                    <div>
                      <span className="text-[10px] text-brand-gray block font-mono">THỜI GIAN</span>
                      <strong className="text-brand-dark font-medium">{tournament.date}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray block font-mono">HẠNG MỤC</span>
                      <strong className="text-brand-dark font-medium truncate block">{tournament.category}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray block font-mono">SĨ SỐ ĐỘI</span>
                      <strong className="text-brand-red">{tournament.teamsRegistered}/{tournament.maxTeams} Đội</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray block font-mono">LỆ PHÍ/ĐỘI</span>
                      <strong className="text-emerald-600 font-mono font-bold">{tournament.registrationFee ? `${tournament.registrationFee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-brand-light-gray border border-brand-border/40 text-xs text-brand-gray font-sans flex items-start gap-2.5">
                    <Star className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-dark block mb-0.5">{tournament.name}</span>
                      <span>Vui lòng điền thông tin chính xác 2 vận động viên thi đấu. Lệ phí giải sẽ thu trực tiếp tại ngày bốc thăm.</span>
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
                      className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-xl px-3.5 py-2.5 text-xs text-brand-dark font-medium outline-none"
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
                        className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-xl px-3.5 py-2.5 text-xs text-brand-dark outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Trình (DUPR)</label>
                      <select 
                        value={player1Level} 
                        onChange={(e) => setPlayer1Level(e.target.value)}
                        className="w-full bg-brand-light-gray border border-brand-border/40 rounded-xl px-2 py-2.5 text-xs text-brand-dark outline-none"
                      >
                        <option value="1.5">1.5 (Mới)</option>
                        <option value="2.0">2.0</option>
                        <option value="2.5">2.5 (Phong trào)</option>
                        <option value="3.0">3.0 (Khá)</option>
                        <option value="3.5">3.5 (Cứng)</option>
                        <option value="4.0+">4.0+ (Pro)</option>
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
                        className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-xl px-3.5 py-2.5 text-xs text-brand-dark outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Trình (DUPR)</label>
                      <select 
                        value={player2Level} 
                        onChange={(e) => setPlayer2Level(e.target.value)}
                        className="w-full bg-brand-light-gray border border-brand-border/40 rounded-xl px-2 py-2.5 text-xs text-brand-dark outline-none"
                      >
                        <option value="1.5">1.5 (Mới)</option>
                        <option value="2.0">2.0</option>
                        <option value="2.5">2.5 (Phong trào)</option>
                        <option value="3.0">3.0 (Khá)</option>
                        <option value="3.5">3.5 (Cứng)</option>
                        <option value="4.0+">4.0+ (Pro)</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Số điện thoại SĐT</label>
                      <input 
                        type="tel" 
                        placeholder="Số điện thoại"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-xl px-3.5 py-2.5 text-xs text-brand-dark outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark uppercase mb-1">Email liên hệ</label>
                      <input 
                        type="email" 
                        placeholder="Địa chỉ email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-brand-light-gray border border-brand-border/40 focus:border-brand-red rounded-xl px-3.5 py-2.5 text-xs text-brand-dark outline-none"
                      />
                    </div>
                  </div>

                  {/* Price block & register */}
                  <div className="pt-4 border-t border-brand-border/40 flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] text-brand-gray font-semibold uppercase">Lệ phí giải:</span>
                      <span className="font-display font-black text-lg text-brand-red">
                        {tournament.registrationFee ? `${tournament.registrationFee.toLocaleString('vi-VN')} VND` : 'Miễn phí'}
                      </span>
                    </div>
                    <button 
                      type="submit"
                      className="bg-brand-red hover:bg-brand-red-hover text-white px-6 py-3 rounded-full font-sans font-bold text-xs transition-all cursor-pointer transform active:scale-95 shadow-md shadow-brand-red/20"
                    >
                      Gửi Đăng Ký Đội
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}

          {/* TAB 2: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-5">
              <div className="bg-brand-light-gray p-5 rounded-2xl border border-brand-border/40">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-brand-red" />
                  <h3 className="font-display font-bold text-base text-brand-dark">Điều Lệ & Quy Định Thi Đấu</h3>
                </div>
                
                {tournament.rules ? (
                  <div className="prose text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2 font-sans bg-white p-4 rounded-xl border border-brand-border/40">
                    {tournament.rules}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-brand-border/40 text-xs text-brand-gray space-y-2">
                    <p><strong>1. Thể thức thi đấu:</strong> Vòng bảng thi đấu theo thể thức Play-off tính điểm. Các đội đứng đầu mỗi bảng tiến vào vòng loại trực tiếp (Tứ kết, Bán kết, Chung kết).</p>
                    <p><strong>2. Quy định tính điểm:</strong> Trận đấu diễn ra trong 1 hiệp 15 điểm (Chạm 15 đổi sân ở 8 điểm, cách tối thiểu 2 điểm).</p>
                    <p><strong>3. Bóng & Trang phục:</strong> Sử dụng bóng Franklin X-40 tiêu chuẩn. Trang phục thi đấu thể thao lịch sự, đi giày đế bằng chống trượt.</p>
                    <p><strong>4. Khiếu nại & Giải thưởng:</strong> Quyết định của Trọng tài chính là quyết định cuối cùng. Giải thưởng được trao ngay sau trận Chung kết.</p>
                  </div>
                )}
              </div>

              {/* Tournament Info summary */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Tên giải đấu:</span>
                  <span className="font-bold">{tournament.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Ngày thi đấu:</span>
                  <span>{tournament.date}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Hạng mục:</span>
                  <span>{tournament.category}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Trạng thái giải:</span>
                  <span className="text-emerald-400 font-bold">{tournament.status}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('register')}
                  className="bg-brand-red text-white hover:bg-brand-red-hover px-6 py-2.5 rounded-full font-bold text-xs cursor-pointer shadow-md"
                >
                  Đăng Ký Tham Gia Giải
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GALLERY & DOWNLOAD */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              
              {/* Album high-res download banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block mb-1">THƯ VIỆN HÌNH ẢNH GIẢI ĐẤU</span>
                    <h4 className="font-display font-black text-lg sm:text-xl">
                      Album Ảnh Gốc Chất Lượng Cao
                    </h4>
                    <p className="font-sans text-xs text-slate-300 mt-1 max-w-md">
                      Vận động viên có thể truy cập để xem và tải về trọn bộ ảnh thi đấu sắc nét của giải đấu {tournament.name}.
                    </p>
                  </div>

                  {tournament.albumUrl ? (
                    <a
                      href={tournament.albumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-full font-sans font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform transform active:scale-95 shadow-md shadow-emerald-500/30 flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Tải Album Google Drive
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  ) : (
                    <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300 text-center sm:text-left">
                      <span>Album ảnh gốc sẽ được ban tổ chức cập nhật sau khi giải kết thúc.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-bold text-sm text-brand-dark flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-red" />
                    Hình Ảnh Tiêu Biểu ({galleryList.length})
                  </h4>
                  <span className="text-[11px] text-brand-gray">Nhấn vào ảnh để tải về</span>
                </div>

                {galleryList.length === 0 ? (
                  <div className="p-8 text-center bg-brand-light-gray rounded-2xl border border-brand-border/40 text-xs text-brand-gray">
                    Chưa có hình ảnh nào được tải lên cho giải đấu này.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {galleryList.map((imgUrl, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden group border border-brand-border/40 bg-slate-100 shadow-sm">
                        <img 
                          src={imgUrl} 
                          alt={`Tournament photo ${idx + 1}`}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                          <span className="text-[10px] text-white/80 font-mono">Ảnh #{idx + 1}</span>
                          <button
                            onClick={() => handleDownloadImage(imgUrl, idx)}
                            className="bg-brand-red hover:bg-brand-red-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tải Ảnh
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
