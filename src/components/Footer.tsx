import React from 'react';
import { Mail, Phone, MapPin, Globe, Trophy, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenMatchLobby: () => void;
  onOpenAdmin: () => void;
}

export default function Footer({ onOpenBooking, onOpenMatchLobby, onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-brand-dark text-white pt-16 overflow-hidden">
      
      {/* Top Tall Beautiful CTA Banner - Match the image mockup's bottom banner exactly */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-[32px] overflow-hidden shadow-2xl py-16 px-8 sm:px-12 md:px-16 text-center group">
          
          {/* Background overlay with blue-black sport court feel */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1200" 
              alt="Ready for Pickleball" 
              className="w-full h-full object-cover transition-transform duration-7000 group-hover:scale-105"
            />
            {/* Rich gradient overlay of the bottom banner in the mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/75 to-transparent"></div>
            <div className="absolute inset-0 bg-brand-blue/30 mix-blend-multiply"></div>
          </div>

          {/* Banner Content */}
          <div className="relative max-w-2xl mx-auto z-10 flex flex-col items-center">
            
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-none mb-4">
              Sẵn sàng bước vào sân chơi Pickleball Bounce?
            </h2>
            
            <p className="font-sans text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              Đưa bạn từ vài phút làm quen, luyện tập nền tảng đến đấu trường chuyên nghiệp rực lửa. Chinh phục Bounce Cup và Signature Series theo cách riêng của bạn.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={onOpenBooking}
                className="bg-brand-red hover:bg-brand-red-hover text-white px-8 py-3.5 rounded-full font-sans font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-brand-red/30 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Xem lịch giải đấu
              </button>
              
              <button 
                onClick={onOpenMatchLobby}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-full font-sans font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Tìm sân / Cộng đồng bạn
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-white/10 pt-12">
          
          {/* Brand/About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 bg-brand-blue rounded-lg flex items-center justify-center overflow-hidden">
                <svg className="w-7 h-7 text-[#F89E13]" viewBox="0 0 100 100" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 58 C 30 35, 40 55, 52 45 T 75 35" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="76" cy="24" r="11" fill="#F89E13" stroke="none" />
                  {/* Holes inside pickleball */}
                  <circle cx="71" cy="20" r="1.5" fill="#2D61E5" stroke="none" />
                  <circle cx="77" cy="18" r="1.5" fill="#2D61E5" stroke="none" />
                  <circle cx="81" cy="21" r="1.5" fill="#2D61E5" stroke="none" />
                  <circle cx="72" cy="26" r="1.5" fill="#2D61E5" stroke="none" />
                  <circle cx="77" cy="28" r="1.5" fill="#2D61E5" stroke="none" />
                  <circle cx="81" cy="27" r="1.5" fill="#2D61E5" stroke="none" />
                  <circle cx="76" cy="23" r="1.5" fill="#2D61E5" stroke="none" />
                </svg>
              </div>
              <span className="font-display font-black text-lg tracking-wider text-white">
                Pickle <span className="text-brand-red">Bounce</span>
              </span>
            </div>
            <p className="font-sans text-xs text-white/50 leading-relaxed">
              Mạng lưới sân bãi, giải đấu và cộng đồng kết nối đam mê Pickleball lớn nhất Việt Nam. Sứ mệnh của chúng tôi là đem lại lộ trình chuyên nghiệp và hào hứng cho mọi người chơi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-4 tracking-wide uppercase">Dịch vụ</h4>
            <ul className="space-y-2 font-sans text-xs text-white/50">
              <li><button onClick={onOpenBooking} className="hover:text-brand-red transition-colors text-left">Đặt sân trực tuyến</button></li>
              <li><button onClick={onOpenMatchLobby} className="hover:text-brand-red transition-colors text-left">Tìm kèo, ghép cặp đấu</button></li>
              <li><a href="#ecosystem" className="hover:text-brand-red transition-colors block">Chuỗi giải đấu Bounce Cup</a></li>
              <li><a href="#partnership" className="hover:text-brand-red transition-colors block">Mạng lưới sân đối tác</a></li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-4 tracking-wide uppercase">Thông tin</h4>
            <ul className="space-y-2 font-sans text-xs text-white/50">
              <li><a href="#ecosystem" className="hover:text-brand-red transition-colors block">Về hệ sinh thái</a></li>
              <li><a href="#partnership" className="hover:text-brand-red transition-colors block">Mạng lưới Creator</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors block">Điều khoản đặt sân & hoàn trả</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors block">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 font-sans text-xs text-white/50">
            <h4 className="font-display font-bold text-sm text-white mb-4 tracking-wide uppercase">Liên hệ</h4>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-red flex-shrink-0" />
              <span>Hotline tư vấn: 0833821111</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-red flex-shrink-0" />
              <span>Email: picklebounce25@gmail.com</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
              <span>Địa chỉ: 306/5 Vườn Lài, P. An Phú Đông, Thành Phố Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
              <span className="font-semibold text-brand-red">Giờ mở cửa:</span>
              <span>6h - 22h Hằng ngày</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-white/30 font-sans">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>&copy; {new Date().getFullYear()} Pickle Bounce. Bảo lưu mọi quyền.</span>
            <button 
              onClick={onOpenAdmin}
              className="text-white/40 hover:text-brand-red font-bold transition-colors cursor-pointer text-[10px] uppercase tracking-wider border-t sm:border-t-0 sm:border-l border-white/15 pt-2 sm:pt-0 sm:pl-4"
            >
              🔒 Cổng quản trị (Admin Portal)
            </button>
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-white cursor-pointer transition-colors">TikTok</span>
            <span className="hover:text-white cursor-pointer transition-colors">YouTube</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
