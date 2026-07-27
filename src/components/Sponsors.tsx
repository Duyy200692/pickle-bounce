import React from 'react';
import { Award, Shield, CheckCircle } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
}

interface SponsorsProps {
  sponsors: Sponsor[];
}

export default function Sponsors({ sponsors }: SponsorsProps) {
  return (
    <section className="py-12 bg-brand-light-gray border-y border-brand-border/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Label matching image mockup */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="h-[1px] w-6 bg-brand-gray/30"></span>
          <span className="font-display font-bold text-[11px] sm:text-xs tracking-widest text-brand-gray uppercase">
            NHÀ ĐỒNG HÀNH CHIẾN LƯỢC
          </span>
          <span className="h-[1px] w-6 bg-brand-gray/30"></span>
        </div>

        {/* Brand/Sponsor Grid - clean, minimalist grey badges, highlight red on hover */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-4 items-center">
          {sponsors.map((sponsor) => {
            const isImageUrl = sponsor.logo && (
              sponsor.logo.startsWith('http://') || 
              sponsor.logo.startsWith('https://') || 
              sponsor.logo.startsWith('data:') ||
              sponsor.logo.includes('/')
            );
            return (
              <div 
                key={sponsor.id}
                className="bg-white px-3 py-4 rounded-xl border border-brand-border/40 shadow-sm hover:border-brand-red/30 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group h-16"
                title={sponsor.name}
              >
                {isImageUrl ? (
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="max-h-8 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-[11px] font-display font-black tracking-widest text-brand-dark/40 group-hover:text-brand-red transition-colors duration-300 truncate max-w-full text-center">
                    {sponsor.logo || sponsor.name}
                  </div>
                )}
                <div className="w-1.5 h-1.5 rounded-full bg-brand-dark/10 group-hover:bg-brand-red mt-1 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
