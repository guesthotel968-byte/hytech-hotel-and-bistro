import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, BookOpen, ShieldCheck, User } from 'lucide-react';
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
  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Guest';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#28483c] border-b border-emerald-950/40 text-white shadow-md w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
        
        {/* Brand Logo - Matches media_1795333612197_6f1dc92c.png */}
        <a href="#home" className="flex items-center gap-3.5 group shrink-0">
          <div className="w-12 h-12 rounded-2xl border border-white/25 bg-white/10 group-hover:bg-white/20 flex items-center justify-center font-serif text-2xl font-bold text-white shadow-xs transition-colors">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white leading-tight">
              Hytech
            </span>
            <span className="text-[11px] sm:text-xs tracking-[0.2em] uppercase text-emerald-200/90 font-semibold font-sans mt-0.5">
              HOTEL & BISTRO
            </span>
          </div>
        </a>

        {/* Center Navigation Links for Desktop */}
        <nav className="hidden lg:flex items-center space-x-1 bg-black/15 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setActiveSection(link.id)}
                className={`text-xs xl:text-sm font-medium px-3.5 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-[#1b362c] text-white shadow-xs font-semibold'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Right Side Buttons - Matches media_1795333612197_6f1dc92c.png */}
        <div className="hidden md:flex items-center space-x-3">
          
          {/* 1. Gold Booking Button */}
          <button
            onClick={handleBookingClick}
            className="bg-[#e5a639] hover:bg-[#d6982f] text-[#142821] font-bold text-sm sm:text-base px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#142821]" />
            <span>Booking</span>
          </button>

          {/* If Signed In */}
          {currentUser ? (
            <>
              {/* 2. My Bookings Button */}
              <button
                onClick={onOpenMyBookings}
                className="border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/15 text-white font-medium text-sm sm:text-base px-5 py-2.5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                title="View your bookings"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>My Bookings</span>
              </button>

              {/* 3. User Profile Pill (e.g. hazel) */}
              <button
                onClick={onOpenProfile}
                className="border border-white/30 hover:border-amber-400 bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base px-4 py-2 rounded-full flex items-center gap-2.5 transition-all cursor-pointer shadow-xs"
                title="Edit profile & photo"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-white/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#8c4b3e] text-white text-xs font-bold flex items-center justify-center border border-white/30">
                    {userInitial}
                  </div>
                )}
                <span className="max-w-[120px] truncate capitalize">
                  {displayName}
                </span>
              </button>

              {/* 4. Sign Out Text Link */}
              <button
                onClick={onSignOut}
                className="text-emerald-200 hover:text-white text-sm sm:text-base underline font-medium cursor-pointer transition-colors ml-1"
              >
                Sign out
              </button>
            </>
          ) : (
            /* If Not Signed In */
            <button
              onClick={onOpenProfile}
              className="border border-white/30 hover:border-amber-400 bg-white/10 hover:bg-white/20 text-white font-medium text-sm sm:text-base px-5 py-2.5 rounded-full flex items-center gap-2.5 transition-all cursor-pointer shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-[#8c4b3e] text-white text-xs font-bold flex items-center justify-center border border-white/30">
                G
              </div>
              <span className="font-semibold text-emerald-100">
                Profile
              </span>
            </button>
          )}

          {/* Admin shortcut if logged in as admin */}
          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className="bg-amber-500/20 border border-amber-400/60 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs px-3 py-2 rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
              title="Open Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}

        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={handleBookingClick}
            className="bg-[#e5a639] hover:bg-[#d6982f] text-[#142821] font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow"
          >
            Booking
          </button>

          <button
            onClick={onOpenProfile}
            className="border border-white/30 bg-white/10 text-white p-2 rounded-full"
            title="Profile"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-amber-300" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1f3b30] border-t border-emerald-900/60 p-5 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1.5 pb-3 border-b border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleBookingClick();
              }}
              className="w-full py-3 rounded-xl bg-[#e5a639] text-[#142821] font-bold text-sm shadow flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Room</span>
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMyBookings();
                }}
                className="w-full py-2.5 rounded-xl border border-white/25 bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>My Bookings</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="w-full py-2.5 rounded-xl border border-white/25 bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <span>Profile ({displayName})</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentView('admin');
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-semibold text-sm flex items-center justify-center gap-2"
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
                className="w-full py-2 text-center text-xs text-rose-300 hover:text-rose-200 mt-2 underline"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
