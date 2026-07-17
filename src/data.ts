import { Court, OpenPlay, Tournament, Sponsor } from './types';

export const INITIAL_COURTS: Court[] = [
  {
    id: 'court-1',
    name: 'Sân 1 - Sport Pickle Bounce',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.9,
    pricePerHour: 150000,
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-2',
    name: 'Sân 2 - Sport Pickle Bounce',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-3',
    name: 'Sân 3 - Sport Pickle Bounce',
    image: 'https://images.unsplash.com/photo-1613918431208-6752fe243c5e?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-4',
    name: 'Sân 4 - Sport Pickle Bounce',
    image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.9,
    pricePerHour: 150000,
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-5',
    name: 'Sân 5 - Sport Pickle Bounce',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-6',
    name: 'Sân 6 - Sport Pickle Bounce',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  }
];

export const INITIAL_OPEN_PLAYS: OpenPlay[] = [
  {
    id: 'op-1',
    title: 'Giao lưu cuối tuần - Hội đam mê Pickleball Q12',
    level: 'Mọi cấp độ',
    location: 'Sân 1 - Sport Pickle Bounce',
    date: 'Thứ Bảy, Tuần này',
    time: '16:00 - 18:00',
    joinedPlayers: ['Minh Hoàng', 'Thùy Dương', 'Khánh Vy', 'Quốc Bảo'],
    maxPlayers: 8,
    hostName: 'Duy Nguyễn',
    fee: 45000,
    description: 'Buổi giao lưu vui vẻ tại sân mái che An Phú Đông, làm quen là chính, có hỗ trợ hướng dẫn luật cho người mới chơi!'
  },
  {
    id: 'op-2',
    title: 'Cọ xát nâng trình - Đánh đôi kịch tính',
    level: 'Trung cấp (2.5-3.5)',
    location: 'Sân 3 - Sport Pickle Bounce',
    date: 'Chủ Nhật, Tuần này',
    time: '18:00 - 20:00',
    joinedPlayers: ['Lâm Phan', 'Hữu Phước', 'Bảo Ngọc'],
    maxPlayers: 6,
    hostName: 'Hoàng Long',
    fee: 45000,
    description: 'Tìm các tay vợt trình cứng (2.5+) để ráp kèo đánh đôi nam nữ hoặc đôi nam kịch tính. Sân thi đấu thảm quốc tế cực nảy!'
  },
  {
    id: 'op-3',
    title: 'Luyện Skill & Clinic cùng Huấn Luyện Viên',
    level: 'Người mới (1.0-2.5)',
    location: 'Sân 5 - Sport Pickle Bounce',
    date: 'Thứ Năm, Hàng tuần',
    time: '19:00 - 21:00',
    joinedPlayers: ['Ngọc Hân', 'Anh Khoa', 'Quỳnh Anh', 'Thanh Bình', 'Tiến Đạt'],
    maxPlayers: 10,
    hostName: 'Coach Ryan (Trình 4.5)',
    fee: 90000,
    description: 'Buổi luyện kỹ thuật giao bóng, dink bóng qua lưới dứt điểm và di chuyển chiến thuật đôi tại sân Sport Pickle Bounce.'
  }
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour-1',
    name: 'Bounce Cup 2026 - The League',
    description: 'Giải đấu chính quy tìm kiếm tài năng Pickleball lớn nhất trong cộng đồng, quy tụ các vận động viên phong trào xuất sắc tranh tài.',
    tag: 'BOUNCE CUP',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
    date: '25/08/2026 - 30/08/2026',
    registrationFee: 500000,
    teamsRegistered: 28,
    maxTeams: 32,
    category: 'Đôi Nam / Đôi Nữ / Đôi Nam Nữ',
    status: 'Đang mở'
  },
  {
    id: 'tour-2',
    name: 'Signature Corporate Series',
    description: 'Giải đấu cao cấp được Pickle Bounce thiết kế riêng cho các thương hiệu, kết nối tinh thần thể thao và định vị nhãn hàng đỉnh cao.',
    tag: 'SIGNATURE SERIES',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800',
    date: '12/09/2026',
    registrationFee: 1000000,
    teamsRegistered: 12,
    maxTeams: 16,
    category: 'Đôi Doanh Nhân / Đôi Đại Diện Thương Hiệu',
    status: 'Đang mở'
  }
];

export const SPONSORS: Sponsor[] = [
  { id: 'sp-1', name: 'Joola', logo: 'JOOLA' },
  { id: 'sp-2', name: 'Selkirk', logo: 'SELKIRK' },
  { id: 'sp-3', name: 'Wilson', logo: 'WILSON' },
  { id: 'sp-4', name: 'Head', logo: 'HEAD' },
  { id: 'sp-5', name: 'Adidas', logo: 'ADIDAS' },
  { id: 'sp-6', name: 'Nike', logo: 'NIKE' },
  { id: 'sp-7', name: 'Decathlon', logo: 'DECATHLON' },
  { id: 'sp-8', name: 'Spotify', logo: 'SPOTIFY' },
  { id: 'sp-9', name: 'PCL Pro', logo: 'PCL' },
  { id: 'sp-10', name: 'Engage', logo: 'ENGAGE' },
  { id: 'sp-11', name: 'ProKennex', logo: 'PRO KENNEX' },
  { id: 'sp-12', name: 'Red Bull', logo: 'RED BULL' }
];
