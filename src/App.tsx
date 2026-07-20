import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Vision from './components/Vision';
import Ecosystem from './components/Ecosystem';
import Tournaments from './components/Tournaments';
import Sponsors from './components/Sponsors';
import Partnership from './components/Partnership';
import AloboLiveSync from './components/AloboLiveSync';
import WeeklySchedule from './components/WeeklySchedule';
import Footer from './components/Footer';

// Interactive modals
import BookingModal from './components/BookingModal';
import MatchLobby from './components/MatchLobby';
import TournamentModal from './components/TournamentModal';
import MyScheduleModal from './components/MyScheduleModal';
import AdminPanel from './components/AdminPanel';
import TrainingModal from './components/TrainingModal';

// Static Data and Types
import { INITIAL_COURTS, INITIAL_OPEN_PLAYS, INITIAL_TOURNAMENTS, SPONSORS } from './data';
import { Booking, OpenPlay, Tournament, TeamRegistration, Court, SocialRevenue, MemberRegistration } from './types';

export default function App() {
  // Modal visibility states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMatchLobbyOpen, setIsMatchLobbyOpen] = useState(false);
  const [isMyScheduleOpen, setIsMyScheduleOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Core App State
  const [memberRegistrations, setMemberRegistrations] = useState<MemberRegistration[]>(() => {
    const saved = localStorage.getItem('pickle_member_registrations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'MEM-7301',
        contractDate: '19/07/2026',
        fullName: 'Anh Khanh (Lớp VIP)',
        dob: '1995-04-12',
        phone: '0908882233',
        preferredTime: 'Thứ 2, 4, 6 (18:00 - 20:00)',
        hoursCount: '20 giờ tập',
        packageType: 'Combo 20 Buổi Chuyên Sâu',
        durationMonths: 6,
        coachName: 'Coach Tommy (Đội tuyển)',
        serviceType: 'Tập luyện cá nhân 1-1',
        totalPrice: 9000000,
        depositAmount: 3000000,
        remainingAmount: 6000000,
        actualPaid: 3000000,
        status: 'confirmed',
        createdAt: '19/07/2026 15:30:22'
      },
      {
        id: 'MEM-7302',
        contractDate: '18/07/2026',
        fullName: 'Chị Mai Anh',
        dob: '1998-09-25',
        phone: '0912445566',
        preferredTime: 'Thứ 3, 5, Bảy (19:00 - 21:00)',
        hoursCount: '10 giờ tập',
        packageType: 'Combo 10 Buổi Nhập Môn',
        durationMonths: 3,
        coachName: 'Coach Lisa (Cựu tuyển thủ quốc gia)',
        serviceType: 'Tập luyện cá nhân 1-1',
        totalPrice: 5000000,
        depositAmount: 5000000,
        remainingAmount: 0,
        actualPaid: 5000000,
        status: 'confirmed',
        createdAt: '18/07/2026 10:15:45'
      }
    ];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('pickle_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved bookings', e);
      }
    }
    return [
      {
        id: 'B-1001',
        courtId: 'court-1',
        courtName: 'Sân 1 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2025-11-12',
        timeSlot: '18:00 - 20:00',
        fullName: 'Nguyễn Minh Quân',
        phone: '0901234567',
        status: 'confirmed',
        totalPrice: 300000,
        isOpenPlay: false,
        createdAt: new Date('2025-11-12T17:30:00Z').toISOString()
      },
      {
        id: 'B-1002',
        courtId: 'court-2',
        courtName: 'Sân 2 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2025-12-14',
        timeSlot: '16:00 - 18:00',
        fullName: 'Trần Thị Thảo',
        phone: '0912345678',
        status: 'confirmed',
        totalPrice: 300000,
        isOpenPlay: false,
        createdAt: new Date('2025-12-14T15:10:00Z').toISOString()
      },
      {
        id: 'B-1003',
        courtId: 'court-3',
        courtName: 'Sân 3 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2026-05-04',
        timeSlot: '08:00 - 10:00',
        fullName: 'Lê Hoàng Hải',
        phone: '0987654321',
        status: 'confirmed',
        totalPrice: 300000,
        isOpenPlay: false,
        createdAt: new Date('2026-05-04T07:45:00Z').toISOString()
      },
      {
        id: 'B-1004',
        courtId: 'court-4',
        courtName: 'Sân 4 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2026-05-18',
        timeSlot: '18:00 - 22:00',
        fullName: 'Phạm Thanh Sơn',
        phone: '0909998887',
        status: 'confirmed',
        totalPrice: 600000,
        isOpenPlay: false,
        createdAt: new Date('2026-05-18T17:15:00Z').toISOString()
      },
      {
        id: 'B-1005',
        courtId: 'court-1',
        courtName: 'Sân 1 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2026-06-08',
        timeSlot: '14:00 - 17:00',
        fullName: 'Bùi Anh Tuấn',
        phone: '0933445566',
        status: 'confirmed',
        totalPrice: 450000,
        isOpenPlay: false,
        createdAt: new Date('2026-06-08T13:30:00Z').toISOString()
      },
      {
        id: 'B-1006',
        courtId: 'court-2',
        courtName: 'Sân 2 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2026-06-22',
        timeSlot: '16:00 - 22:00',
        fullName: 'Đỗ Thùy Trang',
        phone: '0911223344',
        status: 'confirmed',
        totalPrice: 900000,
        isOpenPlay: false,
        createdAt: new Date('2026-06-22T15:45:00Z').toISOString()
      },
      {
        id: 'B-1007',
        courtId: 'court-1',
        courtName: 'Sân 1 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2026-07-01',
        timeSlot: '06:00 - 08:00',
        fullName: 'Nguyễn Văn Minh',
        phone: '0901234567',
        status: 'confirmed',
        totalPrice: 300000,
        isOpenPlay: false,
        createdAt: new Date('2026-07-01T05:50:00Z').toISOString()
      },
      {
        id: 'B-1008',
        courtId: 'court-3',
        courtName: 'Sân 3 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2026-07-15',
        timeSlot: '18:00 - 22:00',
        fullName: 'Hoàng Long',
        phone: '0907654321',
        status: 'confirmed',
        totalPrice: 600000,
        isOpenPlay: true,
        createdAt: new Date('2026-07-15T17:00:00Z').toISOString()
      },
      {
        id: 'B-1009',
        courtId: 'court-2',
        courtName: 'Sân 2 - Sport Pickle Bounce',
        address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
        date: '2026-07-16',
        timeSlot: '16:00 - 19:00',
        fullName: 'Nguyễn Ngọc Anh',
        phone: '0901112223',
        status: 'confirmed',
        totalPrice: 450000,
        isOpenPlay: false,
        createdAt: new Date('2026-07-16T15:20:00Z').toISOString()
      }
    ];
  });

  const [socialRevenues, setSocialRevenues] = useState<SocialRevenue[]>(() => {
    const saved = localStorage.getItem('pickle_social_revenues');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'soc-1',
        courtId: 'court-1',
        courtName: 'Sân 1 - Sport Pickle Bounce',
        date: '2025-11-15',
        amount: 300000,
        playersCount: 4,
        notes: 'Khách vãng lai chơi social buổi tối',
        createdAt: new Date('2025-11-15T18:00:00Z').toISOString()
      },
      {
        id: 'soc-2',
        courtId: 'court-2',
        courtName: 'Sân 2 - Sport Pickle Bounce',
        date: '2025-12-20',
        amount: 450000,
        playersCount: 6,
        notes: 'Kèo social cuối năm giao lưu',
        createdAt: new Date('2025-12-20T19:00:00Z').toISOString()
      },
      {
        id: 'soc-3',
        courtId: 'court-1',
        courtName: 'Sân 1 - Sport Pickle Bounce',
        date: '2026-05-10',
        amount: 600000,
        playersCount: 8,
        notes: 'Nhóm khách lẻ thuê vãng lai trưa',
        createdAt: new Date('2026-05-10T12:00:00Z').toISOString()
      },
      {
        id: 'soc-4',
        courtId: 'court-3',
        courtName: 'Sân 3 - Sport Pickle Bounce',
        date: '2026-06-15',
        amount: 450000,
        playersCount: 4,
        notes: 'Kèo social chiều tối thứ Hai',
        createdAt: new Date('2026-06-15T17:00:00Z').toISOString()
      },
      {
        id: 'soc-5',
        courtId: 'court-2',
        courtName: 'Sân 2 - Sport Pickle Bounce',
        date: '2026-07-02',
        amount: 750000,
        playersCount: 10,
        notes: 'Vãng lai sáng sớm chơi đợt nắng nóng',
        createdAt: new Date('2026-07-02T07:00:00Z').toISOString()
      },
      {
        id: 'soc-6',
        courtId: 'court-4',
        courtName: 'Sân 4 - Sport Pickle Bounce',
        date: '2026-07-10',
        amount: 900000,
        playersCount: 12,
        notes: 'Khách lẻ vãng lai giao lưu buổi chiều tà',
        createdAt: new Date('2026-07-10T16:00:00Z').toISOString()
      },
      {
        id: 'soc-7',
        courtId: 'court-1',
        courtName: 'Sân 1 - Sport Pickle Bounce',
        date: '2026-07-16',
        amount: 450000,
        playersCount: 4,
        notes: 'Khách lẻ đánh social trực tiếp',
        createdAt: new Date('2026-07-16T18:00:00Z').toISOString()
      }
    ];
  });

  const [courts, setCourts] = useState<Court[]>(() => {
    const saved = localStorage.getItem('pickle_courts');
    return saved ? JSON.parse(saved) : INITIAL_COURTS;
  });

  const [openPlays, setOpenPlays] = useState<OpenPlay[]>(() => {
    const saved = localStorage.getItem('pickle_openplays');
    return saved ? JSON.parse(saved) : INITIAL_OPEN_PLAYS;
  });

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('pickle_tournaments');
    return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
  });

  const [teamRegistrations, setTeamRegistrations] = useState<TeamRegistration[]>(() => {
    const saved = localStorage.getItem('pickle_registrations');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'reg-1',
        tournamentId: 'tour-1',
        tournamentName: 'Bounce Cup 2026 - The League',
        teamName: 'Sài Gòn Bouncers',
        player1: 'Nguyễn Văn Minh',
        player2: 'Trần Hữu Kiên',
        phone: '0901234567',
        email: 'sgbouncers@gmail.com',
        status: 'confirmed'
      },
      {
        id: 'reg-2',
        tournamentId: 'tour-1',
        tournamentName: 'Bounce Cup 2026 - The League',
        teamName: 'Hà Nội Smashers',
        player1: 'Đặng Quốc Huy',
        player2: 'Bùi Việt Hoàng',
        phone: '0987654321',
        email: 'hn.smashers@outlook.com',
        status: 'pending'
      }
    ];
  });

  // Sync state variables to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('pickle_courts', JSON.stringify(courts));
  }, [courts]);

  useEffect(() => {
    localStorage.setItem('pickle_openplays', JSON.stringify(openPlays));
  }, [openPlays]);

  useEffect(() => {
    localStorage.setItem('pickle_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem('pickle_registrations', JSON.stringify(teamRegistrations));
  }, [teamRegistrations]);

  useEffect(() => {
    localStorage.setItem('pickle_social_revenues', JSON.stringify(socialRevenues));
  }, [socialRevenues]);

  useEffect(() => {
    localStorage.setItem('pickle_member_registrations', JSON.stringify(memberRegistrations));
  }, [memberRegistrations]);

  // Load bookings and member registrations from Backend/Firebase on mount
  useEffect(() => {
    // 1. Fetch Bookings
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.bookings && data.bookings.length > 0) {
          setBookings(data.bookings);
        } else {
          // Fallback to localstorage
          const saved = localStorage.getItem('pickle_bookings');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setBookings(parsed);
              if (data.isFirebaseActive) {
                fetch('/api/firebase/bulk-sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ bookings: parsed })
                }).catch(err => console.error('Auto initial bookings sync failed:', err));
              }
            } catch (e) {
              console.error('Error parsing saved bookings', e);
            }
          }
        }
      })
      .catch(err => console.error('Error fetching bookings from server:', err));

    // 2. Fetch Member Registrations
    fetch('/api/member-registrations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.memberRegistrations && data.memberRegistrations.length > 0) {
          setMemberRegistrations(data.memberRegistrations);
        } else {
          // Fallback to localstorage
          const saved = localStorage.getItem('pickle_member_registrations');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setMemberRegistrations(parsed);
              if (data.isFirebaseActive) {
                fetch('/api/firebase/bulk-sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ memberRegistrations: parsed })
                }).catch(err => console.error('Auto initial member sync failed:', err));
              }
            } catch (e) {
              console.error('Error parsing saved registrations', e);
            }
          }
        }
      })
      .catch(err => console.error('Error fetching members from server:', err));
  }, []);

  // Sync bookings to LocalStorage on change and keep local state
  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('pickle_bookings', JSON.stringify(newBookings));
  };

  // Create a new member/coaching package registration
  const handleRegisterMember = (newReg: MemberRegistration) => {
    const updated = [newReg, ...memberRegistrations];
    setMemberRegistrations(updated);
    
    // Sync to server/Firebase!
    fetch('/api/member-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReg)
    }).catch(err => console.error('Server sync failed for new member:', err));

    // Auto sync registration to Google Sheets in real-time!
    fetch('/api/alobo/forward-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addRegistration',
        contractId: newReg.id,
        contractDate: newReg.contractDate,
        fullName: newReg.fullName,
        dob: newReg.dob,
        phone: newReg.phone,
        preferredTime: newReg.preferredTime,
        hoursCount: newReg.hoursCount,
        packageType: newReg.packageType,
        durationMonths: newReg.durationMonths,
        coachName: newReg.coachName,
        serviceType: newReg.serviceType,
        totalPrice: newReg.totalPrice,
        depositAmount: newReg.depositAmount,
        remainingAmount: newReg.remainingAmount,
        actualPaid: newReg.actualPaid
      })
    }).catch(err => console.error('Auto Google Sheets registration sync failed:', err));
  };

  // Create a new court booking
  const handleAddBooking = (newBooking: Booking) => {
    const updated = [newBooking, ...bookings];
    saveBookings(updated);

    // Sync to server/Firebase!
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    }).catch(err => console.error('Server sync failed for new booking:', err));

    // If "Open Play" was enabled, automatically publish an open play matchup to the community lobby!
    if (newBooking.isOpenPlay) {
      const matchLevel = 'Mọi cấp độ';
      const autoOpenPlay: OpenPlay = {
        id: 'op-auto-' + Math.random().toString(36).substr(2, 9),
        title: `Giao lưu hội ngộ tại ${newBooking.courtName}`,
        level: matchLevel,
        location: newBooking.courtName,
        date: 'Ngày ' + newBooking.date.split('-').reverse().join('/'),
        time: newBooking.timeSlot,
        joinedPlayers: [newBooking.fullName],
        maxPlayers: 4,
        hostName: newBooking.fullName,
        fee: Math.round((newBooking.totalPrice / 4) / 10000) * 10000, // split among 4 players, rounded
        description: 'Kèo mở tự động từ đặt sân! Rất mong tìm được các anh tài ráp cặp cùng giao lưu và chia sẻ tiền sân vui vẻ.'
      };
      setOpenPlays([autoOpenPlay, ...openPlays]);
    }

    // Auto sync booking to Google Sheets via server endpoint in real-time!
    fetch('/api/alobo/forward-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: newBooking.fullName,
        phone: newBooking.phone,
        courtName: newBooking.courtName,
        date: newBooking.date,
        timeSlot: newBooking.timeSlot,
        price: (newBooking.totalPrice).toLocaleString('vi-VN') + ' đ',
        paymentStatus: 'Thanh toán tại quầy (Sân Pickle Bounce)'
      })
    }).catch(err => console.error('Auto Google Sheets sync failed:', err));
  };

  // Cancel an existing booking
  const handleCancelBooking = (id: string) => {
    const filtered = bookings.filter(b => b.id !== id);
    saveBookings(filtered);

    // Delete on server/Firebase!
    fetch(`/api/bookings/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Server delete failed:', err));
  };

  // Join an existing open play matchup
  const handleJoinOpenPlay = (id: string, name: string) => {
    const matchedOpenPlay = openPlays.find(op => op.id === id);
    const updated = openPlays.map(op => {
      if (op.id === id) {
        if (op.joinedPlayers.includes(name)) return op; // prevent double join
        return {
          ...op,
          joinedPlayers: [...op.joinedPlayers, name]
        };
      }
      return op;
    });
    setOpenPlays(updated);

    if (matchedOpenPlay && !matchedOpenPlay.joinedPlayers.includes(name)) {
      // Sync open play joiner to Google Sheets
      fetch('/api/alobo/forward-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: `${name} (Tham gia ghép sân)`,
          phone: 'Thành viên ghép',
          courtName: `Hội ghép: ${matchedOpenPlay.title}`,
          date: new Date().toISOString().split('T')[0],
          timeSlot: matchedOpenPlay.time,
          price: matchedOpenPlay.fee.toLocaleString('vi-VN') + ' đ / người',
          paymentStatus: 'Giao lưu tại sân'
        })
      }).catch(err => console.error('Auto Google Sheets open play join sync failed:', err));
    }
  };

  // Post a new custom open play matchmaking request to lobby
  const handlePostOpenPlay = (newOpenPlay: OpenPlay) => {
    setOpenPlays([newOpenPlay, ...openPlays]);
    
    // Sync newly created open play matchup to Google Sheets
    fetch('/api/alobo/forward-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: `${newOpenPlay.hostName} (Mở kèo mới)`,
        phone: 'Chủ kèo',
        courtName: `Yêu cầu ghép: ${newOpenPlay.title}`,
        date: new Date().toISOString().split('T')[0],
        timeSlot: newOpenPlay.time,
        price: newOpenPlay.fee.toLocaleString('vi-VN') + ' đ / người',
        paymentStatus: 'Đăng giao lưu'
      })
    }).catch(err => console.error('Auto Google Sheets open play post sync failed:', err));
  };

  // Register a team for a tournament
  const handleRegisterTeam = (newReg: TeamRegistration) => {
    // Add to registrations list
    setTeamRegistrations([newReg, ...teamRegistrations]);

    // Increment registration count for this tournament
    const updatedTours = tournaments.map(t => {
      if (t.id === newReg.tournamentId) {
        return {
          ...t,
          teamsRegistered: Math.min(t.maxTeams, t.teamsRegistered + 1)
        };
      }
      return t;
    });
    setTournaments(updatedTours);

    // Auto sync tournament registration to Google Sheets in real-time!
    fetch('/api/alobo/forward-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: `${newReg.teamName} (${newReg.player1} & ${newReg.player2})`,
        phone: newReg.phone,
        courtName: `Đăng ký giải đấu: ${newReg.tournamentName}`,
        date: new Date().toISOString().split('T')[0],
        timeSlot: 'Đăng Ký Giải Đấu',
        price: 'Miễn phí (0 đ)',
        paymentStatus: 'Chờ ban tổ chức duyệt'
      })
    }).catch(err => console.error('Auto Google Sheets tournament sync failed:', err));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-brand-dark selection:bg-brand-red selection:text-white flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <Navbar 
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenMatchLobby={() => setIsMatchLobbyOpen(true)}
        onOpenMySchedule={() => setIsMyScheduleOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTraining={() => setIsTrainingOpen(true)}
        bookingCount={bookings.length}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        
        {/* 1. Hero Section */}
        <Hero 
          onOpenBooking={() => setIsBookingOpen(true)}
          onOpenMatchLobby={() => setIsMatchLobbyOpen(true)}
        />

        {/* 2. Sponsors/Partners Marquee Row */}
        <Sponsors sponsors={SPONSORS} />

        {/* 3. Community Vision Section */}
        <Vision />

        {/* 4. Ecosystem Steps (01 to 04) */}
        <Ecosystem />

        {/* 5. Tournament Experience */}
        <Tournaments 
          tournaments={tournaments}
          onRegisterTournament={(tour) => setSelectedTournament(tour)}
        />

        {/* 6. Community, Social & Partners */}
        <Partnership />

        {/* Real-time Visual Booking Status synced with Alobo.vn */}
        <AloboLiveSync />

        {/* 7. Weekly/Monthly Schedules Cards */}
        <WeeklySchedule 
          onOpenMatchLobby={() => setIsMatchLobbyOpen(true)}
          onOpenBooking={() => setIsBookingOpen(true)}
        />

      </main>

      {/* Footer & CTA Bottom Banner */}
      <Footer 
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenMatchLobby={() => setIsMatchLobbyOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* --- POPUP INTERACTIVE MODALS --- */}
      
      {/* 1. Booking Drawer Modal */}
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        courts={courts}
        onAddBooking={handleAddBooking}
      />

      {/* 2. Matchmaking / Lobby Social Board */}
      <MatchLobby 
        isOpen={isMatchLobbyOpen}
        onClose={() => setIsMatchLobbyOpen(false)}
        openPlays={openPlays}
        courts={courts}
        onJoinOpenPlay={handleJoinOpenPlay}
        onPostOpenPlay={handlePostOpenPlay}
      />

      {/* 3. Tournament Registration Form */}
      <TournamentModal 
        isOpen={selectedTournament !== null}
        onClose={() => setSelectedTournament(null)}
        tournament={selectedTournament}
        onRegisterTeam={handleRegisterTeam}
      />

      {/* 4. My Bookings / Schedule Manager */}
      <MyScheduleModal 
        isOpen={isMyScheduleOpen}
        onClose={() => setIsMyScheduleOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />

      {/* 5. Admin Panel Operator Dashboard */}
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        courts={courts}
        onSaveCourts={setCourts}
        bookings={bookings}
        onSaveBookings={saveBookings}
        openPlays={openPlays}
        onSaveOpenPlays={setOpenPlays}
        tournaments={tournaments}
        onSaveTournaments={setTournaments}
        teamRegistrations={teamRegistrations}
        onSaveTeamRegistrations={setTeamRegistrations}
        socialRevenues={socialRevenues}
        onSaveSocialRevenues={setSocialRevenues}
        memberRegistrations={memberRegistrations}
        onSaveMemberRegistrations={setMemberRegistrations}
      />

      {/* 6. Training & Membership Registration Modal */}
      <TrainingModal 
        isOpen={isTrainingOpen}
        onClose={() => setIsTrainingOpen(false)}
        onAddRegistration={handleRegisterMember}
      />

    </div>
  );
}
