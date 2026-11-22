import React, { useState, useEffect } from 'react';
import { Menu, ShieldAlert, ArrowLeft, LogIn, Bell } from 'lucide-react';
import { ADMIN_EMAIL, isUserAdmin } from '../../services/firebase';
import { api } from '../../services/api';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminCalendar from './AdminCalendar';
import AdminBookings from './AdminBookings';
import AdminClients from './AdminClients';
import AdminRooms from './AdminRooms';
import AdminKeyManagement from './AdminKeyManagement';
import AdminDiscounts from './AdminDiscounts';
import AdminFoodOrders from './AdminFoodOrders';
import AdminExtras from './AdminExtras';

export default function AdminLayout({ currentUser, onBackToWebsite, onRequireSignIn, onViewReceipt }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);

  useEffect(() => {
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  async function loadPendingCount() {
    try {
      const stats = await api.getDashboardStats();
      if (stats && stats.pendingBookings !== undefined) {
        setPendingBookingsCount(stats.pendingBookings);
      }
    } catch (e) {
      console.warn('Failed to load pending bookings count:', e);
    }
  }

 
  if (!currentUser || !isUserAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-[#eaf0ec] flex items-center justify-center p-4">
        <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-stone-200">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">Access Denied</h2>
          <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed">
            The Admin Dashboard is strictly reserved for the authorized hotel administrator.
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-mono mb-6">
            Authorized Email: <strong>{ADMIN_EMAIL}</strong>
            {currentUser && (
              <div className="mt-1 text-stone-500 font-sans">
                You are currently signed in as: <strong>{currentUser.email}</strong>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBackToWebsite}
              className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-100"
            >
              Back to Website
            </button>
            <button
              onClick={() => onRequireSignIn('admin')}
              className="flex-1 py-2.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf0ec] flex">
   
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onBackToWebsite={onBackToWebsite}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        pendingBookingsCount={pendingBookingsCount}
      />

     
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
       
        <div className="lg:hidden bg-[#1f3f33] text-white p-4 flex items-center justify-between shadow">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-lg hover:bg-white/10 text-emerald-200 relative"
            >
              <Menu className="w-6 h-6" />
              {pendingBookingsCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#1f3f33]"></span>
              )}
            </button>
            <span className="font-serif font-bold text-base">Hytech Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {pendingBookingsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {pendingBookingsCount} pending
              </span>
            )}
            <button
              onClick={onBackToWebsite}
              className="text-xs text-amber-300 font-semibold underline"
            >
              Guest View
            </button>
          </div>
        </div>

        
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && <AdminDashboard onNavigateTab={setCurrentTab} />}
          {currentTab === 'calendar' && <AdminCalendar />}
          {currentTab === 'bookings' && <AdminBookings onViewReceipt={onViewReceipt} />}
          {currentTab === 'clients' && <AdminClients />}
          {currentTab === 'rooms' && <AdminRooms />}
          {currentTab === 'keys' && <AdminKeyManagement />}
          {currentTab === 'discounts' && <AdminDiscounts />}
          {currentTab === 'food-orders' && <AdminFoodOrders />}
          {currentTab === 'extras' && <AdminExtras />}
        </main>
      </div>
    </div>
  );
}
