import React, { useState } from 'react';
import { X, Users, Compass, Plus, MessageSquare, AlertCircle, Sparkles, Star, Check } from 'lucide-react';
import { OpenPlay, Court } from '../types';
import { INITIAL_OPEN_PLAYS } from '../data';

interface MatchLobbyProps {
  isOpen: boolean;
  onClose: () => void;
  openPlays: OpenPlay[];
  courts: Court[];
  onJoinOpenPlay: (id: string, name: string) => void;
  onPostOpenPlay: (openPlay: OpenPlay) => void;
}

export default function MatchLobby({ isOpen, onClose, openPlays, courts, onJoinOpenPlay, onPostOpenPlay }: MatchLobbyProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<OpenPlay['level']>('Mọi cấp độ');
  const [location, setLocation] = useState(() => courts[0]?.name || 'Pickle Bounce Thảo Điền');
  const [date, setDate] = useState('Hôm nay');
  const [time, setTime] = useState('18:00 - 20:00');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [fee, setFee] = useState(50000);
  const [description, setDescription] = useState('');

  // Joining state per open play id
  const [joinerName, setJoinerName] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !userName.trim()) {
      alert('Vui lòng điền tiêu đề kèo và tên người đứng ra tổ chức!');
      return;
    }

    const newOpenPlay: OpenPlay = {
      id: 'op-' + Math.random().toString(36).substr(2, 9),
      title: title,
      level: level,
      location: location,
      date: date,
      time: time,
      joinedPlayers: [userName],
      maxPlayers: maxPlayers,
      hostName: userName,
      fee: fee,
      description: description || 'Ráp kèo giao lưu văn nghệ, vui vẻ, cọ xát nâng trình!'
    };

    onPostOpenPlay(newOpenPlay);
    setIsPosting(false);
    
    // Reset Form
    setTitle('');
    setUserName('');
    setDescription('');
  };

  const handleJoinSubmit = (e: React.FormEvent, opId: string) => {
    e.preventDefault();
    if (!joinerName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }
    onJoinOpenPlay(opId, joinerName);
    setJoinerName('');
    setJoiningId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl border border-brand-border/40 overflow-hidden relative my-8">
        
        {/* Header Block */}
        <div className="bg-brand-dark p-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            M
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-[10px] tracking-widest text-brand-red uppercase">
                COMMUNITY LOBBY
              </span>
              <h2 className="font-display font-black text-2xl tracking-tight leading-none mt-1">
                Bảng Kèo Giao Lưu
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="relative z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto dark-scroll">
          
          {/* Toggle post button or message */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-border/40">
            <div>
              <p className="font-sans text-sm text-brand-gray">
                Nơi ghép cặp, kết nối trực tiếp các câu lạc bộ và người chơi phong trào hàng giờ.
              </p>
            </div>
            {!isPosting && (
              <button 
                onClick={() => setIsPosting(true)}
                className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-brand-red/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Lên Kèo Ngay
              </button>
            )}
          </div>

          {isPosting ? (
            /* Post a Play Request Form */
            <form onSubmit={handlePost} className="bg-brand-light-gray p-6 rounded-2xl border border-brand-border/40 space-y-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-display font-bold text-base text-brand-dark flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-red animate-pulse" />
                  Đăng Tin Lên Kèo Mới
                </h3>
                <button 
                  type="button" 
                  onClick={() => setIsPosting(false)}
                  className="text-xs text-brand-gray hover:text-brand-dark"
                >
                  Hủy đăng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Tên Kèo Giao Lưu</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Ráp đôi cứng tối thứ 5 Phú Nhuận"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Tên của bạn (Trưởng Ban Kèo)</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Hoàng Long"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Chọn Cấp Độ</label>
                  <select 
                    value={level} 
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-2 py-2 text-xs text-brand-dark outline-none"
                  >
                    <option value="Mọi cấp độ">Mọi cấp độ</option>
                    <option value="Người mới (1.0-2.5)">Người mới (1.0-2.5)</option>
                    <option value="Trung cấp (2.5-3.5)">Trung cấp (2.5-3.5)</option>
                    <option value="Nâng cao (3.5+)">Nâng cao (3.5+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Chọn Sân</label>
                  <select 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-2 py-2 text-xs text-brand-dark outline-none"
                  >
                    {courts.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Ngày Chơi</label>
                  <input 
                    type="text" 
                    placeholder="Hôm nay / Thứ Bảy"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Giờ Chơi</label>
                  <input 
                    type="text" 
                    placeholder="18:00 - 20:00"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Số Người Chơi Tối Đa</label>
                  <input 
                    type="number" 
                    min={2}
                    max={12}
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 4)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Chi Phí Chia (VND / Người)</label>
                  <input 
                    type="number" 
                    step={10000}
                    value={fee}
                    onChange={(e) => setFee(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-brand-dark uppercase mb-1">Ghi chú</label>
                  <input 
                    type="text" 
                    placeholder="Yêu cầu tinh thần vui vẻ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-brand-border/40 focus:border-brand-red rounded-lg px-3 py-2 text-xs text-brand-dark outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPosting(false)}
                  className="bg-white border border-brand-border/40 px-4 py-2 rounded-lg font-sans font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2 rounded-lg font-sans font-bold text-xs cursor-pointer"
                >
                  Xác Nhận Đăng Kèo
                </button>
              </div>
            </form>
          ) : null}

          {/* List of Active Open Plays */}
          <div className="space-y-4">
            {openPlays.length === 0 ? (
              <div className="text-center py-12 bg-brand-light-gray rounded-2xl border border-dashed border-brand-border">
                <AlertCircle className="w-8 h-8 text-brand-gray/40 mx-auto mb-2" />
                <p className="font-sans text-sm text-brand-gray">Hiện chưa có kèo ghép nào đang mở. Hãy bấm lên kèo đầu tiên!</p>
              </div>
            ) : (
              openPlays.map((op) => {
                const spacesLeft = op.maxPlayers - op.joinedPlayers.length;
                return (
                  <div 
                    key={op.id}
                    className="bg-white border border-brand-border/50 hover:border-brand-red/30 p-5 rounded-2xl transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group"
                  >
                    <div className="space-y-2 flex-1">
                      
                      {/* Top tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-[10px] tracking-wide text-brand-red bg-brand-red-light px-2.5 py-1 rounded-full uppercase">
                          {op.level}
                        </span>
                        <span className="font-sans text-xs text-brand-gray flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-brand-dark/40" />
                          {op.location}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-base text-brand-dark group-hover:text-brand-red transition-colors leading-snug">
                        {op.title}
                      </h3>

                      {/* Details row */}
                      <div className="flex flex-wrap gap-4 text-xs font-sans text-brand-gray">
                        <div>
                          <span>Thời gian: </span>
                          <span className="text-brand-dark font-semibold">{op.date} • {op.time}</span>
                        </div>
                        <div>
                          <span>Đăng kèo: </span>
                          <span className="text-brand-dark font-medium">{op.hostName}</span>
                        </div>
                        <div>
                          <span>Phí dự tính: </span>
                          <span className="text-brand-red font-bold">{op.fee > 0 ? `${op.fee.toLocaleString('vi-VN')}đ/người` : 'Miễn phí'}</span>
                        </div>
                      </div>

                      {/* Player List Grid */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-brand-dark uppercase block mb-1">Thành viên tham gia:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {op.joinedPlayers.map((player, pIdx) => (
                            <span 
                              key={pIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-light-gray border border-brand-border/40 text-brand-dark text-xs font-sans font-medium"
                            >
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {player}
                            </span>
                          ))}
                          {Array.from({ length: spacesLeft }).map((_, emptyIdx) => (
                            <span 
                              key={emptyIdx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-dashed border-brand-border text-brand-gray/40 text-xs font-sans font-medium"
                            >
                              Trống
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Join area */}
                    <div className="flex-shrink-0 md:text-right flex flex-col items-start md:items-end gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-brand-border/40">
                      
                      <div className="text-xs text-brand-gray font-sans">
                        <span>Chỗ trống: </span>
                        <span className="text-brand-red font-black text-sm">{spacesLeft}</span>
                        <span>/{op.maxPlayers}</span>
                      </div>

                      {joiningId === op.id ? (
                        /* Simple Inline Name Input for joining */
                        <form onSubmit={(e) => handleJoinSubmit(e, op.id)} className="flex gap-2 w-full">
                          <input 
                            type="text" 
                            required
                            placeholder="Nhập tên bạn"
                            value={joinerName}
                            onChange={(e) => setJoinerName(e.target.value)}
                            className="bg-brand-light-gray border border-brand-border/50 focus:border-brand-red text-xs px-3 py-2 rounded-lg outline-none w-32"
                          />
                          <button 
                            type="submit"
                            className="bg-green-600 text-white p-2 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setJoiningId(null)}
                            className="bg-brand-light-gray text-brand-gray p-2 rounded-lg text-xs"
                          >
                            Huỷ
                          </button>
                        </form>
                      ) : (
                        <button
                          disabled={spacesLeft <= 0}
                          onClick={() => setJoiningId(op.id)}
                          className={`w-full md:w-auto px-5 py-2.5 rounded-full font-sans font-bold text-xs tracking-wide transition-all cursor-pointer ${
                            spacesLeft <= 0 
                              ? 'bg-brand-border text-brand-gray/50 cursor-not-allowed' 
                              : 'bg-brand-red hover:bg-brand-red-hover text-white shadow-sm shadow-brand-red/10'
                          }`}
                        >
                          {spacesLeft <= 0 ? 'Hết chỗ' : 'Tham gia ngay'}
                        </button>
                      )}

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
