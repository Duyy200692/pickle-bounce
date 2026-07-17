export interface Court {
  id: string;
  name: string;
  image: string;
  address: string;
  region: string;
  rating: number;
  pricePerHour: number;
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
