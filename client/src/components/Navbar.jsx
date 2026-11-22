import React, { useState } from 'react';
import { Menu, X, User, ShieldCheck, Calendar } from 'lucide-react';
import { isUserAdmin } from '../services/firebase';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  currentUser, 
  onOpenBooking, 
  onRequireSignIn,
  onOpenMyBookings, 
  onSignOut 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'The Hotel', href: '#the-hotel' },
    { name: 'Our Rooms', href: '#our-rooms' },
    { name: 'Food & Drink', href: '#food-and-drink' },
    { name: 'Contact', href: '#contact' },
    { name: 'Reviews', href: '#reviews' },
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
    <header className="sticky top-0 z-40 bg-[#26483c]/90 backdrop-blur-md border-b border-emerald-900/40 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center font-serif text-xl font-bold bg-white/10 group-hover:border-amber-400 group-hover:text-amber-400 transition-colors">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-wide">Hytech</span>
            <span className="text-[10px] tracking-widest uppercase text-emerald-200/80 -mt-1 font-sans">Hotel & Bistro</span>
          </div>
        </a>

        
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        
        <div className="hidden md:flex items-center space-x-3">
         
          <button
            onClick={handleBookingClick}
            className="bg-[#e2a63b] hover:bg-[#d4972f] text-[#142821] font-semibold text-sm px-5 py-2 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Booking</span>
          </button>

        
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenMyBookings}
                className="border border-white/30 hover:border-white/70 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-2"
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-amber-300" />
                )}
                <span className="max-w-[120px] truncate">{currentUser.name || currentUser.email}</span>
                {isAdmin && (
                  <span className="bg-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>
                )}
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
              className="border border-white/40 hover:border-white/80 text-white text-sm px-4 py-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>Sign in</span>
            </button>
          )}

         
          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className="bg-emerald-950/90 hover:bg-emerald-900 border border-amber-400 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-full transition-colors flex items-center gap-1.5 shadow"
              title="Admin Dashboard (Authorized for adminhotel968@gmail.com)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

     
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleBookingClick}
            className="bg-[#e2a63b] text-[#142821] font-medium text-xs px-3 py-1.5 rounded-full"
          >
            Booking
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

     
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1f3b31] border-b border-emerald-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-100 hover:bg-white/10"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-emerald-800/80 flex flex-col gap-2">
            {currentUser ? (
              <div className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-xs text-emerald-200 truncate max-w-[180px]">{currentUser.email}</span>
                <div className="flex gap-2">
                  <button onClick={() => { onOpenMyBookings(); setMobileMenuOpen(false); }} className="text-xs bg-amber-500 text-black px-2 py-1 rounded">My Bookings</button>
                  <button onClick={onSignOut} className="text-xs text-emerald-300 underline">Exit</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { onRequireSignIn('general'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-full border border-white/40 text-sm font-medium text-center"
              >
                Sign in
              </button>
            )}

            
            {isAdmin && (
              <button
                onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
                className="w-full py-2 rounded-full bg-emerald-950 border border-amber-400 text-amber-300 text-xs font-bold text-center"
              >
                Open Admin Panel
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
