import React from 'react';
import { Play, Calendar, Users, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenBooking: () => void;
  onOpenMatchLobby: () => void;
  config?: {
    heroTag: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
  };
}

export default function Hero({ onOpenBooking, onOpenMatchLobby, config }: HeroProps) {
  const tag = config?.heroTag || "SPORT PICKLE BOUNCE";
  const title = config?.heroTitle || "Khám phá tính năng";
  const subtitle = config?.heroSubtitle || "Tổ chức buổi chơi chuyên nghiệp. Miễn phí 100%. Đặt sân nhanh chóng, tìm bạn cùng trình, tổ chức giải đấu bùng nổ.";
  const image = config?.heroImage || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1600";

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
      {/* Tall rounded card for hero section - Match the mockup image's exact structure */}
      <div className="relative h-[480px] sm:h-[550px] md:h-[620px] rounded-[32px] overflow-hidden shadow-2xl">
        
        {/* Background Image with elegant gradient overlays */}
        <div className="absolute inset-0">
          <img 
            src={image} 
            alt="Pickleball Court and Player" 
            className="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-10000"
          />
          {/* Mockup's distinct blue & dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-brand-blue/25"></div>
          {/* Subtle curved overlay on the right matching the image mockup's visual language */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-transparent to-brand-blue/15 pointer-events-none"></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 md:p-16">
          <div className="max-w-2xl text-white">
            
            {/* Tag */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-5 bg-brand-blue/80 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg"
            >
              <div className="w-2 h-2 bg-brand-red rounded-full animate-ping"></div>
              <span className="font-display font-bold text-xs sm:text-sm tracking-widest text-white uppercase opacity-95">
                {tag}
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none mb-4"
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-sans font-medium text-base sm:text-lg md:text-xl text-white/80 max-w-lg mb-8 leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* Call To Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
            >
              <button 
                onClick={onOpenBooking}
                className="bg-brand-red hover:bg-brand-red-hover text-white px-8 py-4 rounded-full font-sans font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-brand-red/35 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Calendar className="w-5 h-5" />
                Đặt Sân Khám Phá
              </button>
              
              <button 
                onClick={onOpenMatchLobby}
                className="bg-white/15 backdrop-blur-md hover:bg-white/25 text-white border border-white/20 px-8 py-4 rounded-full font-sans font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Users className="w-5 h-5" />
                Ghép Trận Giao Lưu
              </button>
            </motion.div>

          </div>

          {/* Carousel dots and bottom design matching the image mockup */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
            <div className="flex gap-2">
              <span className="w-8 h-1 bg-brand-red rounded-full"></span>
              <span className="w-2 h-1 bg-white/30 rounded-full"></span>
              <span className="w-2 h-1 bg-white/30 rounded-full"></span>
              <span className="w-2 h-1 bg-white/30 rounded-full"></span>
            </div>
            
            <div className="hidden sm:flex gap-6 text-white/50 font-mono text-[10px] tracking-widest">
              <span>LON: 106.6601° E</span>
              <span>LAT: 10.7626° N</span>
              <span>CRAFTED IN HO CHI MINH</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
