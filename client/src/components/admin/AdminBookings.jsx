import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, CheckCircle, XCircle, LogIn, LogOut, Edit, Eye, X, Printer, Calendar, Users, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminBookings({ onViewReceipt }) {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Add new booking modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('2026-11-20');
  const [newCheckOut, setNewCheckOut] = useState('2026-11-21');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Cash');
  const [newPaymentStatus, setNewPaymentStatus] = useState('Paid');
  const [newRoomNumber, setNewRoomNumber] = useState('Room 103');

  // Print Report Modal State (Requirement 4)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printPeriod, setPrintPeriod] = useState('month'); // 'today', 'month', 'all'
  const [printSelectedRoom, setPrintSelectedRoom] = useState('All');

  const filterTabs = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Checked out'];

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    api.getRooms().then(setRooms).catch(console.error);
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const data = await api.getBookings({
        status: statusFilter,
        search: searchQuery
      });
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  // Filter bookings for report
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const reportBookings = safeBookings.filter(b => {
    // Room filter
    if (printSelectedRoom !== 'All' && b.room_name !== printSelectedRoom) {
      return false;
    }
    // Period filter
    if (printPeriod === 'today') {
      return b.check_in === todayStr || (b.check_in <= todayStr && todayStr <= b.check_out);
    }
    if (printPeriod === 'month') {
      return b.check_in >= thirtyDaysAgo;
    }
    return true;
  });

  const reportTotalRevenue = reportBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const reportTotalGuests = reportBookings.reduce((sum, b) => sum + Number(b.guest_count || 1), 0);

  async function handleUpdateStatus(bookingId, newStatus, assignedRoomNumber) {
    try {
      await api.updateBooking(bookingId, {
        status: newStatus,
        room_number: assignedRoomNumber || undefined,
        payment_status: newStatus === 'Confirmed' ? 'Paid' : undefined
      });
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking: ' + err.message);
    }
  }

  async function handleCreateDirectBooking(e) {
    e.preventDefault();
    const selRoom = rooms.find(r => r.id === Number(newRoomId)) || rooms[0];
    if (!selRoom) return;

    try {
      await api.createBooking({
        guest_name: newGuestName,
        email: newGuestEmail,
        phone: newGuestPhone,
        room_id: selRoom.id,
        room_name: selRoom.name,
        room_number: newRoomNumber,
        guest_count: 1,
        check_in: newCheckIn,
        check_out: newCheckOut,
        nights: 1,
        room_charges: selRoom.price,
        discount_code: null,
        discount_amount: 0,
        extras: [],
        extras_amount: 0,
        total_amount: selRoom.price,
        payment_method: newPaymentMethod,
        payment_reference: 'FRONT-DESK-MANUAL',
        special_requests: 'Direct front desk booking'
      });
      setIsAddModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert('Failed to add booking: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title Pill */}
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#142821]">Bookings & Reservations</h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Manage guest check-ins, confirm pending bookings, and print occupancy reports.
          </p>
        </div>

        {/* Print Report Trigger Button (Requirement 4) */}
        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-white text-[#183429] hover:bg-stone-50 border border-stone-300 font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4 text-emerald-800" />
          <span>Print Booking Report</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Search bar & Add Booking button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guest, companion, or booking ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-300 bg-stone-50/60 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Booking</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs matching screenshot */}
        <div className="inline-flex rounded-full bg-[#183429] p-1 text-white text-xs font-semibold overflow-x-auto max-w-full">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#183429] shadow-sm'
                    : 'text-emerald-100/80 hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Bookings Table matching screenshot */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-[#24483b] text-white text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Guest Details</th>
                <th className="py-3.5 px-4">Room</th>
                <th className="py-3.5 px-4">Room No.</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">No bookings found for the selected criteria.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-4 font-mono font-bold text-stone-800">
                      {b.reference_id}
                    </td>

                    {/* Guest details */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-stone-900 text-xs">{b.guest_name}</div>
                      <div className="text-stone-500 text-[11px] font-mono">{b.email}</div>
                      <div className="text-stone-500 text-[11px]">{b.phone}</div>
                    </td>

                    {/* Room */}
                    <td className="py-4 px-4 font-medium text-stone-800">
                      {b.room_name}
                    </td>

                    {/* Room No. */}
                    <td className="py-4 px-4 font-semibold text-emerald-950">
                      {b.room_number || 'Room 101'}
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-4 text-stone-600 whitespace-nowrap">
                      <div>{b.check_in}</div>
                      <div className="text-[10px] text-stone-400">to</div>
                      <div>{b.check_out}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-bold text-[#b83824] text-sm">
                      ₱{b.total_amount}
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-stone-800">{b.payment_method}</div>
                      {b.payment_reference && (
                        <div className="text-[10px] text-stone-500 font-mono truncate max-w-[100px]">
                          Ref: {b.payment_reference}
                        </div>
                      )}
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.payment_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Confirmed', 'Room 101')}
                            className="px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold"
                            title="Confirm reservation"
                          >
                            Confirm
                          </button>
                        )}

                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Checked in')}
                            className="px-2.5 py-1 rounded-full bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold"
                            title="Check-in guest"
                          >
                            Check In
                          </button>
                        )}

                        {b.status === 'Checked in' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Checked out')}
                            className="px-2.5 py-1 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-semibold"
                            title="Check-out guest"
                          >
                            Check Out
                          </button>
                        )}

                        {b.status !== 'Cancelled' && b.status !== 'Checked out' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                            className="px-2 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-[11px]"
                            title="Cancel booking"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => onViewReceipt(b)}
                          className="p-1 rounded-full hover:bg-stone-100 text-stone-600"
                          title="View Official Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Direct Booking Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-[#183429] text-white">
              <h3 className="font-serif text-lg font-bold">Add Front Desk Booking</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-stone-300" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectBooking} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    placeholder="guest@mail.com"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Room Type</label>
                  <select
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (₱{r.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Assigned Room #</label>
                  <input
                    type="text"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="e.g. Room 101"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    required
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    required
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Payment Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#183429] text-white font-semibold"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Report Modal (Requirement 4) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Controls Bar (Hidden during printing) */}
            <div className="p-5 bg-[#183429] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 print:hidden">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold block">
                  Official Hotel Reporting
                </span>
                <h3 className="font-serif text-xl font-bold">Print Room Bookings Report</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#e2a63b] hover:bg-[#d4972f] text-[#142821] font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-stone-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar inside Modal (Hidden during printing) */}
            <div className="p-4 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-stone-700">Timeframe:</span>
                  <select
                    value={printPeriod}
                    onChange={(e) => setPrintPeriod(e.target.value)}
                    className="p-1.5 rounded-lg border border-stone-300 bg-white font-medium"
                  >
                    <option value="today">Today's Bookings</option>
                    <option value="month">This Month (Past 30 Days)</option>
                    <option value="all">All-Time Records</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-stone-700">Filter by Room:</span>
                  <select
                    value={printSelectedRoom}
                    onChange={(e) => setPrintSelectedRoom(e.target.value)}
                    className="p-1.5 rounded-lg border border-stone-300 bg-white font-medium"
                  >
                    <option value="All">All Room Types</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <span className="text-stone-500 font-medium">
                Found {reportBookings.length} matching reservations
              </span>
            </div>

            {/* Printable Content Area */}
            <div id="printable-report" className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-stone-800">
              
              {/* Report Header */}
              <div className="border-b-2 border-stone-800 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821] tracking-tight">
                    HYTECH HOTEL & BISTRO
                  </h1>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Bongabong View, Bongabong, Oriental Mindoro • Tel: 0931-950-5863
                  </p>
                  <p className="text-xs font-semibold text-emerald-900 mt-1 uppercase tracking-wider">
                    Official Reservation & Occupancy Report
                  </p>
                </div>
                <div className="text-right text-xs text-stone-500 space-y-0.5">
                  <p>Generated: <strong className="text-stone-800">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</strong></p>
                  <p>Scope: <strong className="text-stone-800">{printPeriod === 'today' ? 'Today' : printPeriod === 'month' ? '1 Month (30 Days)' : 'All Time'}</strong></p>
                  <p>Room: <strong className="text-stone-800">{printSelectedRoom}</strong></p>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">
                    Total Bookings
                  </span>
                  <span className="font-serif text-2xl font-bold text-stone-900">
                    {reportBookings.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">
                    Total Guests Accommodated
                  </span>
                  <span className="font-serif text-2xl font-bold text-emerald-950">
                    {reportTotalGuests}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">
                    Total Charges / Revenue
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#b5852a]">
                    ₱{reportTotalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#183429] text-white text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Guest & Kasama</th>
                      <th className="p-3">Room Type</th>
                      <th className="p-3">Room #</th>
                      <th className="p-3">Dates</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {reportBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-400">
                          No reservations found for this room / period.
                        </td>
                      </tr>
                    ) : (
                      reportBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-50">
                          <td className="p-3 font-mono font-bold text-stone-800 whitespace-nowrap">
                            {b.reference_id}
                          </td>
                          <td className="p-3">
                            <strong className="text-stone-900 block">{b.guest_name}</strong>
                            <span className="text-stone-500 text-[10px] block">{b.phone}</span>
                            {b.companions && b.companions.length > 0 && (
                              <span className="text-[10px] text-emerald-800 italic block">
                                Kasama: {b.companions.join(', ')}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-medium text-stone-800">
                            {b.room_name}
                          </td>
                          <td className="p-3 font-semibold text-emerald-950 whitespace-nowrap">
                            {b.room_number || 'TBD'}
                          </td>
                          <td className="p-3 text-stone-600 whitespace-nowrap text-[11px]">
                            {b.check_in} → {b.check_out} ({b.nights}n)
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-semibold text-stone-800">{b.payment_method}</span>
                            <span className="block text-[10px] text-stone-500">{b.payment_status}</span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              b.status === 'Checked in' ? 'bg-blue-100 text-blue-800' :
                              'bg-stone-100 text-stone-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                            ₱{Number(b.total_amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signoff footer */}
              <div className="pt-8 border-t border-stone-300 flex justify-between items-end text-xs text-stone-600">
                <div>
                  <p>Report certified by:</p>
                  <p className="font-serif font-bold text-stone-900 mt-4 border-t border-stone-400 pt-1 inline-block min-w-[180px]">
                    Hotel Administration
                  </p>
                </div>
                <div className="text-right text-[11px] text-stone-400">
                  Hytech Hotel & Bistro Management System
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
