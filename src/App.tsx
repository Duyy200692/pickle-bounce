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

// Static Data and Types
import { INITIAL_COURTS, INITIAL_OPEN_PLAYS, INITIAL_TOURNAMENTS, SPONSORS } from './data';
import { Booking, OpenPlay, Tournament, TeamRegistration, Court, SocialRevenue } from './types';

export default function App() {
  // Modal visibility states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMatchLobbyOpen, setIsMatchLobbyOpen] = useState(false);
  const [isMyScheduleOpen, setIsMyScheduleOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Core App State
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

  // Load bookings from LocalStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('pickle_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (e) {
        console.error('Error parsing saved bookings', e);
      }
    }
  }, []);

  // Sync bookings to LocalStorage on change
  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('pickle_bookings', JSON.stringify(newBookings));
  };

  // Create a new court booking
  const handleAddBooking = (newBooking: Booking) => {
    const updated = [newBooking, ...bookings];
    saveBookings(updated);

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
  };

  // Cancel an existing booking
  const handleCancelBooking = (id: string) => {
    const filtered = bookings.filter(b => b.id !== id);
    saveBookings(filtered);
  };

  // Join an existing open play matchup
  const handleJoinOpenPlay = (id: string, name: string) => {
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
  };

  // Post a new custom open play matchmaking request to lobby
  const handlePostOpenPlay = (newOpenPlay: OpenPlay) => {
    setOpenPlays([newOpenPlay, ...openPlays]);
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
  };

  return (
    <div className="min-h-screen bg-white font-sans text-brand-dark selection:bg-brand-red selection:text-white flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <Navbar 
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenMatchLobby={() => setIsMatchLobbyOpen(true)}
        onOpenMySchedule={() => setIsMyScheduleOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
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
      />

    </div>
  );
}
