import React, { useState } from 'react';
import { 
  X, LayoutDashboard, MapPin, Trophy, Users, Calendar, 
  Trash2, Edit, Check, Lock, Plus, LogOut, Clock, Sparkles, 
  ShieldCheck, RefreshCw, FileText, CheckCircle,
  DollarSign, TrendingUp, BarChart3, PieChart, PlusCircle, CalendarDays
} from 'lucide-react';
import { Court, Booking, OpenPlay, Tournament, TeamRegistration, SocialRevenue } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  onSaveCourts: (courts: Court[]) => void;
  bookings: Booking[];
  onSaveBookings: (bookings: Booking[]) => void;
  openPlays: OpenPlay[];
  onSaveOpenPlays: (openPlays: OpenPlay[]) => void;
  tournaments: Tournament[];
  onSaveTournaments: (tournaments: Tournament[]) => void;
  teamRegistrations: TeamRegistration[];
  onSaveTeamRegistrations: (regs: TeamRegistration[]) => void;
  socialRevenues: SocialRevenue[];
  onSaveSocialRevenues: (socials: SocialRevenue[]) => void;
}

type AdminTab = 'dashboard' | 'courts' | 'bookings' | 'openplays' | 'tournaments' | 'registrations' | 'revenue';

export default function AdminPanel({
  isOpen,
  onClose,
  courts,
  onSaveCourts,
  bookings,
  onSaveBookings,
  openPlays,
  onSaveOpenPlays,
  tournaments,
  onSaveTournaments,
  teamRegistrations,
  onSaveTeamRegistrations,
  socialRevenues,
  onSaveSocialRevenues
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [authError, setAuthError] = useState('');

  // Editing structures
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [editingOpenPlayId, setEditingOpenPlayId] = useState<string | null>(null);

  // Forms states
  const [courtForm, setCourtForm] = useState<Partial<Court>>({});
  const [tournamentForm, setTournamentForm] = useState<Partial<Tournament>>({});
  const [openPlayForm, setOpenPlayForm] = useState<Partial<OpenPlay>>({});

  // Revenue form and filter states
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState<Partial<SocialRevenue>>({});
  const [filterYear, setFilterYear] = useState<string>('2026');
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterCourt, setFilterCourt] = useState<string>('All');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '8888' || password.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mã bảo mật không đúng! Vui lòng thử lại.');
    }
  };

  // Courts CRUD
  const startEditCourt = (court: Court) => {
    setEditingCourtId(court.id);
    setCourtForm(court);
  };

  const startAddCourt = () => {
    setEditingCourtId('new');
    setCourtForm({
      id: 'court-' + Math.random().toString(36).substr(2, 9),
      name: '',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
      address: '',
      region: 'Hồ Chí Minh',
      rating: 4.8,
      pricePerHour: 150000,
      amenities: ['Wifi miễn phí', 'Cho thuê vợt', 'Sân mái che'],
      slots: ['06:00 - 08:00', '08:00 - 10:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
    });
  };

  const saveCourtForm = () => {
    if (!courtForm.name || !courtForm.address) {
      alert('Vui lòng điền tên và địa chỉ cụm sân!');
      return;
    }
    if (editingCourtId === 'new') {
      onSaveCourts([...courts, courtForm as Court]);
    } else {
      onSaveCourts(courts.map(c => c.id === editingCourtId ? (courtForm as Court) : c));
    }
    setEditingCourtId(null);
    setCourtForm({});
  };

  const deleteCourt = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xoá cụm sân này khỏi hệ thống?')) {
      onSaveCourts(courts.filter(c => c.id !== id));
    }
  };

  // Tournaments CRUD
  const startEditTournament = (tour: Tournament) => {
    setEditingTournamentId(tour.id);
    setTournamentForm(tour);
  };

  const startAddTournament = () => {
    setEditingTournamentId('new');
    setTournamentForm({
      id: 'tour-' + Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      tag: 'CUP MỚI',
      image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800',
      date: '25/08/2026',
      registrationFee: 500000,
      teamsRegistered: 0,
      maxTeams: 32,
      category: 'Đôi Nam / Đôi Nữ / Đôi Nam Nữ',
      status: 'Đang mở'
    });
  };

  const saveTournamentForm = () => {
    if (!tournamentForm.name || !tournamentForm.description) {
      alert('Vui lòng điền đầy đủ tên và mô tả giải đấu!');
      return;
    }
    if (editingTournamentId === 'new') {
      onSaveTournaments([...tournaments, tournamentForm as Tournament]);
    } else {
      onSaveTournaments(tournaments.map(t => t.id === editingTournamentId ? (tournamentForm as Tournament) : t));
    }
    setEditingTournamentId(null);
    setTournamentForm({});
  };

  const deleteTournament = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xoá giải đấu này?')) {
      onSaveTournaments(tournaments.filter(t => t.id !== id));
    }
  };

  // Open Plays CRUD
  const startEditOpenPlay = (op: OpenPlay) => {
    setEditingOpenPlayId(op.id);
    setOpenPlayForm(op);
  };

  const startAddOpenPlay = () => {
    setEditingOpenPlayId('new');
    setOpenPlayForm({
      id: 'op-' + Math.random().toString(36).substr(2, 9),
      title: '',
      level: 'Mọi cấp độ',
      location: courts[0]?.name || 'Pickle Bounce Thảo Điền',
      date: 'Thứ Bảy, Tuần này',
      time: '18:00 - 20:00',
      joinedPlayers: ['Admin'],
      maxPlayers: 6,
      hostName: 'Cộng đồng',
      fee: 50000,
      description: 'Ráp kèo giao lưu, vui vẻ, cọ xát nâng trình!'
    });
  };

  const saveOpenPlayForm = () => {
    if (!openPlayForm.title) {
      alert('Vui lòng điền tiêu đề kèo giao lưu!');
      return;
    }
    if (editingOpenPlayId === 'new') {
      onSaveOpenPlays([...openPlays, openPlayForm as OpenPlay]);
    } else {
      onSaveOpenPlays(openPlays.map(op => op.id === editingOpenPlayId ? (openPlayForm as OpenPlay) : op));
    }
    setEditingOpenPlayId(null);
    setOpenPlayForm({});
  };

  const deleteOpenPlay = (id: string) => {
    if (confirm('Bạn chắc chắn muốn huỷ bỏ kèo giao lưu này khỏi sảnh chờ?')) {
      onSaveOpenPlays(openPlays.filter(op => op.id !== id));
    }
  };

  // Booking log updates
  const toggleBookingStatus = (id: string) => {
    onSaveBookings(bookings.map(b => b.id === id ? {
      ...b,
      status: b.status === 'confirmed' ? 'pending' : 'confirmed'
    } : b));
  };

  const deleteBooking = (id: string) => {
    if (confirm('Huỷ bỏ đơn đặt sân này khỏi danh sách quản lý?')) {
      onSaveBookings(bookings.filter(b => b.id !== id));
    }
  };

  // Registrations updates
  const toggleRegStatus = (id: string) => {
    onSaveTeamRegistrations(teamRegistrations.map(r => r.id === id ? {
      ...r,
      status: r.status === 'confirmed' ? 'pending' : 'confirmed'
    } : r));
  };

  const deleteReg = (id: string) => {
    if (confirm('Xoá đội đăng ký này khỏi giải đấu?')) {
      onSaveTeamRegistrations(teamRegistrations.filter(r => r.id !== id));
    }
  };

  // Social revenues CRUD
  const startEditSocial = (soc: SocialRevenue) => {
    setEditingSocialId(soc.id);
    setSocialForm(soc);
  };

  const startAddSocial = () => {
    setEditingSocialId('new');
    setSocialForm({
      id: 'soc-' + Math.random().toString(36).substr(2, 9),
      courtId: courts[0]?.id || 'court-1',
      courtName: courts[0]?.name || 'Sân 1 - Sport Pickle Bounce',
      date: new Date().toISOString().split('T')[0],
      amount: 300000,
      playersCount: 4,
      notes: '',
      createdAt: new Date().toISOString()
    });
  };

  const saveSocialForm = () => {
    if (!socialForm.amount || socialForm.amount <= 0) {
      alert('Vui lòng nhập số tiền doanh thu hợp lệ!');
      return;
    }
    const selectedCourtObj = courts.find(c => c.id === socialForm.courtId);
    const updatedForm = {
      ...socialForm,
      courtName: selectedCourtObj ? selectedCourtObj.name : (socialForm.courtName || 'Cụm sân'),
    } as SocialRevenue;

    if (editingSocialId === 'new') {
      onSaveSocialRevenues([...socialRevenues, updatedForm]);
    } else {
      onSaveSocialRevenues(socialRevenues.map(s => s.id === editingSocialId ? updatedForm : s));
    }
    setEditingSocialId(null);
    setSocialForm({});
  };

  const deleteSocial = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xoá khoản doanh thu khách lẻ này?')) {
      onSaveSocialRevenues(socialRevenues.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-5xl h-[90vh] shadow-2xl border border-brand-border/40 overflow-hidden relative flex flex-col">
        
        {/* Header Block */}
        <div className="bg-brand-dark p-5 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
          <div className="absolute right-0 top-0 text-white/5 font-display font-black text-9xl transform translate-x-12 -translate-y-8 pointer-events-none">
            A
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-display font-bold text-[10px] tracking-widest text-brand-red uppercase">
                HỆ THỐNG ĐIỀU HÀNH
              </span>
              <h2 className="font-display font-black text-xl tracking-tight mt-0.5 flex items-center gap-2">
                Cổng Quản Trị Pickle Bounce
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {isAuthenticated && (
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authentication Form */}
        {!isAuthenticated ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-brand-red-light rounded-full flex items-center justify-center text-brand-red mb-6 animate-pulse">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-xl text-brand-dark mb-2">
              Xác Minh Quyền Quản Trị Viên
            </h3>
            <p className="font-sans text-xs text-brand-gray mb-6 leading-relaxed">
              Vui lòng nhập mã PIN bảo mật để truy cập bảng quản lý và điều chỉnh thông tin cụm sân, kèo đấu, giải đấu, và người đăng ký.
              <br />
              <span className="inline-block bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                MÃ PIN DEMO: <strong className="font-mono">8888</strong> hoặc <strong className="font-mono">admin</strong>
              </span>
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input 
                type="password"
                required
                placeholder="Nhập mã bảo mật (e.g. 8888)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-center bg-brand-light-gray border border-brand-border/60 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-xl px-4 py-3 text-sm text-brand-dark font-black tracking-widest outline-none transition-all"
              />
              {authError && (
                <p className="text-brand-red text-xs font-semibold">{authError}</p>
              )}
              <button 
                type="submit"
                className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-xs py-3 rounded-full transition-colors cursor-pointer shadow-lg shadow-brand-red/10 uppercase tracking-wider"
              >
                Truy Cập Hệ Thống
              </button>
            </form>
          </div>
        ) : (
          /* Main Dashboard layout */
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-brand-light-gray border-b md:border-b-0 md:border-r border-brand-border/40 p-4 space-y-1 overflow-y-auto flex-shrink-0 flex md:block flex-nowrap whitespace-nowrap md:whitespace-normal gap-2">
              <div className="hidden md:block text-[9px] font-bold text-brand-gray uppercase tracking-widest px-3 mb-2">
                Hệ điều hành
              </div>
              <button 
                onClick={() => { setActiveTab('dashboard'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard Tổng Quan</span>
              </button>

              <button 
                onClick={() => { setActiveTab('courts'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'courts' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Quản Lý Cụm Sân</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{courts.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('bookings'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'bookings' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Đơn Đặt Sân Chơi</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{bookings.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('openplays'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'openplays' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Quản Lý Kèo Ghép</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{openPlays.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('tournaments'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'tournaments' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <Trophy className="w-4 h-4 flex-shrink-0" />
                <span>Quản Lý Giải Đấu</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{tournaments.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('registrations'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'registrations' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Danh Sách Đăng Ký Giải</span>
                <span className="bg-brand-dark/15 text-[10px] px-1.5 py-0.5 rounded ml-auto">{teamRegistrations.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('revenue'); setEditingCourtId(null); setEditingTournamentId(null); setEditingOpenPlayId(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'revenue' 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-brand-dark/80 hover:bg-white hover:text-brand-red'
                }`}
              >
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                <span>Doanh Thu Thực Tế</span>
                <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded ml-auto font-black font-sans uppercase">
                  VND
                </span>
              </button>
            </div>

            {/* Main Tab Content Panel */}
            <div className="flex-grow p-6 overflow-y-auto bg-white dark-scroll">

              {/* 1. Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-brand-dark">Tổng Quan Hiệu Suất Vận Hành</h3>
                    <p className="font-sans text-xs text-brand-gray mt-1">Dữ liệu phân tích thời gian thực thu được trong phiên lưu trữ hiện tại.</p>
                  </div>

                  {/* Stat cards bento grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{courts.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Cụm Sân Hoạt Động</div>
                      <MapPin className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{bookings.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Tổng Lượt Đặt Sân</div>
                      <Calendar className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{openPlays.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Kèo Giao Lưu Đang Mở</div>
                      <Users className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                    <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                      <div className="text-brand-red font-display font-black text-3xl">{teamRegistrations.length}</div>
                      <div className="font-sans text-xs font-bold text-brand-dark/80 mt-1">Đội Đăng Ký Đấu Cup</div>
                      <Trophy className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                    </div>
                  </div>

                  {/* Booking list overview & rapid actions */}
                  <div className="pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-base text-brand-dark flex items-center gap-1.5">
                        <Sparkles className="w-4.5 h-4.5 text-brand-red" />
                        Giao dịch / Lượt Đặt Sân Gần Nhất
                      </h4>
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="font-sans font-bold text-xs text-brand-red hover:underline"
                      >
                        Quản lý tất cả ({bookings.length}) →
                      </button>
                    </div>

                    <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                            <th className="p-3">Mã đơn</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3">Sân đấu</th>
                            <th className="p-3">Thời gian</th>
                            <th className="p-3">Tổng tiền</th>
                            <th className="p-3 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40">
                          {bookings.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-brand-gray">Chưa có lịch đặt sân nào từ người dùng.</td>
                            </tr>
                          ) : (
                            bookings.slice(0, 5).map((booking) => (
                              <tr key={booking.id} className="hover:bg-brand-light-gray/50">
                                <td className="p-3 font-mono font-bold text-brand-dark">{booking.id}</td>
                                <td className="p-3">
                                  <div className="font-bold text-brand-dark">{booking.fullName}</div>
                                  <div className="text-[10px] text-brand-gray">{booking.phone}</div>
                                </td>
                                <td className="p-3 font-semibold text-brand-dark">{booking.courtName}</td>
                                <td className="p-3">
                                  <div>Ngày {booking.date.split('-').reverse().join('/')}</div>
                                  <div className="text-[10px] text-brand-red font-semibold">{booking.timeSlot}</div>
                                </td>
                                <td className="p-3 font-bold text-brand-dark">{booking.totalPrice.toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 text-center">
                                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Courts Management Tab */}
              {activeTab === 'courts' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Quản Lý Danh Sách Cụm Sân</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Sửa đổi giá giờ chơi, thêm mới các cụm sân có mái che hoặc chỉnh sửa tiện ích.</p>
                    </div>
                    {editingCourtId === null && (
                      <button 
                        onClick={startAddCourt}
                        className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Cụm Sân Mới
                      </button>
                    )}
                  </div>

                  {editingCourtId !== null ? (
                    /* Edit Court form */
                    <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4">
                      <h4 className="font-display font-bold text-base text-brand-dark">
                        {editingCourtId === 'new' ? 'Thêm Cụm Sân Mới Vào Hệ Thống' : `Chỉnh sửa: ${courtForm.name}`}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tên cụm sân</label>
                          <input 
                            type="text"
                            value={courtForm.name || ''}
                            onChange={(e) => setCourtForm({...courtForm, name: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Pickle Bounce Thảo Điền"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Địa chỉ chính xác</label>
                          <input 
                            type="text"
                            value={courtForm.address || ''}
                            onChange={(e) => setCourtForm({...courtForm, address: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Số 12 Nguyễn Văn Hưởng..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Khu vực (Bộ lọc)</label>
                          <input 
                            type="text"
                            value={courtForm.region || ''}
                            onChange={(e) => setCourtForm({...courtForm, region: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Giá thuê 1 Giờ (VND)</label>
                          <input 
                            type="number"
                            step={10000}
                            value={courtForm.pricePerHour || 0}
                            onChange={(e) => setCourtForm({...courtForm, pricePerHour: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Đánh giá sao (1-5)</label>
                          <input 
                            type="number"
                            step={0.1}
                            min={1}
                            max={5}
                            value={courtForm.rating || 4.8}
                            onChange={(e) => setCourtForm({...courtForm, rating: parseFloat(e.target.value) || 4.8})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Đường dẫn ảnh cụm sân</label>
                          <input 
                            type="text"
                            value={courtForm.image || ''}
                            onChange={(e) => setCourtForm({...courtForm, image: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                        <button 
                          onClick={() => { setEditingCourtId(null); setCourtForm({}); }}
                          className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          onClick={saveCourtForm}
                          className="bg-brand-red text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Lưu Cấu Hình
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display list of courts in simple grid cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courts.map(court => (
                        <div key={court.id} className="p-4 rounded-2xl border border-brand-border/40 bg-white flex gap-4 relative group">
                          <img 
                            src={court.image} 
                            alt={court.name}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-grow space-y-1 overflow-hidden">
                            <span className="inline-block bg-brand-red-light text-brand-red text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              {court.region}
                            </span>
                            <h4 className="font-display font-bold text-sm text-brand-dark truncate">{court.name}</h4>
                            <p className="font-sans text-[11px] text-brand-gray truncate">{court.address}</p>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="font-sans text-xs text-brand-dark font-bold">Giá: {court.pricePerHour.toLocaleString('vi-VN')}đ/h</span>
                              <span className="font-sans text-[11px] text-green-600 font-bold">★ {court.rating}</span>
                            </div>
                          </div>

                          <div className="absolute top-4 right-4 flex gap-1">
                            <button 
                              onClick={() => startEditCourt(court)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-1.5 rounded text-brand-gray transition-colors cursor-pointer"
                              title="Sửa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteCourt(court.id)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-1.5 rounded text-brand-gray transition-colors cursor-pointer"
                              title="Xoá"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Bookings Log Tab */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-brand-dark">Danh Sách Lịch Đặt Sân Chơi</h3>
                    <p className="font-sans text-xs text-brand-gray mt-1">Quản lý duyệt đơn đặt sân của khách hàng, huỷ các lượt đặt quá hạn hoặc đổi trạng thái.</p>
                  </div>

                  <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                          <th className="p-3">Mã đơn</th>
                          <th className="p-3">Họ và tên</th>
                          <th className="p-3">Số điện thoại</th>
                          <th className="p-3">Sân đã chọn</th>
                          <th className="p-3">Ngày & Ca</th>
                          <th className="p-3">Thành tiền</th>
                          <th className="p-3 text-center">Xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-brand-gray">Chưa ghi nhận lượt đặt sân nào.</td>
                          </tr>
                        ) : (
                          bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-brand-light-gray/50">
                              <td className="p-3 font-mono font-bold text-brand-red">{booking.id}</td>
                              <td className="p-3 font-semibold text-brand-dark">{booking.fullName}</td>
                              <td className="p-3 font-mono text-brand-gray">{booking.phone}</td>
                              <td className="p-3 font-bold text-brand-dark">{booking.courtName}</td>
                              <td className="p-3">
                                <div>{booking.date.split('-').reverse().join('/')}</div>
                                <div className="text-[10px] text-brand-red font-semibold">{booking.timeSlot}</div>
                              </td>
                              <td className="p-3 font-bold text-brand-dark">{booking.totalPrice.toLocaleString('vi-VN')}đ</td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                    onClick={() => toggleBookingStatus(booking.id)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                      booking.status === 'confirmed' 
                                        ? 'bg-green-100 text-green-700 hover:bg-yellow-100 hover:text-yellow-700' 
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-green-100 hover:text-green-700'
                                    }`}
                                  >
                                    {booking.status === 'confirmed' ? 'Duyệt xong' : 'Ấn Duyệt'}
                                  </button>
                                  <button 
                                    onClick={() => deleteBooking(booking.id)}
                                    className="p-1.5 hover:bg-brand-red-light hover:text-brand-red rounded text-brand-gray/50 transition-all cursor-pointer"
                                    title="Xoá đơn"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Open Plays Management Tab */}
              {activeTab === 'openplays' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Quản Lý Kèo Ghép Cộng Đồng</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Thêm các kèo đấu mẫu của Ban tổ chức hoặc huỷ các tin đăng có thông tin không phù hợp.</p>
                    </div>
                    {editingOpenPlayId === null && (
                      <button 
                        onClick={startAddOpenPlay}
                        className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Tạo Kèo Đấu Mới
                      </button>
                    )}
                  </div>

                  {editingOpenPlayId !== null ? (
                    /* Edit/Add Open Play form */
                    <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4">
                      <h4 className="font-display font-bold text-base text-brand-dark">
                        {editingOpenPlayId === 'new' ? 'Khởi Tạo Kèo Ghép Mới' : `Sửa kèo: ${openPlayForm.title}`}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tiêu đề kèo giao lưu</label>
                          <input 
                            type="text"
                            value={openPlayForm.title || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, title: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Giao lưu cuối tuần..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Sân chơi (Địa điểm)</label>
                          <select 
                            value={openPlayForm.location || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, location: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-2.5 py-2 text-xs text-brand-dark font-medium outline-none"
                          >
                            {courts.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Cấp độ yêu cầu</label>
                          <select 
                            value={openPlayForm.level || 'Mọi cấp độ'}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, level: e.target.value as any})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-2.5 py-2 text-xs text-brand-dark outline-none"
                          >
                            <option value="Mọi cấp độ">Mọi cấp độ</option>
                            <option value="Người mới (1.0-2.5)">Người mới (1.0-2.5)</option>
                            <option value="Trung cấp (2.5-3.5)">Trung cấp (2.5-3.5)</option>
                            <option value="Nâng cao (3.5+)">Nâng cao (3.5+)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ngày diễn ra</label>
                          <input 
                            type="text"
                            value={openPlayForm.date || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, date: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            placeholder="Chủ Nhật, Tuần này"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Giờ diễn ra</label>
                          <input 
                            type="text"
                            value={openPlayForm.time || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, time: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            placeholder="18:00 - 20:00"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Phí chia sân (VND)</label>
                          <input 
                            type="number"
                            value={openPlayForm.fee || 0}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, fee: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số lượng tối đa</label>
                          <input 
                            type="number"
                            value={openPlayForm.maxPlayers || 4}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, maxPlayers: parseInt(e.target.value) || 4})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Người đăng (Host)</label>
                          <input 
                            type="text"
                            value={openPlayForm.hostName || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, hostName: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Nội dung / Mô tả kèo</label>
                          <input 
                            type="text"
                            value={openPlayForm.description || ''}
                            onChange={(e) => setOpenPlayForm({...openPlayForm, description: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                        <button 
                          onClick={() => { setEditingOpenPlayId(null); setOpenPlayForm({}); }}
                          className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          onClick={saveOpenPlayForm}
                          className="bg-brand-red text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Lưu Kèo Đấu
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display List */
                    <div className="space-y-3">
                      {openPlays.map(op => (
                        <div key={op.id} className="p-4 rounded-xl border border-brand-border/40 bg-white flex justify-between items-center gap-4">
                          <div>
                            <span className="bg-brand-dark/10 text-brand-dark text-[9px] font-bold px-2 py-0.5 rounded">
                              {op.level}
                            </span>
                            <h4 className="font-display font-bold text-sm text-brand-dark mt-1">{op.title}</h4>
                            <p className="font-sans text-xs text-brand-gray">{op.location} • {op.date} lúc {op.time}</p>
                            <div className="text-[10px] text-brand-gray mt-1">Host: <strong>{op.hostName}</strong> • Sĩ số: <strong>{op.joinedPlayers.length}/{op.maxPlayers}</strong> • Phí: <strong>{op.fee.toLocaleString('vi-VN')} VND</strong></div>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => startEditOpenPlay(op)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteOpenPlay(op.id)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Tournaments Tab */}
              {activeTab === 'tournaments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-display font-black text-xl text-brand-dark">Cấu Hình Giải Đấu Cup</h3>
                      <p className="font-sans text-xs text-brand-gray mt-1">Thiết lập các giải đấu cộng đồng phong trào hoặc giải đấu đối tác doanh nghiệp.</p>
                    </div>
                    {editingTournamentId === null && (
                      <button 
                        onClick={startAddTournament}
                        className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Tạo Giải Đấu Mới
                      </button>
                    )}
                  </div>

                  {editingTournamentId !== null ? (
                    /* Edit/Add Tournament form */
                    <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4">
                      <h4 className="font-display font-bold text-base text-brand-dark">
                        {editingTournamentId === 'new' ? 'Mở Giải Đấu Mới' : `Sửa giải đấu: ${tournamentForm.name}`}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tên giải đấu</label>
                          <input 
                            type="text"
                            value={tournamentForm.name || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-medium outline-none"
                            placeholder="Bounce Cup 2026..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Tag nhận diện (e.g. BOUNCE CUP)</label>
                          <input 
                            type="text"
                            value={tournamentForm.tag || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, tag: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ngày thi đấu</label>
                          <input 
                            type="text"
                            value={tournamentForm.date || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, date: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Hạng mục</label>
                          <input 
                            type="text"
                            value={tournamentForm.category || ''}
                            onChange={(e) => setTournamentForm({...tournamentForm, category: e.target.value})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            placeholder="Đôi Nam / Đôi Nữ / Đôi Nam Nữ"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Trạng thái giải</label>
                          <select 
                            value={tournamentForm.status || 'Đang mở'}
                            onChange={(e) => setTournamentForm({...tournamentForm, status: e.target.value as any})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-2.5 py-2 text-xs text-brand-dark outline-none"
                          >
                            <option value="Đang mở">Đang mở</option>
                            <option value="Sắp diễn ra">Sắp diễn ra</option>
                            <option value="Đã kết thúc">Đã kết thúc</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Lệ phí giải đấu (VND / Cặp)</label>
                          <input 
                            type="number"
                            value={tournamentForm.registrationFee || 0}
                            onChange={(e) => setTournamentForm({...tournamentForm, registrationFee: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số đội tối đa</label>
                          <input 
                            type="number"
                            value={tournamentForm.maxTeams || 16}
                            onChange={(e) => setTournamentForm({...tournamentForm, maxTeams: parseInt(e.target.value) || 16})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số đội đã đăng ký (Bổ sung)</label>
                          <input 
                            type="number"
                            value={tournamentForm.teamsRegistered || 0}
                            onChange={(e) => setTournamentForm({...tournamentForm, teamsRegistered: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Mô tả tóm tắt giải</label>
                        <textarea 
                          value={tournamentForm.description || ''}
                          onChange={(e) => setTournamentForm({...tournamentForm, description: e.target.value})}
                          className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none h-16 resize-none"
                          placeholder="Mô tả giải đấu..."
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                        <button 
                          onClick={() => { setEditingTournamentId(null); setTournamentForm({}); }}
                          className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          onClick={saveTournamentForm}
                          className="bg-brand-red text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Lưu Giải Đấu
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display list of tournaments */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tournaments.map(t => (
                        <div key={t.id} className="p-4 rounded-2xl border border-brand-border/40 bg-white flex flex-col justify-between relative group">
                          <div>
                            <span className="bg-brand-red text-white text-[9px] font-bold px-2 py-0.5 rounded">
                              {t.tag}
                            </span>
                            <h4 className="font-display font-bold text-base text-brand-dark mt-2">{t.name}</h4>
                            <p className="font-sans text-xs text-brand-gray mt-1 leading-snug line-clamp-2">{t.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-brand-gray pt-3">
                              <div>Khởi tranh: <strong className="text-brand-dark">{t.date}</strong></div>
                              <div>Hạng mục: <strong className="text-brand-dark">{t.category}</strong></div>
                              <div>Sĩ số: <strong className="text-brand-red">{t.teamsRegistered}/{t.maxTeams} Đội</strong></div>
                              <div>Lệ phí: <strong className="text-brand-dark">{t.registrationFee.toLocaleString('vi-VN')} VND</strong></div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4 border-t border-brand-border/30 mt-3">
                            <button 
                              onClick={() => startEditTournament(t)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteTournament(t.id)}
                              className="bg-brand-light-gray hover:bg-brand-red-light hover:text-brand-red p-2 rounded text-brand-gray transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Tournament Registrations Tab */}
              {activeTab === 'registrations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-brand-dark">Cổng Đăng Ký Giải Đấu Của Các Cặp Đấu</h3>
                    <p className="font-sans text-xs text-brand-gray mt-1">Xem danh sách các đội đăng ký thi đấu, xác nhận trạng thái lệ phí giải đấu.</p>
                  </div>

                  <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                          <th className="p-3">Mã đăng ký</th>
                          <th className="p-3">Tên Đội</th>
                          <th className="p-3">Giải Đấu</th>
                          <th className="p-3">Thành viên</th>
                          <th className="p-3">Liên hệ</th>
                          <th className="p-3 text-center">Xử lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {teamRegistrations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-brand-gray">Chưa ghi nhận lượt đăng ký thi đấu giải nào.</td>
                          </tr>
                        ) : (
                          teamRegistrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-brand-light-gray/50">
                              <td className="p-3 font-mono font-bold text-brand-red">{reg.id}</td>
                              <td className="p-3 font-black text-brand-dark">{reg.teamName}</td>
                              <td className="p-3 font-bold text-brand-dark truncate max-w-[150px]" title={reg.tournamentName}>{reg.tournamentName}</td>
                              <td className="p-3 text-[11px]">
                                <div>Cầu thủ 1: <strong>{reg.player1}</strong></div>
                                <div>Cầu thủ 2: <strong>{reg.player2}</strong></div>
                              </td>
                              <td className="p-3">
                                <div>{reg.phone}</div>
                                <div className="text-[10px] text-brand-gray">{reg.email}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                    onClick={() => toggleRegStatus(reg.id)}
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                      reg.status === 'confirmed' 
                                        ? 'bg-green-100 text-green-700 hover:bg-yellow-100 hover:text-yellow-700' 
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-green-100 hover:text-green-700'
                                    }`}
                                  >
                                    {reg.status === 'confirmed' ? 'Đã đóng lệ phí' : 'Chờ đóng lệ phí'}
                                  </button>
                                  <button 
                                    onClick={() => deleteReg(reg.id)}
                                    className="p-1.5 hover:bg-brand-red-light hover:text-brand-red rounded text-brand-gray/50 transition-all cursor-pointer"
                                    title="Xoá đăng ký"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. Actual Revenue Management Tab */}
              {activeTab === 'revenue' && (() => {
                // Prepare all transaction rows
                const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
                
                const onlineTx = confirmedBookings.map(b => ({
                  id: b.id,
                  type: 'online' as const,
                  date: b.date,
                  amount: b.totalPrice,
                  courtId: b.courtId,
                  courtName: b.courtName,
                  detail: `Khách đặt sân: ${b.fullName} (${b.phone}) - Ca ${b.timeSlot}`,
                  createdAt: b.createdAt || b.date + 'T12:00:00Z'
                }));

                const socialTx = socialRevenues.map(s => ({
                  id: s.id,
                  type: 'social' as const,
                  date: s.date,
                  amount: s.amount,
                  courtId: s.courtId,
                  courtName: s.courtName,
                  detail: `Khách lẻ social: ${s.notes || 'Chơi giao lưu tự do'} - ${s.playersCount} người`,
                  createdAt: s.createdAt || s.date + 'T12:00:00Z'
                }));

                // Combine and sort by date descending
                const allTx = [...onlineTx, ...socialTx].sort((a, b) => {
                  const dateCompare = b.date.localeCompare(a.date);
                  if (dateCompare !== 0) return dateCompare;
                  return b.createdAt.localeCompare(a.createdAt);
                });

                // Apply Filters
                const filteredTx = allTx.filter(tx => {
                  const txYear = tx.date.split('-')[0];
                  const txMonth = tx.date.split('-')[1]; // "01", "02", etc.
                  
                  const yearMatch = filterYear === 'All' || txYear === filterYear;
                  const monthMatch = filterMonth === 'All' || txMonth === filterMonth;
                  const courtMatch = filterCourt === 'All' || tx.courtId === filterCourt;
                  
                  return yearMatch && monthMatch && courtMatch;
                });

                // Aggregated stats
                const totalRevenue = filteredTx.reduce((sum, t) => sum + t.amount, 0);
                const onlineRevenue = filteredTx.filter(t => t.type === 'online').reduce((sum, t) => sum + t.amount, 0);
                const socialRevenue = filteredTx.filter(t => t.type === 'social').reduce((sum, t) => sum + t.amount, 0);
                const averageTxAmount = filteredTx.length > 0 ? Math.round(totalRevenue / filteredTx.length) : 0;

                // Group data for the charts
                // If filterYear is "All", group by Year (2024, 2025, 2026, 2027 etc.)
                // If filterYear is specific, group by Month (01 to 12)
                const yearsInDataset = Array.from(new Set(allTx.map(t => t.date.split('-')[0]))).sort();
                
                let chartData: { label: string; online: number; social: number; total: number }[] = [];
                
                if (filterYear === 'All') {
                  chartData = yearsInDataset.map(yr => {
                    const yearTxs = allTx.filter(t => t.date.startsWith(yr) && (filterCourt === 'All' || t.courtId === filterCourt));
                    const onlineVal = yearTxs.filter(t => t.type === 'online').reduce((sum, t) => sum + t.amount, 0);
                    const socialVal = yearTxs.filter(t => t.type === 'social').reduce((sum, t) => sum + t.amount, 0);
                    return {
                      label: `Năm ${yr}`,
                      online: onlineVal,
                      social: socialVal,
                      total: onlineVal + socialVal
                    };
                  });
                } else {
                  // Monthly of selected year
                  const monthsList = [
                    { key: '01', name: 'T1' },
                    { key: '02', name: 'T2' },
                    { key: '03', name: 'T3' },
                    { key: '04', name: 'T4' },
                    { key: '05', name: 'T5' },
                    { key: '06', name: 'T6' },
                    { key: '07', name: 'T7' },
                    { key: '08', name: 'T8' },
                    { key: '09', name: 'T9' },
                    { key: '10', name: 'T10' },
                    { key: '11', name: 'T11' },
                    { key: '12', name: 'T12' },
                  ];
                  chartData = monthsList.map(m => {
                    const monthTxs = allTx.filter(t => t.date.startsWith(`${filterYear}-${m.key}`) && (filterCourt === 'All' || t.courtId === filterCourt));
                    const onlineVal = monthTxs.filter(t => t.type === 'online').reduce((sum, t) => sum + t.amount, 0);
                    const socialVal = monthTxs.filter(t => t.type === 'social').reduce((sum, t) => sum + t.amount, 0);
                    return {
                      label: m.name,
                      online: onlineVal,
                      social: socialVal,
                      total: onlineVal + socialVal
                    };
                  });
                }

                // Max value for scaling chart bars
                const maxChartVal = Math.max(...chartData.map(d => d.total), 100000);

                return (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Title Block */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h3 className="font-display font-black text-xl text-brand-dark flex items-center gap-2">
                          <DollarSign className="w-6 h-6 text-green-600 bg-green-100 p-1 rounded-full" />
                          Báo Cáo Doanh Thu Thực Tế Của Sân
                        </h3>
                        <p className="font-sans text-xs text-brand-gray mt-1">
                          Thống kê kết hợp doanh thu đặt sân trực tuyến thành công và ghi nhận khách lẻ đánh social vãng lai (Chỉ hiển thị cho Admin).
                        </p>
                      </div>
                      
                      <button 
                        onClick={startAddSocial}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors shadow-lg shadow-green-600/10"
                      >
                        <Plus className="w-4 h-4" />
                        Ghi Nhận Khách Lẻ (Social)
                      </button>
                    </div>

                    {/* Filter controls section */}
                    <div className="bg-brand-light-gray/60 border border-brand-border/40 p-4 rounded-2xl flex flex-wrap gap-4 items-end">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider">Chọn Năm</label>
                        <select 
                          value={filterYear}
                          onChange={(e) => { setFilterYear(e.target.value); setFilterMonth('All'); }}
                          className="bg-white border border-brand-border/40 rounded-xl px-3 py-1.5 text-xs text-brand-dark font-semibold outline-none"
                        >
                          <option value="All">Tất cả các năm</option>
                          <option value="2026">Năm 2026</option>
                          <option value="2025">Năm 2025</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider">Chọn Tháng</label>
                        <select 
                          value={filterMonth}
                          disabled={filterYear === 'All'}
                          onChange={(e) => setFilterMonth(e.target.value)}
                          className="bg-white border border-brand-border/40 rounded-xl px-3 py-1.5 text-xs text-brand-dark font-semibold outline-none disabled:opacity-50"
                        >
                          <option value="All">Tất cả các tháng</option>
                          <option value="01">Tháng 1</option>
                          <option value="02">Tháng 2</option>
                          <option value="03">Tháng 3</option>
                          <option value="04">Tháng 4</option>
                          <option value="05">Tháng 5</option>
                          <option value="06">Tháng 6</option>
                          <option value="07">Tháng 7</option>
                          <option value="08">Tháng 8</option>
                          <option value="09">Tháng 9</option>
                          <option value="10">Tháng 10</option>
                          <option value="11">Tháng 11</option>
                          <option value="12">Tháng 12</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider">Lọc theo cụm sân</label>
                        <select 
                          value={filterCourt}
                          onChange={(e) => setFilterCourt(e.target.value)}
                          className="bg-white border border-brand-border/40 rounded-xl px-3 py-1.5 text-xs text-brand-dark font-semibold outline-none"
                        >
                          <option value="All">Tất cả các sân</option>
                          {courts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        onClick={() => { setFilterYear('2026'); setFilterMonth('All'); setFilterCourt('All'); }}
                        className="text-xs font-bold text-brand-gray hover:text-brand-red ml-auto pb-2 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Đặt lại bộ lọc
                      </button>
                    </div>

                    {/* Stats Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-dark/90 text-white relative overflow-hidden shadow-md">
                        <div className="text-2xl font-display font-black text-green-400">
                          {totalRevenue.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-white/70 mt-1 uppercase tracking-wider">Tổng Doanh Thu Thực Tế</div>
                        <TrendingUp className="w-12 h-12 text-white/5 absolute -right-2 -bottom-2" />
                      </div>

                      <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                        <div className="text-xl font-display font-black text-brand-red">
                          {onlineRevenue.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-brand-gray mt-1 uppercase tracking-wider">Đặt Sân Online ({filteredTx.filter(t => t.type === 'online').length} ca)</div>
                        <CheckCircle className="w-12 h-12 text-brand-red/5 absolute -right-2 -bottom-2" />
                      </div>

                      <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                        <div className="text-xl font-display font-black text-green-600">
                          {socialRevenue.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-brand-gray mt-1 uppercase tracking-wider">Khách Lẻ Social ({filteredTx.filter(t => t.type === 'social').length} lượt)</div>
                        <Users className="w-12 h-12 text-green-600/5 absolute -right-2 -bottom-2" />
                      </div>

                      <div className="p-5 rounded-2xl bg-brand-light-gray border border-brand-border/40 relative overflow-hidden">
                        <div className="text-xl font-display font-black text-brand-dark">
                          {averageTxAmount.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="font-sans text-[11px] font-bold text-brand-gray mt-1 uppercase tracking-wider">Doanh thu trung bình / ca</div>
                        <DollarSign className="w-12 h-12 text-brand-dark/5 absolute -right-2 -bottom-2" />
                      </div>

                    </div>

                    {/* Chart & visual analytics block */}
                    <div className="bg-white border border-brand-border/40 p-5 rounded-3xl space-y-4">
                      <div>
                        <h4 className="font-display font-bold text-sm text-brand-dark flex items-center gap-1.5">
                          <BarChart3 className="w-4.5 h-4.5 text-green-600" />
                          Biểu Đồ Doanh Thu Lũy Kế {filterYear === 'All' ? 'Theo Năm' : `Các Tháng Trong Năm ${filterYear}`}
                        </h4>
                        <p className="font-sans text-[11px] text-brand-gray mt-0.5">
                          Trực quan hóa doanh thu Online (<span className="text-brand-red font-semibold">Màu đỏ</span>) và doanh thu Khách lẻ Social (<span className="text-green-600 font-semibold">Màu xanh</span>).
                        </p>
                      </div>

                      {/* Visual Chart Canvas (custom SVG for pixel perfect look & responsiveness) */}
                      <div className="pt-4 pb-2">
                        <div className="relative h-64 w-full flex items-end justify-between gap-1 sm:gap-2 border-b border-brand-border/50 pb-2">
                          
                          {/* Chart Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4">
                            {[0, 1, 2, 3, 4].reverse().map((i) => (
                              <div key={i} className="w-full border-t border-brand-light-gray/60 flex justify-between text-[8px] text-brand-gray font-mono pt-0.5">
                                <span>{Math.round((maxChartVal * i) / 4).toLocaleString('vi-VN')}đ</span>
                              </div>
                            ))}
                          </div>

                          {/* Chart Bars */}
                          <div className="relative z-10 w-full h-full flex items-end justify-around">
                            {chartData.map((data, idx) => {
                              const onlinePercent = (data.online / maxChartVal) * 100;
                              const socialPercent = (data.social / maxChartVal) * 100;
                              const totalPercent = (data.total / maxChartVal) * 100;

                              return (
                                <div key={idx} className="flex flex-col items-center flex-grow group max-w-[40px] sm:max-w-[50px] relative">
                                  
                                  {/* Custom Hover Tooltip */}
                                  <div className="absolute bottom-full mb-2 bg-brand-dark text-white rounded-lg p-2.5 shadow-xl text-[10px] w-36 pointer-events-none hidden group-hover:block z-30 transition-all text-left">
                                    <div className="font-bold border-b border-white/10 pb-1 mb-1">{data.label}</div>
                                    <div className="flex justify-between text-brand-red font-semibold">
                                      <span>Online:</span>
                                      <span>{data.online.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between text-green-400 font-semibold">
                                      <span>Social:</span>
                                      <span>{data.social.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1 mt-1">
                                      <span>Tổng cộng:</span>
                                      <span>{data.total.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                  </div>

                                  {/* Stacked Bar Container */}
                                  <div className="w-5 sm:w-7 h-48 bg-brand-light-gray rounded-t-lg overflow-hidden flex flex-col justify-end relative shadow-inner">
                                    {/* Social Bar (Green) at top */}
                                    <div 
                                      style={{ height: `${socialPercent}%` }} 
                                      className="bg-green-600 hover:bg-green-700 w-full transition-all duration-500 rounded-t-md" 
                                    />
                                    {/* Online Bar (Red) */}
                                    <div 
                                      style={{ height: `${onlinePercent}%` }} 
                                      className="bg-brand-red hover:bg-brand-red-hover w-full transition-all duration-500" 
                                    />
                                  </div>

                                  {/* Label text */}
                                  <span className="text-[10px] font-black text-brand-dark mt-2 font-display">{data.label}</span>
                                  {data.total > 0 && (
                                    <span className="text-[8px] font-mono font-bold text-brand-gray mt-0.5">
                                      {(data.total / 1000).toFixed(0)}k
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-6 justify-center text-[11px] font-semibold text-brand-gray">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-brand-red rounded" />
                          <span>Doanh thu đặt trực tuyến (Online)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-green-600 rounded" />
                          <span>Doanh thu khách lẻ (Social)</span>
                        </div>
                      </div>
                    </div>

                    {/* Editor Form for Adding/Editing Social Guest Play */}
                    {editingSocialId !== null && (
                      <div className="bg-brand-light-gray p-6 rounded-3xl border border-brand-border/40 space-y-4 animate-slideDown">
                        <h4 className="font-display font-black text-sm text-brand-dark flex items-center gap-2">
                          <PlusCircle className="w-5 h-5 text-green-600" />
                          {editingSocialId === 'new' ? 'Ghi Nhận Giao Dịch Khách Lẻ Mới' : 'Chỉnh Sửa Giao Dịch Khách Lẻ'}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          
                          <div>
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Cụm Sân Chơi</label>
                            <select 
                              value={socialForm.courtId || ''}
                              onChange={(e) => setSocialForm({...socialForm, courtId: e.target.value})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            >
                              {courts.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ngày Chôi</label>
                            <input 
                              type="date"
                              value={socialForm.date || ''}
                              onChange={(e) => setSocialForm({...socialForm, date: e.target.value})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Doanh Thu Thu Được (VND)</label>
                            <input 
                              type="number"
                              step={50000}
                              value={socialForm.amount || 0}
                              onChange={(e) => setSocialForm({...socialForm, amount: parseInt(e.target.value) || 0})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark font-bold outline-none"
                              placeholder="300000"
                            />
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Số Lượng Người Chơi</label>
                            <input 
                              type="number"
                              min={1}
                              value={socialForm.playersCount || 4}
                              onChange={(e) => setSocialForm({...socialForm, playersCount: parseInt(e.target.value) || 4})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-1">Ghi chú (Tên nhóm, giờ chơi,...)</label>
                            <input 
                              type="text"
                              value={socialForm.notes || ''}
                              onChange={(e) => setSocialForm({...socialForm, notes: e.target.value})}
                              className="w-full bg-white border border-brand-border/40 rounded-xl px-3 py-2 text-xs text-brand-dark outline-none"
                              placeholder="e.g. Nhóm anh Nam đánh social tối 18-20h sân 1"
                            />
                          </div>

                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/40">
                          <button 
                            onClick={() => { setEditingSocialId(null); setSocialForm({}); }}
                            className="bg-white border border-brand-border/40 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button 
                            onClick={saveSocialForm}
                            className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Lưu Ghi Nhận
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Integrated Stream / Transaction logs */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-display font-bold text-sm text-brand-dark flex items-center gap-1.5">
                          <CalendarDays className="w-4.5 h-4.5 text-brand-red" />
                          Nhật Ký Giao Dịch Doanh Thu ({filteredTx.length} giao dịch)
                        </h4>
                      </div>

                      <div className="bg-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs border-collapse font-sans">
                          <thead>
                            <tr className="bg-brand-light-gray text-brand-gray font-bold border-b border-brand-border/40">
                              <th className="p-3">Ngày</th>
                              <th className="p-3">Loại Doanh Thu</th>
                              <th className="p-3">Sân Đấu</th>
                              <th className="p-3">Mô Tả Chi Tiết</th>
                              <th className="p-3 text-right">Số Tiền (VND)</th>
                              <th className="p-3 text-center">Tác Vụ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/40">
                            {filteredTx.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-brand-gray">Chưa ghi nhận khoản doanh thu nào khớp với bộ lọc.</td>
                              </tr>
                            ) : (
                              filteredTx.map((tx) => (
                                <tr key={tx.id} className="hover:bg-brand-light-gray/50">
                                  <td className="p-3 font-mono font-bold text-brand-dark">
                                    {tx.date.split('-').reverse().join('/')}
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                      tx.type === 'online' 
                                        ? 'bg-brand-red-light text-brand-red' 
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {tx.type === 'online' ? 'Đặt Online' : 'Khách Social'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-bold text-brand-dark">{tx.courtName}</td>
                                  <td className="p-3 text-brand-gray truncate max-w-[300px]" title={tx.detail}>{tx.detail}</td>
                                  <td className="p-3 font-black text-brand-dark text-right text-sm font-sans">
                                    {tx.amount.toLocaleString('vi-VN')}đ
                                  </td>
                                  <td className="p-3 text-center">
                                    {tx.type === 'social' ? (
                                      <div className="flex justify-center gap-1">
                                        <button 
                                          onClick={() => startEditSocial(tx as any)}
                                          className="text-brand-gray hover:text-green-600 p-1 rounded hover:bg-green-50 cursor-pointer"
                                          title="Sửa"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => deleteSocial(tx.id)}
                                          className="text-brand-gray hover:text-brand-red p-1 rounded hover:bg-brand-red-light cursor-pointer"
                                          title="Xóa"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-brand-gray italic">Hệ thống</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
