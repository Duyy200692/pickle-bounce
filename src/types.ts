export interface CourtBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  openTime: string;
  totalCourts: number;
  image: string;
  description: string;
  amenities: string[];
}

export interface Court {
  id: string;
  name: string;
  branchName: string;
  image: string;
  address: string;
  region: string;
  rating: number;
  pricePerHour: number;
  courtType?: 'Trong nhà (Indoor)' | 'Mái che (Covered)' | 'Ngoài trời (Outdoor)';
  status?: 'Hoạt động' | 'Bảo trì';
  amenities: string[];
  slots: string[];
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  address: string;
  date: string;
  timeSlot: string;
  fullName: string;
  phone: string;
  status: 'confirmed' | 'pending';
  totalPrice: number;
  isOpenPlay: boolean;
  createdAt: string;
}

export interface OpenPlay {
  id: string;
  title: string;
  level: 'Mọi cấp độ' | 'Người mới (1.0-2.5)' | 'Trung cấp (2.5-3.5)' | 'Nâng cao (3.5+)';
  location: string;
  date: string;
  time: string;
  joinedPlayers: string[];
  maxPlayers: number;
  hostName: string;
  fee: number;
  description: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  tag: string;
  image: string;
  date: string;
  registrationFee: number;
  teamsRegistered: number;
  maxTeams: number;
  category: string;
  status: 'Đang mở' | 'Sắp diễn ra' | 'Đã kết thúc';
}

export interface TeamRegistration {
  id: string;
  tournamentId: string;
  tournamentName: string;
  teamName: string;
  player1: string;
  player2: string;
  phone: string;
  email: string;
  status: 'confirmed' | 'pending';
  createdAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
}

export interface Member {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  membershipTier: 'Đồng (Bronze)' | 'Bạc (Silver)' | 'Vàng (Gold)' | 'Kim Cương (VIP)';
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  points: number;
  status: 'Đang hoạt động' | 'Tạm khóa';
  notes?: string;
}

export interface SocialRevenue {
  id: string;
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  amount: number;
  playersCount: number;
  notes: string;
  createdAt: string;
}

export interface PromoConfig {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImgUrl: string;
  bookingBtnText: string;
  matchBtnText: string;
  
  // Notice / Announcement Bar
  showNoticeBar: boolean;
  noticeText: string;
  noticeBadge: string;
  
  // Vision Section Promo
  visionTitle: string;
  visionDesc1: string;
  visionDesc2: string;
  statMembers: string;
  statCourts: string;
  statTournaments: string;
}

