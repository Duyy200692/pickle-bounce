import React from 'react';
import { Calendar, Compass, User, Users, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface WeeklyScheduleProps {
  onOpenMatchLobby: () => void;
  onOpenBooking: () => void;
}

export default function WeeklySchedule({ onOpenMatchLobby, onOpenBooking }: WeeklyScheduleProps) {
  const cards = [
    {
      tag: 'HÀNG TUẦN',
      title: 'Open Play & Skill Clinic',
      description: 'Sân chơi định kỳ giúp bạn giao lưu, chỉnh sửa lỗi kỹ thuật, tập luyện bài bản cùng HLV và duy trì năng lượng rèn luyện hàng tuần.',
      actionText: 'Tìm Kèo Giao Lưu',
      onClick: onOpenMatchLobby
    },
    {
      tag: 'HÀNG THÁNG',
      title: 'Community Challenge',
      description: 'Sân chơi thi đấu rút gọn giúp bạn cọ xát trực tiếp, tích lũy điểm hệ thống, rèn luyện bản lĩnh thi đấu và nâng cao tinh thần cạnh tranh.',
      actionText: 'Xem Giải Đấu',
      onClick: () => {
        const el = document.getElementById('ecosystem');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      tag: 'THEO MÙA',
      title: 'Bounce Cup & Signature',
      description: 'Chuỗi sự kiện đỉnh cao quy tụ anh tài cả nước tranh tài. Hệ thống giải đấu quy mô, minh bạch, có ghi nhận truyền thông và xếp hạng chuyên nghiệp.',
      actionText: 'Đặt Sân Tập Ngay',
      onClick: onOpenBooking
    }
  ];

  return (
    <section id="schedule" className="py-16 bg-brand-light-gray border-t border-brand-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row of three columns matching mockup exactly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[24px] border border-brand-border/50 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-brand-red/20 transition-all duration-300 relative group"
            >
              <div>
                {/* Red/Gray tiny tag at top */}
                <span className="font-display font-bold text-[10px] tracking-widest text-brand-red mb-3 block">
                  {card.tag}
                </span>

                {/* Card Title */}
                <h3 className="font-display font-bold text-xl text-brand-dark mb-4 leading-tight group-hover:text-brand-red transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-sm text-brand-gray leading-relaxed mb-8">
                  {card.description}
                </p>
              </div>

              {/* Interactive bottom link */}
              <button 
                onClick={card.onClick}
                className="flex items-center gap-1 text-brand-red hover:text-brand-red-hover font-sans font-bold text-xs cursor-pointer group-hover:gap-2 transition-all mt-auto"
              >
                {card.actionText}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
