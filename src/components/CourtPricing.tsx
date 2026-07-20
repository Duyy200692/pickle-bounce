import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, DollarSign, Sparkles } from 'lucide-react';
import { LandingPageConfig } from '../types';

interface CourtPricingProps {
  config?: LandingPageConfig;
}

export default function CourtPricing({ config }: CourtPricingProps) {
  const priceTitle = config?.priceTitle || "BẢNG GIÁ SÂN";
  const section1Title = config?.priceSection1Title || "Khách Vãng Lai";
  const rows1 = config?.priceRows1 || [
    { day: "T2 - T6", time: "16h - 22h", price: "250.000 đ" },
    { day: "T2 - CN", time: "6h - 16h", price: "150.000 đ" },
    { day: "T7 - CN", time: "16h - 22h", price: "200.000 đ" }
  ];
  const section2Title = config?.priceSection2Title || "Ưu đãi tháng 10";
  const rows2 = config?.priceRows2 || [
    { title: "Khách vãng lai", time: "Mặc định", price: "250.000 đ" }
  ];

  return (
    <section id="pricing" className="py-16 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Main Title Banner matching the screenshot */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#0f5132] text-white text-center py-4 rounded-t-xl shadow-md border-b-4 border-[#146c43]"
        >
          <h2 className="font-display font-black text-2xl tracking-wider flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-red animate-pulse" />
            {priceTitle.toUpperCase()}
          </h2>
        </motion.div>

        {/* Pricing Tables Container */}
        <div className="space-y-12 mt-8">
          
          {/* Section 1 Table: Khách Vãng Lai */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border border-[#146c43]/30 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Header: Khách Vãng Lai */}
            <div className="bg-[#146c43]/5 text-[#0f5132] text-center py-3 border-b border-[#146c43]/20">
              <h3 className="font-display font-black text-lg">{section1Title}</h3>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans text-[#212529]">
                <thead>
                  <tr className="bg-[#146c43]/10 text-[#0f5132] font-bold border-b border-[#146c43]/20">
                    <th className="py-3 px-4 text-center border-r border-[#146c43]/10 w-1/3 flex-row items-center justify-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Thứ</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center border-r border-[#146c43]/10 w-1/3">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Khung giờ</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center w-1/3">
                      <div className="flex items-center justify-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>Giá</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#146c43]/10">
                  {rows1.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-[#146c43]/5 transition-colors duration-150 font-semibold"
                    >
                      <td className="py-3.5 px-4 text-center border-r border-[#146c43]/10 text-brand-dark">
                        {row.day}
                      </td>
                      <td className="py-3.5 px-4 text-center border-r border-[#146c43]/10 text-brand-gray">
                        {row.time}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#0f5132] font-bold text-base">
                        <span className="underline decoration-dotted underline-offset-4">{row.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Section 2 Table: Ưu đãi tháng 10 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border border-[#146c43]/30 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Header: Ưu đãi tháng 10 */}
            <div className="bg-[#146c43]/5 text-[#0f5132] text-center py-3 border-b border-[#146c43]/20">
              <h3 className="font-display font-black text-lg">{section2Title}</h3>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans text-[#212529]">
                <thead>
                  {/* Row 1 span: Khách vãng lai */}
                  <tr className="bg-[#146c43]/10 text-[#0f5132] font-bold border-b border-[#146c43]/20">
                    <th colSpan={2} className="py-3 px-4 text-center">
                      Khách vãng lai
                    </th>
                  </tr>
                  {/* Sub headers */}
                  <tr className="bg-[#146c43]/5 text-[#0f5132] font-semibold text-xs border-b border-[#146c43]/20">
                    <th className="py-2 px-4 text-center border-r border-[#146c43]/10 w-1/2">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Khung giờ</span>
                      </div>
                    </th>
                    <th className="py-2 px-4 text-center w-1/2">
                      <div className="flex items-center justify-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Giá</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#146c43]/10">
                  {rows2.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-[#146c43]/5 transition-colors duration-150 font-semibold"
                    >
                      <td className="py-3.5 px-4 text-center border-r border-[#146c43]/10 text-brand-gray">
                        {row.time || row.time}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#0f5132] font-bold text-base">
                        <span className="underline decoration-dotted underline-offset-4">{row.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
