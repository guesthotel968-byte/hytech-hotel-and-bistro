import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  Bed, 
  KeyRound, 
  Tag, 
  UtensilsCrossed, 
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';

export default function AdminSidebar({ 
  currentTab, 
  setCurrentTab, 
  onBackToWebsite,
  isMobileOpen,
  setIsMobileOpen,
  pendingBookingsCount = 0
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: FileText, badge: pendingBookingsCount },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'rooms', label: 'Rooms', icon: Bed },
    { id: 'keys', label: 'Key Management', icon: KeyRound },
    { id: 'discounts', label: 'Discounts', icon: Tag },
    { id: 'food-orders', label: 'Food Orders', icon: UtensilsCrossed },
    { id: 'extras', label: 'Extras', icon: Sparkles },
  ];

  return (
    <>
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 bottom-0 z-40
        w-64 bg-[#1f3f33] text-white flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-emerald-900/60 shadow-xl lg:shadow-none
      `}>
        <div>
          <div className="p-6 border-b border-emerald-800/60 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-white">
                Hytech Hotel &<br />Bistro
              </h1>
              <span className="text-[10px] tracking-widest uppercase text-emerald-300/80 font-sans block mt-1">
                Admin Panel
              </span>
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-emerald-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const hasBadge = item.badge && item.badge > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-[#e2ebe3] text-[#142921] font-bold shadow-sm' 
                      : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#142921]' : 'text-emerald-300'}`} />
                    <span>{item.label}</span>
                  </div>

                  {/* Red Notification Badge (Requirement 2) */}
                  {hasBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back to Guest Website Button */}
        <div className="p-4 border-t border-emerald-800/60">
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-emerald-100 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Guest Website</span>
          </button>
        </div>
      </aside>
    </>
  );
}
