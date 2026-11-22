import React, { useState } from 'react';
import { Menu, X, User, ShieldCheck, Calendar, BookOpen, UserCog } from 'lucide-react';
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

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'The Hotel', href: '#the-hotel' },
    { name: 'Our Rooms', href: '#our-rooms' },
    { name: 'Food & Drink', href: '#food-and-drink' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  function handleBookingClick() {
    if (!currentUser) {
      onRequireSignIn('booking');
      return;
    }
    onOpenBooking();
  }

  const isAdmin = currentUser && isUserAdmin(currentUser);

  return (
    <header className="sticky top-0 z-40 bg-[#26483c]/95 backdrop-blur-md border-b border-emerald-900/40 text-white shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center font-serif text-xl font-bold bg-white/10 group-hover:border-amber-400 group-hover:text-amber-400 transition-colors">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-wide">Hytech</span>
            <span className="text-[10px] tracking-widest uppercase text-emerald-200/80 -mt-1 font-sans">Hotel & Bistro</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-2.5">
          <button
            onClick={handleBookingClick}
            className="bg-[#e2a63b] hover:bg-[#d4972f] text-[#142821] font-semibold text-xs lg:text-sm px-4 lg:px-5 py-2 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Booking</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* My Bookings */}
              <button
                onClick={onOpenMyBookings}
                className="border border-white/30 hover:border-white/70 bg-white/5 hover:bg-white/10 text-white text-xs px-3 py-2 rounded-full transition-colors flex items-center gap-1.5"
                title="View booking history"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>My Bookings</span>
              </button>

              {/* Profile Button */}
              <button
                onClick={onOpenProfile}
                className="border border-white/30 hover:border-amber-400/80 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                title="Edit My Profile"
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover border border-white/40" />
                ) : (
                  <User className="w-4 h-4 text-amber-300" />
                )}
                <span className="max-w-[90px] lg:max-w-[120px] truncate">{currentUser.name || currentUser.email?.split('@')[0]}</span>
              </button>

              <button
                onClick={onSignOut}
                className="text-xs text-emerald-300 hover:text-white underline px-1"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => onRequireSignIn('general')}
              className="border border-white/40 hover:border-white/80 text-white text-xs lg:text-sm px-4 py-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className="bg-emerald-950/90 hover:bg-emerald-900 border border-amber-400 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-full transition-colors flex items-center gap-1.5 shadow"
              title="Admin Dashboard (adminhotel968@gmail.com)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger & Quick Action */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleBookingClick}
            className="bg-[#e2a63b] text-[#142821] font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm"
          >
            Booking
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1f3b31] border-b border-emerald-800 px-4 pt-3 pb-6 space-y-2 max-h-[85vh] overflow-y-auto">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-emerald-100 hover:bg-white/10"
            >
              {link.name}
            </a>
          ))}
          
          <div className="pt-3 border-t border-emerald-800/80 flex flex-col gap-2.5">
            {currentUser ? (
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-semibold text-xs text-white truncate">{currentUser.name || 'Guest'}</p>
                    <p className="text-[11px] text-emerald-200/80 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                  >
                    <UserCog className="w-3.5 h-3.5 text-amber-300" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenMyBookings();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 px-3 rounded-xl bg-[#e2a63b] text-[#142821] text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>My Bookings</span>
                  </button>
                </div>

                <div className="pt-1 text-center">
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-300 hover:underline"
                  >
                    Sign out of account
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onRequireSignIn('general');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-full border border-white/40 text-sm font-medium text-center hover:bg-white/10"
              >
                Sign in to Account
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-full bg-emerald-950 border border-amber-400 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
