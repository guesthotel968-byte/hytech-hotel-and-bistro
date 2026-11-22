import React, { useState } from 'react';
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

export default function App() {
  // Views: 'guest' or 'admin'
  const [currentView, setCurrentView] = useState('guest');

  // Currently logged in user (default logged in as the sample guest from reference)
  const [currentUser, setCurrentUser] = useState({
    name: 'Carl Faa',
    email: 'guesthotel968@gmail.com',
    phone: '09141278921'
  });

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  function handleOpenBooking(room = null) {
    setSelectedRoomForBooking(room);
    setIsBookingOpen(true);
  }

  function handleBookingSuccess(createdBooking) {
    setActiveReceipt(createdBooking);
  }

  function handleSignOut() {
    setCurrentUser(null);
  }

  return (
    <div className="min-h-screen bg-[#eaf0ec] font-sans antialiased text-[#1c2c26]">
      {currentView === 'admin' ? (
        <AdminLayout
          onBackToWebsite={() => setCurrentView('guest')}
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
            onOpenSignIn={() => setIsSignInOpen(true)}
            onOpenMyBookings={() => setIsMyBookingsOpen(true)}
            onSignOut={handleSignOut}
          />

          <main>
            <Hero onOpenBooking={() => handleOpenBooking()} />
            <HotelInfo />
            <Accommodations onSelectRoomForBooking={(room) => handleOpenBooking(room)} />
            <DiningMenu currentUser={currentUser} />
            <ReviewsSection
              currentUser={currentUser}
              onOpenSignIn={() => setIsSignInOpen(true)}
              onOpenMyBookings={() => setIsMyBookingsOpen(true)}
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

      {/* Sign In / Register Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={(userData) => setCurrentUser(userData)}
        onOpenAdmin={() => setCurrentView('admin')}
      />
    </div>
  );
}
