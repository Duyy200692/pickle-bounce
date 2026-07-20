import React, { useState } from 'react';
import { Calendar, User, Users, Compass, ChevronDown, Menu, X, Shield, ShoppingBag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenMatchLobby: () => void;
  onOpenMySchedule: () => void;
  onOpenAdmin: () => void;
  onOpenTraining: () => void;
  bookingCount: number;
}

export default function Navbar({ onOpenBooking, onOpenMatchLobby, onOpenMySchedule, onOpenAdmin, onOpenTraining, bookingCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {/* Logo Icon Badge matching the uploaded image */}
            <div className="relative w-11 h-11 bg-brand-blue rounded-xl flex items-center justify-center shadow-md shadow-brand-blue/25 overflow-hidden group">
              <svg className="w-9 h-9 text-[#F89E13] transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                {/* Bounce wave path matching the logo */}
                <path d="M15 58 C 30 35, 40 55, 52 45 T 75 35" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Pickleball */}
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
            
            {/* Brand Name with exact color scheme */}
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight text-brand-blue leading-none">
                Pickle
              </span>
              <span className="font-display font-black text-sm tracking-[0.18em] text-brand-red leading-none mt-1">
                BOUNCE
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => {
                const element = document.getElementById('ecosystem');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-brand-dark/80 hover:text-brand-red font-sans font-semibold text-sm transition-colors cursor-pointer"
            >
              Cơ cấu
            </button>
            <button 
              onClick={onOpenMatchLobby}
              className="text-brand-dark/80 hover:text-brand-red font-sans font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Cộng đồng
              <span className="inline-block w-1.5 h-1.5 bg-brand-red rounded-full animate-ping"></span>
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('partnership');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-brand-dark/80 hover:text-brand-red font-sans font-semibold text-sm transition-colors cursor-pointer"
            >
              Mạng lưới Creator
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('schedule');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-brand-dark/80 hover:text-brand-red font-sans font-semibold text-sm transition-colors cursor-pointer"
            >
              Vé F&B
            </button>
            <button 
              onClick={onOpenTraining}
              className="text-brand-blue hover:text-brand-red font-sans font-extrabold text-sm flex items-center gap-1 transition-all cursor-pointer bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full border border-brand-blue/20"
            >
              <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" />
              Đăng Ký Gói Tập & HLV
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {bookingCount > 0 && (
              <button 
                onClick={onOpenMySchedule}
                className="relative bg-brand-red-light border border-brand-red/20 text-brand-red px-4 py-2 rounded-full font-sans font-bold text-xs hover:bg-brand-red hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                Lịch của tôi
                <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white animate-bounce">
                  {bookingCount}
                </span>
              </button>
            )}

            <button 
              onClick={onOpenAdmin}
              className="text-brand-dark/60 hover:text-brand-red p-2.5 rounded-full hover:bg-brand-light-gray transition-all cursor-pointer flex items-center justify-center"
              title="Cổng quản trị hệ thống"
            >
              <Shield className="w-5 h-5" />
            </button>

            <button 
              onClick={onOpenBooking}
              className="bg-brand-red hover:bg-brand-red-hover text-white px-6 py-2.5 rounded-full font-sans font-bold text-sm transition-all duration-300 transform active:scale-95 shadow-md shadow-brand-red/20 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Đặt Sân Ngay
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {bookingCount > 0 && (
              <button 
                onClick={onOpenMySchedule}
                className="relative bg-brand-red text-white p-2 rounded-full cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-white text-brand-red w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">
                  {bookingCount}
                </span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-brand-dark p-2 rounded-md hover:bg-brand-light-gray cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-brand-border/40 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  const element = document.getElementById('ecosystem');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-brand-dark hover:bg-brand-light-gray font-sans font-semibold text-base"
              >
                Cơ cấu
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMatchLobby();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-brand-dark hover:bg-brand-light-gray font-sans font-semibold text-base flex items-center justify-between"
              >
                Cộng đồng
                <span className="bg-brand-red text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  const element = document.getElementById('partnership');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-brand-dark hover:bg-brand-light-gray font-sans font-semibold text-base"
              >
                Mạng lưới Creator
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  const element = document.getElementById('schedule');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-brand-dark hover:bg-brand-light-gray font-sans font-semibold text-base"
              >
                Vé F&B
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTraining();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-brand-blue hover:text-brand-red hover:bg-blue-50 font-sans font-bold text-base flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" />
                Đăng Ký Gói Tập & HLV
              </button>
              
              <div className="pt-4 border-t border-brand-border/40 flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full text-center bg-brand-light-gray hover:bg-brand-border/40 text-brand-dark py-2.5 rounded-full font-sans font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-4 h-4 text-brand-red" />
                  Cổng Quản Trị Hệ Thống
                </button>

                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full text-center bg-brand-red hover:bg-brand-red-hover text-white py-3 rounded-full font-sans font-bold text-sm shadow-md"
                >
                  Đặt Sân Ngay
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
