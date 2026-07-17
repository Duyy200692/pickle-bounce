import React from 'react';
import { Trophy, ArrowRight, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Tournament } from '../types';

interface TournamentsProps {
  tournaments: Tournament[];
  onRegisterTournament: (tournament: Tournament) => void;
}

export default function Tournaments({ tournaments, onRegisterTournament }: TournamentsProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12">
          <span className="font-display font-bold text-xs sm:text-sm tracking-widest text-brand-red uppercase block mb-3">
            Tournament Experience
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-brand-dark tracking-tight leading-none">
            Bounce Cup & Signature Series
          </h2>
        </div>

        {/* Bento Grid layout with 2 high-impact image cards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1 - The League / Bounce Cup */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] sm:h-[450px] rounded-[32px] overflow-hidden group shadow-lg"
          >
            {/* Background image & rich overlay */}
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800" 
                alt="Bounce Cup" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 bg-brand-red/10 group-hover:bg-brand-red/0 transition-colors duration-500"></div>
            </div>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 text-white">
              <div className="flex items-center gap-2 mb-3 bg-brand-red/90 text-white font-mono text-[10px] font-black tracking-widest uppercase w-fit px-3 py-1 rounded-full">
                <Trophy className="w-3.5 h-3.5" />
                BOUNCE CUP
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight mb-2 leading-none">
                THE LEAGUE
              </h3>
              
              <p className="font-sans text-sm text-white/70 max-w-md mb-6">
                Giải đấu chính quy tìm kiếm và vinh danh những tài năng Pickleball xuất sắc nhất trong cộng đồng toàn quốc.
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/15">
                <div className="text-white/60 font-sans text-xs">
                  <span>Khởi tranh: </span>
                  <span className="text-white font-semibold">25/08/2026</span>
                </div>
                
                <button 
                  onClick={() => onRegisterTournament(tournaments[0] || {
                    id: 'tour-1',
                    name: 'Bounce Cup 2026 - The League',
                    description: '',
                    tag: 'BOUNCE CUP',
                    image: '',
                    date: '25/08/2026',
                    registrationFee: 500000,
                    teamsRegistered: 28,
                    maxTeams: 32,
                    category: 'Đôi Nam / Đôi Nữ / Đôi Nam Nữ',
                    status: 'Đang mở'
                  })}
                  className="bg-white text-brand-dark hover:bg-brand-red hover:text-white px-5 py-2.5 rounded-full font-sans font-bold text-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer transform group-hover:translate-x-1"
                >
                  Đăng ký thi đấu
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2 - Signature Series */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] sm:h-[450px] rounded-[32px] overflow-hidden group shadow-lg"
          >
            {/* Background image & rich overlay */}
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800" 
                alt="Signature Series" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
            </div>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 text-white">
              <div className="flex items-center gap-2 mb-3 bg-white/15 backdrop-blur-md text-white font-mono text-[10px] font-black tracking-widest uppercase w-fit px-3 py-1 rounded-full border border-white/10">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                SIGNATURE SERIES
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight mb-2 leading-none">
                SIGNATURE SERIES
              </h3>
              
              <p className="font-sans text-sm text-white/70 max-w-md mb-6">
                Các sự kiện tranh tài độc quyền, thiết kế may đo cao cấp dành riêng cho các doanh nghiệp và thương hiệu hàng đầu.
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/15">
                <div className="text-white/60 font-sans text-xs">
                  <span>Khởi tranh: </span>
                  <span className="text-white font-semibold">12/09/2026</span>
                </div>
                
                <button 
                  onClick={() => onRegisterTournament(tournaments[1] || {
                    id: 'tour-2',
                    name: 'Signature Corporate Series',
                    description: '',
                    tag: 'SIGNATURE SERIES',
                    image: '',
                    date: '12/09/2026',
                    registrationFee: 1000000,
                    teamsRegistered: 12,
                    maxTeams: 16,
                    category: 'Đôi Doanh Nhân / Đôi Đại Diện Thương Hiệu',
                    status: 'Đang mở'
                  })}
                  className="bg-brand-red text-white hover:bg-brand-red-hover px-5 py-2.5 rounded-full font-sans font-bold text-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer transform group-hover:translate-x-1"
                >
                  Đăng ký thi đấu
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
