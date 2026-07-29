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
import { 
  INITIAL_COURTS, 
  INITIAL_OPEN_PLAYS, 
  INITIAL_TOURNAMENTS, 
  SPONSORS, 
  PICKLE_BOUNCE_BRANCH, 
  INITIAL_MEMBERS, 
  INITIAL_PROMO_CONFIG,
  INITIAL_BOOKINGS,
  INITIAL_SOCIAL_REVENUES,
  INITIAL_REGISTRATIONS,
  INITIAL_ADMIN_SECURITY
} from './data';
import { Booking, OpenPlay, Tournament, TeamRegistration, Court, SocialRevenue, CourtBranch, Member, Sponsor, PromoConfig, AdminSecurity } from './types';
import { 
  subscribeToCollection, 
  subscribeToDoc, 
  saveFirebaseDoc, 
  deleteFirebaseDoc, 
  saveFirebaseCollection, 
  saveSingleDoc 
} from './lib/firebase';

export default function App() {
  // Modal visibility states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMatchLobbyOpen, setIsMatchLobbyOpen] = useState(false);
  const [isMyScheduleOpen, setIsMyScheduleOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournamentModalTab, setTournamentModalTab] = useState<'register' | 'rules' | 'gallery'>('register');

  // App Core States initialized with Firebase
  const [promoConfig, setPromoConfig] = useState<PromoConfig>(INITIAL_PROMO_CONFIG);
  const [adminSecurity, setAdminSecurity] = useState<AdminSecurity>(INITIAL_ADMIN_SECURITY);
  const [sponsors, setSponsors] = useState<Sponsor[]>(SPONSORS);
  const [branch, setBranch] = useState<CourtBranch>(PICKLE_BOUNCE_BRANCH);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [socialRevenues, setSocialRevenues] = useState<SocialRevenue[]>(INITIAL_SOCIAL_REVENUES);
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [openPlays, setOpenPlays] = useState<OpenPlay[]>(INITIAL_OPEN_PLAYS);
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [teamRegistrations, setTeamRegistrations] = useState<TeamRegistration[]>(INITIAL_REGISTRATIONS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  // Subscribe to Firebase Firestore collections & documents in real-time
  useEffect(() => {
    const unsubCourts = subscribeToCollection('courts', setCourts, INITIAL_COURTS);
    const unsubBookings = subscribeToCollection('bookings', setBookings, INITIAL_BOOKINGS);
    const unsubOpenPlays = subscribeToCollection('openPlays', setOpenPlays, INITIAL_OPEN_PLAYS);
    const unsubTournaments = subscribeToCollection('tournaments', setTournaments, INITIAL_TOURNAMENTS);
    const unsubRegistrations = subscribeToCollection('registrations', setTeamRegistrations, INITIAL_REGISTRATIONS);
    const unsubRevenues = subscribeToCollection('socialRevenues', setSocialRevenues, INITIAL_SOCIAL_REVENUES);
    const unsubMembers = subscribeToCollection('members', setMembers, INITIAL_MEMBERS);
    const unsubSponsors = subscribeToCollection('sponsors', setSponsors, SPONSORS);
    const unsubBranch = subscribeToDoc('appConfig', 'branch', setBranch, PICKLE_BOUNCE_BRANCH);
    const unsubPromo = subscribeToDoc('appConfig', 'promoConfig', setPromoConfig, INITIAL_PROMO_CONFIG);
    const unsubSecurity = subscribeToDoc('appConfig', 'adminSecurity', setAdminSecurity, INITIAL_ADMIN_SECURITY);

    return () => {
      unsubCourts();
      unsubBookings();
      unsubOpenPlays();
      unsubTournaments();
      unsubRegistrations();
      unsubRevenues();
      unsubMembers();
      unsubSponsors();
      unsubBranch();
      unsubPromo();
      unsubSecurity();
    };
  }, []);

  const handleSaveAdminSecurity = (newSec: AdminSecurity) => {
    setAdminSecurity(newSec);
    saveSingleDoc('appConfig', 'adminSecurity', newSec);
  };

  // Handlers to sync Admin Panel changes to Firebase
  const handleSaveCourts = (newCourts: Court[]) => {
    setCourts(newCourts);
    saveFirebaseCollection('courts', newCourts);
  };

  const handleSaveMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    saveFirebaseCollection('members', newMembers);
  };

  const handleSaveOpenPlays = (newOpenPlays: OpenPlay[]) => {
    setOpenPlays(newOpenPlays);
    saveFirebaseCollection('openPlays', newOpenPlays);
  };

  const handleSaveTournaments = (newTournaments: Tournament[]) => {
    setTournaments(newTournaments);
    saveFirebaseCollection('tournaments', newTournaments);
  };

  const handleSaveRegistrations = (newRegs: TeamRegistration[]) => {
    setTeamRegistrations(newRegs);
    saveFirebaseCollection('registrations', newRegs);
  };

  const handleSaveSocialRevenues = (newRevenues: SocialRevenue[]) => {
    setSocialRevenues(newRevenues);
    saveFirebaseCollection('socialRevenues', newRevenues);
  };

  const handleSaveSponsors = (newSponsors: Sponsor[]) => {
    setSponsors(newSponsors);
    saveFirebaseCollection('sponsors', newSponsors);
  };

  const handleSaveBranch = (newBranch: CourtBranch) => {
    setBranch(newBranch);
    saveSingleDoc('appConfig', 'branch', newBranch);
  };

  const handleSavePromoConfig = (newConfig: PromoConfig) => {
    setPromoConfig(newConfig);
    saveSingleDoc('appConfig', 'promoConfig', newConfig);
  };

  // Create a new court booking
  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    saveFirebaseDoc('bookings', newBooking);

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
      setOpenPlays(prev => [autoOpenPlay, ...prev]);
      saveFirebaseDoc('openPlays', autoOpenPlay);
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
    setBookings(prev => prev.filter(b => b.id !== id));
    deleteFirebaseDoc('bookings', id);
  };

  // Join an existing open play matchup
  const handleJoinOpenPlay = (id: string, name: string) => {
    const matchedOpenPlay = openPlays.find(op => op.id === id);
    if (!matchedOpenPlay) return;

    if (matchedOpenPlay.joinedPlayers.includes(name)) return; // prevent double join

    const updatedOpenPlay = {
      ...matchedOpenPlay,
      joinedPlayers: [...matchedOpenPlay.joinedPlayers, name]
    };

    setOpenPlays(prev => prev.map(op => op.id === id ? updatedOpenPlay : op));
    saveFirebaseDoc('openPlays', updatedOpenPlay);

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
  };

  // Post a new custom open play matchmaking request to lobby
  const handlePostOpenPlay = (newOpenPlay: OpenPlay) => {
    setOpenPlays(prev => [newOpenPlay, ...prev]);
    saveFirebaseDoc('openPlays', newOpenPlay);
    
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
    setTeamRegistrations(prev => [newReg, ...prev]);
    saveFirebaseDoc('registrations', newReg);

    // Increment registration count for this tournament
    const matchedTour = tournaments.find(t => t.id === newReg.tournamentId);
    if (matchedTour) {
      const updatedTour = {
        ...matchedTour,
        teamsRegistered: Math.min(matchedTour.maxTeams, matchedTour.teamsRegistered + 1)
      };
      setTournaments(prev => prev.map(t => t.id === newReg.tournamentId ? updatedTour : t));
      saveFirebaseDoc('tournaments', updatedTour);
    }

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
        bookingCount={bookings.length}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        
        {/* 1. Hero Section */}
        <Hero 
          onOpenBooking={() => setIsBookingOpen(true)}
          onOpenMatchLobby={() => setIsMatchLobbyOpen(true)}
          promoConfig={promoConfig}
        />

        {/* 2. Sponsors/Partners Marquee Row */}
        <Sponsors sponsors={sponsors} />

        {/* 3. Community Vision Section */}
        <Vision promoConfig={promoConfig} />

        {/* 4. Ecosystem Steps (01 to 04) */}
        <Ecosystem />

        {/* 5. Tournament Experience */}
        <Tournaments 
          tournaments={tournaments}
          onRegisterTournament={(tour, tab = 'register') => {
            setSelectedTournament(tour);
            setTournamentModalTab(tab);
          }}
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

      {/* 3. Tournament Registration Form & Rules/Gallery Viewer */}
      <TournamentModal 
        isOpen={selectedTournament !== null}
        onClose={() => setSelectedTournament(null)}
        tournament={selectedTournament}
        onRegisterTeam={handleRegisterTeam}
        initialTab={tournamentModalTab}
      />

      {/* 4. My Bookings / Schedule Manager */}
      <MyScheduleModal 
        isOpen={isMyScheduleOpen}
        onClose={() => setIsMyScheduleOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />

      {/* 5. Admin Panel Operator Dashboard */}
      {isAdminOpen && (
        <AdminPanel 
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          branch={branch}
          onSaveBranch={handleSaveBranch}
          courts={courts}
          onSaveCourts={handleSaveCourts}
          bookings={bookings}
          onSaveBookings={(newBookings) => { setBookings(newBookings); saveFirebaseCollection('bookings', newBookings); }}
          openPlays={openPlays}
          onSaveOpenPlays={handleSaveOpenPlays}
          tournaments={tournaments}
          onSaveTournaments={handleSaveTournaments}
          teamRegistrations={teamRegistrations}
          onSaveTeamRegistrations={handleSaveRegistrations}
          socialRevenues={socialRevenues}
          onSaveSocialRevenues={handleSaveSocialRevenues}
          members={members}
          onSaveMembers={handleSaveMembers}
          sponsors={sponsors}
          onSaveSponsors={handleSaveSponsors}
          promoConfig={promoConfig}
          onSavePromoConfig={handleSavePromoConfig}
          adminSecurity={adminSecurity}
          onSaveAdminSecurity={handleSaveAdminSecurity}
        />
      )}

    </div>
  );
}
