import React from 'react';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import { motion } from 'motion/react';

export default function Vision() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Tag */}
            <div className="flex items-center gap-2 mb-4">
              <span className="h-[2px] w-8 bg-brand-red"></span>
              <span className="font-display font-bold text-xs sm:text-sm tracking-widest text-brand-red uppercase">
                Tầm nhìn cộng đồng
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-brand-dark tracking-tight leading-none mb-6">
              Chơi cùng nhau. <br className="hidden sm:inline" />
              Tiến bộ cùng nhau. <br className="hidden sm:inline" />
              Vươn tầm cùng nhau.
            </h2>

            {/* Description */}
            <div className="space-y-4 font-sans text-base text-brand-gray leading-relaxed max-w-xl">
              <p>
                <strong>Pickleball Bounce</strong> được tạo ra như một sân chơi mới cho cộng đồng đam mê pickleball. Từ người mới bắt đầu cầm vợt đến các vận động viên phong trào hay chuyên nghiệp, ai cũng có chỗ đứng và lộ trình phát triển rõ ràng.
              </p>
              <p>
                Chúng tôi kết nối hệ thống giải đấu kịch tính, các hoạt động truyền thông sôi nổi và mạng lưới sân bãi đối tác rộng lớn thành một hệ sinh thái chung, mang lại sự tiện nghi và hứng khởi tuyệt đối cho người chơi.
              </p>
            </div>

            {/* Micro Stats inside section */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-brand-border/40 max-w-lg">
              <div>
                <span className="block font-display font-black text-3xl text-brand-red">12k+</span>
                <span className="block text-xs font-semibold text-brand-gray mt-1 uppercase tracking-wider">Hội viên active</span>
              </div>
              <div>
                <span className="block font-display font-black text-3xl text-brand-red">50+</span>
                <span className="block text-xs font-semibold text-brand-gray mt-1 uppercase tracking-wider">Sân đối tác</span>
              </div>
              <div>
                <span className="block font-display font-black text-3xl text-brand-red">180+</span>
                <span className="block text-xs font-semibold text-brand-gray mt-1 uppercase tracking-wider">Giải đấu lớn nhỏ</span>
              </div>
            </div>

          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800" 
                alt="Pickleball active players smiling together" 
                className="w-full h-[380px] sm:h-[450px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />
              {/* Image Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent"></div>
              
              {/* Absolute Badge on Image */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-red-light rounded-xl flex items-center justify-center text-brand-red-hover flex-shrink-0">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-dark leading-snug">Chinh phục đỉnh cao mới</h4>
                  <p className="font-sans text-xs text-brand-gray mt-0.5">Sẵn sàng cùng đồng đội nâng hạng tuần này.</p>
                </div>
              </div>
            </div>

            {/* Background design elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-red/5 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-red/10 rounded-full blur-3xl -z-10"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
