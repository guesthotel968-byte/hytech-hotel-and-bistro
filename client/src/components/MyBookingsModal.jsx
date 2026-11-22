import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Star, Calendar, Utensils, CheckCircle, FileText, PlusCircle, Sparkles, Bed, ShoppingBag, Coffee } from 'lucide-react';
import { api } from '../services/api';

export default function MyBookingsModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onViewReceipt,
  onOpenBooking,
  onOpenDining
}) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'reviews'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'rooms', 'food', 'extras'
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const email = currentUser?.email || 'guesthotel968@gmail.com';

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, email]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.getMyBookings(email);
      let loadedBookings = res.bookings || [];
      // Seamlessly merge with local storage cache
      try {
        const stored = JSON.parse(localStorage.getItem('hytech_my_bookings') || '[]');
        const existingRefs = new Set(loadedBookings.map(b => b.reference_id));
        const missing = stored.filter(b => b && b.reference_id && !existingRefs.has(b.reference_id) && b.email?.toLowerCase() === email.toLowerCase());
        if (missing.length > 0) {
          loadedBookings = [...missing, ...loadedBookings];
        }
      } catch (e) {}
      setBookings(loadedBookings);
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
      try {
        const stored = JSON.parse(localStorage.getItem('hytech_my_bookings') || '[]');
        const matching = stored.filter(b => b && b.email?.toLowerCase() === email.toLowerCase());
        setBookings(matching);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  }

  // Extract all extras booked across all reservations
  const allBookedExtras = [];
  bookings.forEach(b => {
    const list = Array.isArray(b.extras) ? b.extras : [];
    list.forEach(ex => {
      allBookedExtras.push({
        ...ex,
        booking_reference: b.reference_id,
        booking_status: b.status,
        room_name: b.room_name,
        check_in: b.check_in,
        check_out: b.check_out
      });
    });
  });

  async function handleSubmitReview(b) {
    if (!reviewComment.trim()) {
      alert('Please write a brief comment about your experience.');
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.createReview({
        booking_reference: b.reference_id,
        guest_name: b.guest_name,
        room_name: b.room_name,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess(`Thank you ${b.guest_name}! Your review has been published.`);
      setReviewComment('');
      setSelectedBookingForReview(null);
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#fcfbf7] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200 text-center relative shrink-0 bg-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] uppercase tracking-widest text-emerald-800 font-semibold block mb-0.5">
            Hytech Hotel & Bistro
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821]">
            Booking History & Orders
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Registered for <span className="font-mono text-emerald-950 font-semibold">{email}</span>
          </p>

          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-300 text-xs font-medium hover:bg-stone-100 text-stone-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh data</span>
            </button>
          </div>

          {/* Quick Action Buttons to add more */}
          <div className="mt-4 p-3 bg-emerald-900/5 rounded-2xl border border-emerald-900/10 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Need to add more to your stay?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenBooking) onOpenBooking();
                }}
                className="px-3 py-1.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Bed className="w-3.5 h-3.5" />
                <span>+ Book Room</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenDining) onOpenDining();
                  else {
                    const el = document.getElementById('food-and-drink');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-[#e2a63b] hover:bg-[#d4972f] text-[#142821] text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>+ Order Food</span>
              </button>
            </div>
          </div>

          {/* Top Level Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-stone-200/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Reservations & Orders
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#183429] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Stars & Reviews
            </button>
          </div>
        </div>

        {/* Tab 1: Reservations & Orders */}
        {activeTab === 'history' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            {/* Category Filter Pills (Requirement 1) */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-200">
              <span className="text-xs font-semibold text-stone-500 mr-1">Filter by:</span>
              {[
                { id: 'all', label: 'All Items', count: bookings.length + orders.length },
                { id: 'rooms', label: 'Room Reservations', count: bookings.length },
                { id: 'food', label: 'Food Orders', count: orders.length },
                { id: 'extras', label: 'Extras / Add-ons', count: allBookedExtras.length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    categoryFilter === f.id
                      ? 'bg-[#183429] text-white shadow-sm'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* 1. ROOM RESERVATIONS */}
            {(categoryFilter === 'all' || categoryFilter === 'rooms') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Bed className="w-4 h-4 text-emerald-800" />
                    <span>Room Reservations</span>
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenBooking) onOpenBooking();
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Book another
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
                    No room reservations under this email yet.
                  </div>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-[#142821]">{b.reference_id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              b.status === 'Checked in' ? 'bg-blue-100 text-blue-800' :
                              b.status === 'Checked out' ? 'bg-purple-100 text-purple-800' :
                              'bg-stone-100 text-stone-700'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-stone-900">{b.room_name}</h4>
                          <p className="text-xs text-stone-500">
                            {b.check_in} → {b.check_out} • {b.nights} night{b.nights > 1 ? 's' : ''} • {b.guest_count} guest{b.guest_count > 1 ? 's' : ''}
                          </p>
                          {b.companions && b.companions.length > 0 && (
                            <p className="text-[11px] text-stone-600 mt-1">
                              Companions: <span className="font-medium text-stone-800">{b.companions.join(', ')}</span>
                            </p>
                          )}
                          <p className="text-xs font-semibold text-emerald-900 mt-1">
                            ₱{Number(b.total_amount).toLocaleString()} ({b.payment_method} • {b.payment_status})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onViewReceipt(b)}
                            className="px-4 py-2 rounded-full border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-stone-500" />
                            <span>View Receipt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. FOOD & BISTRO ORDERS */}
            {(categoryFilter === 'all' || categoryFilter === 'food') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-700" />
                    <span>Food & Bistro Orders</span>
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenDining) onOpenDining();
                      else {
                        const el = document.getElementById('food-and-drink');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Order more food
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
                    No food orders recorded yet.
                  </div>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="p-4 bg-white rounded-2xl border border-stone-200/90 text-xs flex justify-between items-center shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-900">{o.order_id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'Served' || o.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'Preparing' ? 'bg-amber-100 text-amber-800' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <p className="text-stone-800 font-medium mt-1">
                          {o.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </p>
                        <p className="text-stone-500 text-[11px] mt-0.5">
                          Deliver to: <span className="font-semibold text-stone-700">{o.deliver_to}</span>
                          {o.special_request && ` • Note: ${o.special_request}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 text-sm">₱{Number(o.total_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. EXTRAS & ADD-ONS */}
            {(categoryFilter === 'all' || categoryFilter === 'extras') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Extras & Service Add-ons</span>
                  </h3>
                </div>

                {allBookedExtras.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
                    No extra services (massage, port shuttle, extra bed) added to your reservations yet.
                  </div>
                ) : (
                  allBookedExtras.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-stone-200/90 text-xs flex justify-between items-center shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 text-sm">{ex.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                            Included in Stay
                          </span>
                        </div>
                        <p className="text-stone-500 text-[11px] mt-1">
                          Reservation: <span className="font-mono font-medium text-stone-800">{ex.booking_reference}</span> ({ex.room_name})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-950 text-sm">₱{Number(ex.price).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Stars & Reviews */}
        {activeTab === 'reviews' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {reviewSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
              <h4 className="font-serif font-bold text-base text-stone-900">
                Share your experience at Hytech Hotel & Bistro
              </h4>
              <p className="text-stone-600">
                Choose a completed reservation to submit a verified guest review.
              </p>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Select Reservation</label>
                <select
                  value={selectedBookingForReview?.id || ''}
                  onChange={(e) => {
                    const sel = bookings.find(b => b.id === Number(e.target.value));
                    setSelectedBookingForReview(sel || null);
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900"
                >
                  <option value="">-- Choose your reservation --</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.reference_id} - {b.room_name} ({b.check_in})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBookingForReview && (
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1.5">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Your Feedback</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell us what you enjoyed about the room, bistro food, and hotel staff..."
                      className="w-full p-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
                    />
                  </div>

                  <button
                    onClick={() => handleSubmitReview(selectedBookingForReview)}
                    disabled={reviewSubmitting}
                    className="w-full py-2.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting Review...' : 'Post Verified Review'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
