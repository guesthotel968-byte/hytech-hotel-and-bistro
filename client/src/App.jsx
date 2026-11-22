import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HotelInfo from './components/HotelInfo';
import Accommodations from './components/Accommodations';
import DiningMenu from './components/DiningMenu';
import ReviewsSection from './components/ReviewsSection';
import ContactSection from './components/ContactSection';
import ReservationModal from './components/ReservationModal';
import ReservationReceiptModal from './components/ReservationReceiptModal';
import MyBookingsModal from './components/MyBookingsModal';
import SignInModal from './components/SignInModal';
import AdminLayout from './components/admin/AdminLayout';
import { ADMIN_EMAIL, signOutUser, auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Views: 'guest' or 'admin'
  const [currentView, setCurrentView] = useState('guest');

  // Currently logged in user (loaded from local storage or null initially)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hytech_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  
  // Sign In Modal states
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [signInMode, setSignInMode] = useState('general'); // 'booking', 'admin', 'general'
  const [pendingBookingRoom, setPendingBookingRoom] = useState(null);

  // Listen to Firebase auth state if available
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const u = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          isAdmin: fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        };
        setCurrentUser(u);
        localStorage.setItem('hytech_user', JSON.stringify(u));
      }
    });
    return () => unsubscribe();
  }, []);

  function handleRequireSignIn(mode = 'general', room = null) {
    setSignInMode(mode);
    setPendingBookingRoom(room);
    setIsSignInOpen(true);
  }

  function handleOpenBooking(room = null) {
    if (!currentUser) {
      handleRequireSignIn('booking', room);
      return;
    }
    setSelectedRoomForBooking(room);
    setIsBookingOpen(true);
  }

  function handleUserSignedIn(userData) {
    setCurrentUser(userData);
    localStorage.setItem('hytech_user', JSON.stringify(userData));

    // If user was trying to book a room, automatically proceed to booking!
    if (signInMode === 'booking') {
      setSelectedRoomForBooking(pendingBookingRoom);
      setIsBookingOpen(true);
      setPendingBookingRoom(null);
    } 
    // If user was trying to access admin and is authorized
    else if (signInMode === 'admin') {
      if (userData.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setCurrentView('admin');
      }
    }
  }

  async function handleSignOut() {
    await signOutUser();
    setCurrentUser(null);
    localStorage.removeItem('hytech_user');
    if (currentView === 'admin') {
      setCurrentView('guest');
    }
  }

  function handleBookingSuccess(createdBooking) {
    setActiveReceipt(createdBooking);
  }

  return (
    <div className="min-h-screen bg-[#eaf0ec] font-sans antialiased text-[#1c2c26]">
      {currentView === 'admin' ? (
        <AdminLayout
          currentUser={currentUser}
          onBackToWebsite={() => setCurrentView('guest')}
          onRequireSignIn={(mode) => handleRequireSignIn(mode)}
          onViewReceipt={(booking) => setActiveReceipt(booking)}
        />
      ) : (
        <>
          {/* Guest Facing Website */}
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentUser={currentUser}
            onOpenBooking={() => handleOpenBooking()}
            onRequireSignIn={(mode) => handleRequireSignIn(mode)}
            onOpenMyBookings={() => {
              if (!currentUser) {
                handleRequireSignIn('general');
              } else {
                setIsMyBookingsOpen(true);
              }
            }}
            onSignOut={handleSignOut}
          />

          <main>
            <Hero onOpenBooking={() => handleOpenBooking()} />
            <HotelInfo />
            <Accommodations onSelectRoomForBooking={(room) => handleOpenBooking(room)} />
            <DiningMenu currentUser={currentUser} />
            <ReviewsSection
              currentUser={currentUser}
              onOpenSignIn={() => handleRequireSignIn('general')}
              onOpenMyBookings={() => {
                if (!currentUser) {
                  handleRequireSignIn('general');
                } else {
                  setIsMyBookingsOpen(true);
                }
              }}
            />
            <ContactSection />
          </main>
        </>
      )}

      {/* 4-Step Reservation Wizard */}
      <ReservationModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preSelectedRoom={selectedRoomForBooking}
        currentUser={currentUser}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Official Receipt Modal */}
      <ReservationReceiptModal
        booking={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Guest My Bookings & Reviews Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        currentUser={currentUser}
        onViewReceipt={(booking) => setActiveReceipt(booking)}
      />

      {/* Google Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        mode={signInMode}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={handleUserSignedIn}
      />
    </div>
  );
}
