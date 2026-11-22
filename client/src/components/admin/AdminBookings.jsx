import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, CheckCircle, XCircle, LogIn, LogOut, Edit, Eye, X } from 'lucide-react';
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
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="bg-[#dce7de] p-4 rounded-2xl border border-emerald-900/10">
        <h2 className="font-serif text-2xl font-bold text-[#142821]">Bookings</h2>
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
              placeholder="Search guest or booking ID..."
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
    </div>
  );
}
