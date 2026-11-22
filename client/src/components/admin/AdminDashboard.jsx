import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Bed, 
  KeyRound, 
  UtensilsCrossed, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard({ onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return <div className="p-8 text-center text-stone-500 text-sm">Loading dashboard overview...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-[#dce7de] p-4 rounded-2xl flex items-center justify-between border border-emerald-900/10">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">Hytech Hotel & Bistro</span>
          <h2 className="font-serif text-2xl font-bold text-[#142821]">Operational Dashboard</h2>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-[#183429] text-white rounded-xl text-xs font-semibold hover:bg-[#12281f]"
        >
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div 
          onClick={() => onNavigateTab('bookings')}
          className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-bold text-[#142821]">{stats.totalBookings}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{stats.pendingBookings} pending confirmation</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Confirmed Bookings</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-bold text-emerald-900">{stats.confirmedBookings}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Active / Confirmed guest stays
          </div>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Collected Revenue</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-[#142821]">₱{Number(stats.totalRevenue).toLocaleString()}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            From verified paid reservations
          </div>
        </div>

        {/* Key Status */}
        <div 
          onClick={() => onNavigateTab('keys')}
          className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Access Keys</span>
            <KeyRound className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-bold text-[#142821]">{stats.keys.total}</div>
          <div className="text-[11px] text-stone-500 mt-1 flex gap-2">
            <span className="text-emerald-700">{stats.keys.available} available</span>
            <span>•</span>
            <span className="text-amber-700">{stats.keys.assigned} assigned</span>
          </div>
        </div>
      </div>

      {/* Bistro Food Orders Alert Bar */}
      <div 
        onClick={() => onNavigateTab('food-orders')}
        className="p-4 rounded-2xl bg-[#fbf5e5] border border-amber-300/80 flex items-center justify-between cursor-pointer hover:bg-[#faeed6] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-800 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-stone-900">
              Bistro & Kitchen Orders: {stats.food.totalOrders} Total ({stats.food.preparing} currently preparing)
            </h4>
            <p className="text-[11px] text-stone-600">
              Live kitchen feed automatically updates as guests submit dining orders.
            </p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-full bg-white text-stone-800 text-xs font-semibold shadow-sm border border-stone-200">
          Open Orders →
        </button>
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg font-bold text-[#142821]">Recent Reservations</h3>
          <button 
            onClick={() => onNavigateTab('bookings')}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline"
          >
            View all bookings
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 pb-2">
                <th className="py-2.5 font-semibold">Reference</th>
                <th className="py-2.5 font-semibold">Guest</th>
                <th className="py-2.5 font-semibold">Room</th>
                <th className="py-2.5 font-semibold">Dates</th>
                <th className="py-2.5 font-semibold">Amount</th>
                <th className="py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stats.recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50">
                  <td className="py-3 font-mono font-bold text-stone-800">{b.reference_id}</td>
                  <td className="py-3">
                    <div className="font-medium text-stone-900">{b.guest_name}</div>
                    <div className="text-[11px] text-stone-400">{b.phone}</div>
                  </td>
                  <td className="py-3 font-medium text-stone-800">{b.room_name}</td>
                  <td className="py-3 text-stone-600">{b.check_in} → {b.check_out}</td>
                  <td className="py-3 font-bold text-emerald-950">₱{Number(b.total_amount).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
