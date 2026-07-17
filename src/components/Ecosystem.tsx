import React from 'react';
import { Calendar, ShieldAlert, Award, Star, Radio, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function Ecosystem() {
  const steps = [
    {
      id: '01',
      title: 'Bounce Cup',
      description: 'Giải đấu nhằm thúc đẩy tìm kiếm tài năng và xếp hạng thành tích vận động viên trong hệ thống Pickleball Bounce.',
      icon: Award
    },
    {
      id: '02',
      title: 'Signature Series',
      description: 'Giải đấu cao cấp được Pickleball Bounce xây dựng dành riêng cho từng nhãn hàng và doanh nghiệp đối tác.',
      icon: Star
    },
    {
      id: '03',
      title: 'Community & Social',
      description: 'Lịch open play, clinic huấn luyện, social content và creator network giúp cộng đồng luôn sôi động mỗi tuần.',
      icon: Radio
    },
    {
      id: '04',
      title: 'Court Partnership',
      description: 'Mạng lưới sân đối tác cùng Bounce mở rộng điểm chạm cộng đồng và nâng cao chất lượng trải nghiệm thi đấu.',
      icon: MapPin
    }
  ];

  return (
    <section id="ecosystem" className="py-20 bg-brand-light-gray border-y border-brand-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header matching the image mockup */}
        <div className="mb-12">
          <span className="font-display font-bold text-xs sm:text-sm tracking-widest text-brand-red uppercase block mb-3">
            Hành trình vận hành
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-brand-dark tracking-tight leading-none">
            Câu chuyện Pickleball trong hệ sinh thái Pickle Bounce
          </h2>
        </div>

        {/* Dynamic Horizontal/Vertical Steps Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-brand-border/40 shadow-sm hover:shadow-xl hover:border-brand-blue/30 transition-all duration-300 relative group overflow-hidden"
              >
                {/* Decorative glowing blue hover ring */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-transparent group-hover:bg-brand-blue transition-all duration-300"></div>

                {/* Left/Top Serial Number in orange */}
                <div className="flex justify-between items-start mb-6">
                  <span className="font-display font-black text-3xl text-brand-red opacity-80 group-hover:opacity-100 transition-opacity">
                    {step.id}
                  </span>
                  
                  {/* Subtle Icon badge with brand blue hover */}
                  <div className="w-10 h-10 bg-brand-light-gray rounded-xl flex items-center justify-center text-brand-dark/50 group-hover:bg-brand-blue-light group-hover:text-brand-blue transition-all duration-300">
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                {/* Card Title with brand blue hover */}
                <h3 className="font-display font-bold text-xl text-brand-dark mb-4 group-hover:text-brand-blue transition-colors">
                  {step.title}
                </h3>

                {/* Card Description */}
                <p className="font-sans text-sm text-brand-gray leading-relaxed">
                  {step.description}
                </p>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
