import React, { useState } from 'react';
import { Menu } from 'lucide-react';
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

export default function AdminLayout({ onBackToWebsite, onViewReceipt }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eaf0ec] flex">
      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onBackToWebsite={onBackToWebsite}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Top Header */}
        <div className="lg:hidden bg-[#1f3f33] text-white p-4 flex items-center justify-between shadow">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-lg hover:bg-white/10 text-emerald-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-serif font-bold text-base">Hytech Admin</span>
          </div>
          <button
            onClick={onBackToWebsite}
            className="text-xs text-amber-300 font-semibold underline"
          >
            Guest View
          </button>
        </div>

        {/* Content Body */}
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
