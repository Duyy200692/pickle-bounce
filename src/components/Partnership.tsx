import React from 'react';
import { Home, Users, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function Partnership() {
  const sections = [
    {
      title: 'Mạng lưới sân',
      description: 'Hệ thống sân partner cùng Pickleball Bounce giúp cộng đồng có thêm nhiều điểm chơi, điểm tập luyện đạt chuẩn và tổ chức các giải đấu liên tục trên nhiều khu vực.',
      icon: Home
    },
    {
      title: 'Social play',
      description: 'Lịch social play được vận hành liên tục hàng ngày để người chơi mới và người chơi phong trào dễ dàng kết nối, giao lưu ghép trận và tham gia các hoạt động tập thể sôi nổi.',
      icon: Users
    },
    {
      title: 'Huấn luyện viên',
      description: 'Đội ngũ huấn luyện viên chuyên nghiệp và tận tâm đồng hành trong các buổi clinic, giúp hỗ trợ đắc lực cho việc sửa dáng, nâng trình và chuẩn bị thể lực tốt nhất cho giải đấu.',
      icon: BookOpen
    }
  ];

  return (
    <section id="partnership" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14">
          <span className="font-display font-bold text-xs sm:text-sm tracking-widest text-brand-red uppercase block mb-3">
            COMMUNITY, SOCIAL, COURT PARTNERSHIP
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-brand-dark tracking-tight leading-none">
            Mạng lưới cộng đồng và sân đồng hành cùng Pickleball Bounce
          </h2>
        </div>

        {/* Grid: 3 Text Segments Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Block (7 cols) */}
          <div className="lg:col-span-6 space-y-10">
            {sections.map((section, idx) => {
              const IconComp = section.icon;
              return (
                <div key={idx} className="flex gap-4 group">
                  {/* Icon side with brand blue hover */}
                  <div className="w-12 h-12 rounded-2xl bg-brand-light-gray text-brand-dark flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                  {/* Text side with brand blue hover */}
                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-dark mb-2 group-hover:text-brand-blue transition-colors">
                      {section.title}
                    </h3>
                    <p className="font-sans text-sm text-brand-gray leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Image Block (5 cols) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1613918431208-6752fe243c5e?auto=format&fit=crop&q=80&w=800" 
                alt="Pickleball community members sitting and laughing on court" 
                className="w-full h-[400px] sm:h-[480px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/50 to-transparent"></div>
              
              {/* Bottom tag on image */}
              <div className="absolute bottom-6 left-6 text-white">
                <span className="font-display font-bold text-xs tracking-widest text-brand-blue bg-white/95 px-3.5 py-1.5 rounded-full shadow-lg">
                  KẾT NỐI ĐAM MÊ
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
