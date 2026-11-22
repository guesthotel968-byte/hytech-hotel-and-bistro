import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, BookOpen, ShieldCheck, ChevronDown } from 'lucide-react';
import { isUserAdmin } from '../services/firebase';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  currentUser, 
  onOpenBooking, 
  onRequireSignIn,
  onOpenMyBookings,
  onOpenProfile,
  onSignOut 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('food-and-drink');

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'The Hotel', href: '#the-hotel', id: 'the-hotel' },
    { name: 'Our Rooms', href: '#our-rooms', id: 'our-rooms' },
    { name: 'Food & Drink', href: '#food-and-drink', id: 'food-and-drink' },
    { name: 'Reviews', href: '#reviews', id: 'reviews' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  // Detect scroll position to highlight active link
  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY + 200;
      for (const link of navLinks) {
        const el = document.getElementById(link.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(link.id);
            break;
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleBookingClick() {
    if (!currentUser) {
      onRequireSignIn('booking');
      return;
    }
    onOpenBooking();
  }

  const isAdmin = currentUser && isUserAdmin(currentUser);
  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'G');

  return (
    <header className="sticky top-2 sm:top-4 z-40 w-full px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto bg-[#17372c]/95 backdrop-blur-md rounded-full shadow-xl border border-emerald-800/60 px-4 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto transition-all">
        
        {/* Brand Logo - Matches screenshot with arched "H" icon */}
        <a href="#home" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-9 border border-[#dfc38c] rounded-t-full rounded-b-xs flex items-center justify-center font-serif text-sm sm:text-base font-bold text-[#dfc38c] bg-[#142f25] group-hover:bg-[#1a3d30] transition-colors shadow-xs">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white leading-none">
              Hytech
            </span>
            <span className="text-[8px] sm:text-[9px] font-sans font-bold tracking-[0.18em] uppercase text-[#dfc38c] mt-0.5">
              HOTEL & BISTRO
            </span>
          </div>
        </a>

        {/* Center Pill - Exactly matches media_1795330097203_4d84e360.png */}
        <nav className="hidden lg:flex items-center bg-[#22483b]/90 border border-emerald-700/50 rounded-full px-2 py-1 gap-1 shadow-inner">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setActiveSection(link.id)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-[#2f5d4c] text-white shadow-xs font-semibold'
                    : 'text-emerald-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </a>
            );
          })}

          {/* Booking Pill Button (Gold capsule inside center pill!) */}
          <button
            onClick={handleBookingClick}
            className="bg-[#d8be8d] hover:bg-[#cbb07e] text-[#142821] font-semibold text-xs px-4 py-1.5 rounded-full shadow-sm hover:shadow transition-all ml-1.5 cursor-pointer"
          >
            Booking
          </button>
        </nav>

        {/* Right Side: Profile Pill Button matching media_1795330097203_4d84e360.png */}
        <div className="flex items-center gap-2">
          {/* Mobile Booking button shortcut */}
          <button
            onClick={handleBookingClick}
            className="lg:hidden bg-[#d8be8d] hover:bg-[#cbb07e] text-[#142821] font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-sm"
          >
            Booking
          </button>

          {/* Profile Capsule Button */}
          <button
            onClick={onOpenProfile}
            className="border border-emerald-700/60 bg-[#22483b]/80 hover:bg-[#22483b] text-white rounded-full px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="View Profile"
          >
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="" 
                className="w-5 h-5 rounded-full object-cover border border-white/40" 
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#8c4b3e] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {userInitial}
              </div>
            )}
            <span className="text-[#dfc38c] text-xs font-semibold tracking-wide">
              Profile
            </span>
          </button>

          {/* Admin shortcut if logged in as admin */}
          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className="hidden sm:flex items-center gap-1 bg-amber-500/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 text-xs px-2.5 py-1.5 rounded-full transition-colors"
              title="Open Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-emerald-100 hover:text-white rounded-full hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-6xl mx-auto mt-2 bg-[#17372c]/98 backdrop-blur-lg rounded-3xl border border-emerald-800/80 shadow-2xl p-5 text-white animate-in slide-in-from-top-2 pointer-events-auto">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-3 border-t border-emerald-800/60 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleBookingClick();
                }}
                className="w-full py-2.5 rounded-xl bg-[#d8be8d] text-[#142821] font-semibold text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Room (Booking)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="w-full py-2.5 rounded-xl border border-emerald-700/60 bg-[#22483b] text-[#dfc38c] font-semibold text-sm flex items-center justify-center gap-2"
              >
                <span>Profile & Reservations</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('admin');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              {currentUser && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full py-2 text-center text-xs text-rose-300 hover:text-rose-200 mt-1"
                >
                  Sign Out ({currentUser.email})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
