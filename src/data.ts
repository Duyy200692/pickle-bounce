import { Court, OpenPlay, Tournament, Sponsor, CourtBranch, Member } from './types';

export const PICKLE_BOUNCE_BRANCH: CourtBranch = {
  id: 'branch-pb-q12',
  name: 'Pickle Bounce An Phú Đông',
  code: 'PB-Q12',
  address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
  district: 'Quận 12',
  city: 'TP. Hồ Chí Minh',
  phone: '0901 234 567',
  openTime: '06:00 - 23:00 (Thứ 2 - Chủ Nhật)',
  totalCourts: 6,
  image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
  description: 'Chi nhánh chuẩn thi đấu duy nhất của Pickle Bounce với 6 sân mái che thảm SPM cao cấp, hệ thống đèn LED chống lóa, tủ locker thông minh và khu F&B giải khát.',
  amenities: [
    'Sân mái che cao cấp SPM 100%',
    'Hệ thống đèn LED chống lóa',
    'Tủ locker thông minh',
    'Cho thuê vợt JOOLA / Selkirk',
    'Quầy F&B & nước uống miễn phí',
    'Bãi đỗ xe ô tô & xe máy rộng rãi'
  ]
};

export const INITIAL_COURTS: Court[] = [
  {
    id: 'court-1',
    name: 'Sân 1 - Sport Pickle Bounce',
    branchName: 'Pickle Bounce An Phú Đông',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.9,
    pricePerHour: 150000,
    courtType: 'Mái che (Covered)',
    status: 'Hoạt động',
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-2',
    name: 'Sân 2 - Sport Pickle Bounce',
    branchName: 'Pickle Bounce An Phú Đông',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    courtType: 'Mái che (Covered)',
    status: 'Hoạt động',
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-3',
    name: 'Sân 3 - Sport Pickle Bounce',
    branchName: 'Pickle Bounce An Phú Đông',
    image: 'https://images.unsplash.com/photo-1613918431208-6752fe243c5e?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    courtType: 'Trong nhà (Indoor)',
    status: 'Hoạt động',
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-4',
    name: 'Sân 4 - Sport Pickle Bounce',
    branchName: 'Pickle Bounce An Phú Đông',
    image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.9,
    pricePerHour: 150000,
    courtType: 'Trong nhà (Indoor)',
    status: 'Hoạt động',
    amenities: ['Sân mái che cao cấp', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí', 'Cho thuê vợt JOOLA'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-5',
    name: 'Sân 5 - Sport Pickle Bounce',
    branchName: 'Pickle Bounce An Phú Đông',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    courtType: 'Ngoài trời (Outdoor)',
    status: 'Hoạt động',
    amenities: ['Sân ngoài trời thoáng mát', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí'],
    slots: ['06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00']
  },
  {
    id: 'court-6',
    name: 'Sân 6 - Sport Pickle Bounce',
    branchName: 'Pickle Bounce An Phú Đông',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800',
    address: '306/5 Vườn Lài, P. An Phú Đông, Quận 12, TP. Hồ Chí Minh',
    region: 'Hồ Chí Minh (Quận 12)',
    rating: 4.8,
    pricePerHour: 150000,
    courtType: 'Ngoài trời (Outdoor)',
    status: 'Hoạt động',
    amenities: ['Sân ngoài trời thoáng mát', 'Thảm thi đấu quốc tế', 'Đèn LED chống lóa', 'Tủ locker thông minh', 'Nước uống miễn phí'],
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

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    fullName: 'Nguyễn Văn Hùng',
    phone: '0908 123 456',
    email: 'vanhung.nguyen@gmail.com',
    membershipTier: 'Kim Cương (VIP)',
    joinDate: '2025-01-15',
    totalBookings: 24,
    totalSpent: 3600000,
    points: 360,
    status: 'Đang hoạt động',
    notes: 'Khách quen cố định khung giờ 18:00 - 20:00 Thứ 3 & Thứ 5'
  },
  {
    id: 'mem-2',
    fullName: 'Trần Thị Mai',
    phone: '0912 345 678',
    email: 'maitran.pickle@gmail.com',
    membershipTier: 'Vàng (Gold)',
    joinDate: '2025-03-20',
    totalBookings: 15,
    totalSpent: 2250000,
    points: 225,
    status: 'Đang hoạt động',
    notes: 'Thường xuyên đăng ký thi đấu giải Bounce Cup'
  },
  {
    id: 'mem-3',
    fullName: 'Lê Hoàng Nam',
    phone: '0989 777 888',
    email: 'hoangnam.le@yahoo.com',
    membershipTier: 'Bạc (Silver)',
    joinDate: '2025-05-10',
    totalBookings: 8,
    totalSpent: 1200000,
    points: 120,
    status: 'Đang hoạt động'
  },
  {
    id: 'mem-4',
    fullName: 'Phạm Đức Anh',
    phone: '0933 112 233',
    email: 'ducanh.pham@outlook.com',
    membershipTier: 'Đồng (Bronze)',
    joinDate: '2025-06-01',
    totalBookings: 3,
    totalSpent: 450000,
    points: 45,
    status: 'Đang hoạt động'
  }
];
