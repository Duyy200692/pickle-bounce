import React from 'react';
import { Trophy, ArrowRight, Calendar, Users, Tag, FileText, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Tournament } from '../types';

interface TournamentsProps {
  tournaments: Tournament[];
  onRegisterTournament: (tournament: Tournament, initialTab?: 'register' | 'rules' | 'gallery') => void;
}

export default function Tournaments({ tournaments = [], onRegisterTournament }: TournamentsProps) {
  return (
    <section id="tournaments" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-display font-bold text-xs sm:text-sm tracking-widest text-brand-red uppercase block mb-3">
              Tournament Experience
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-brand-dark tracking-tight leading-none">
              Giải Đấu & Sự Kiện Pickleball
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-gray max-w-md">
            Hệ thống giải đấu chuyên nghiệp và phong trào quy tụ các vận động viên xuất sắc toàn quốc. Xem điều lệ và thư viện hình ảnh công khai.
          </p>
        </div>

        {/* Dynamic List of Tournaments */}
        {tournaments.length === 0 ? (
          <div className="bg-brand-light-gray rounded-[24px] p-12 text-center border border-brand-border/40">
            <Trophy className="w-12 h-12 text-brand-gray mx-auto mb-3 opacity-50" />
            <p className="font-sans text-sm text-brand-gray font-medium">Hiện chưa có giải đấu nào được khởi tạo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tournaments.map((tournament, index) => {
              const defaultImage = index % 2 === 0 
                ? "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800"
                : "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=800";
              
              const imageUrl = tournament.image || defaultImage;
              const hasGallery = tournament.gallery && tournament.gallery.length > 0;

              return (
                <motion.div 
                  key={tournament.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative min-h-[440px] rounded-[32px] overflow-hidden group shadow-lg flex flex-col justify-end"
                >
                  {/* Background image & rich overlay */}
                  <div className="absolute inset-0">
                    <img 
                      src={imageUrl} 
                      alt={tournament.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20"></div>
                  </div>

                  {/* Inner Content */}
                  <div className="relative z-10 p-6 sm:p-10 text-white flex flex-col justify-end h-full">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 bg-brand-red/90 text-white font-mono text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
                        <Trophy className="w-3.5 h-3.5" />
                        {tournament.tag || 'BOUNCE CUP'}
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        tournament.status === 'Đang mở' ? 'bg-emerald-500/90 text-white' :
                        tournament.status === 'Sắp diễn ra' ? 'bg-amber-500/90 text-white' :
                        'bg-slate-700/90 text-white'
                      }`}>
                        {tournament.status || 'Đang mở'}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight mb-2 leading-tight uppercase">
                      {tournament.name}
                    </h3>
                    
                    {tournament.description && (
                      <p className="font-sans text-xs sm:text-sm text-white/80 line-clamp-2 mb-3">
                        {tournament.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 py-3 my-2 border-y border-white/15 text-xs text-white/80">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-red" />
                        <span>Khởi tranh: <strong className="text-white">{tournament.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-brand-red" />
                        <span>Đã ĐK: <strong className="text-white">{tournament.teamsRegistered || 0}/{tournament.maxTeams || 32} đội</strong></span>
                      </div>
                      {tournament.category && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Tag className="w-3.5 h-3.5 text-brand-red" />
                          <span>Hạng mục: <strong className="text-white">{tournament.category}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs">
                        <span className="text-white/60 block text-[10px] uppercase font-mono">Lệ phí đăng ký</span>
                        <span className="text-white font-bold text-base font-mono">
                          {tournament.registrationFee ? `${tournament.registrationFee.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button 
                          onClick={() => onRegisterTournament(tournament, 'rules')}
                          className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md px-4 py-2.5 rounded-full font-sans font-semibold text-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer border border-white/20"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Điều lệ & Ảnh {hasGallery ? `(${tournament.gallery?.length})` : ''}
                        </button>

                        <button 
                          onClick={() => onRegisterTournament(tournament, 'register')}
                          className="bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-full font-sans font-bold text-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-red/30 transform group-hover:translate-x-0.5"
                        >
                          Đăng ký
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
