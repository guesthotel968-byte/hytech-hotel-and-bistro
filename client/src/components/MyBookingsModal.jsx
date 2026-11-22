import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Star, Calendar, Utensils, CheckCircle, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function MyBookingsModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onViewReceipt 
}) {
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' or 'reviews'
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
      setBookings(res.bookings || []);
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="bg-[#fcfbf7] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200">
        
        {/* Header matching screenshot */}
        <div className="p-6 border-b border-stone-200 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-200 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold">
            Your Hotel Experience
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821] mt-0.5">
            My bookings
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Reservations and food orders for <span className="font-mono text-emerald-950 font-medium">{email}</span>
          </p>

          <button
            onClick={loadData}
            disabled={loading}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-300 text-xs font-medium hover:bg-stone-100 text-stone-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh bookings</span>
          </button>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-stone-200/70 rounded-2xl">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'reservations'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Reservations & orders
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#183429] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Stars & reviews
            </button>
          </div>
        </div>

        {/* Tab 1: Reservations & Orders */}
        {activeTab === 'reservations' && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
            <h3 className="font-serif text-lg font-bold text-stone-900">Room reservations</h3>
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
                No room reservations found under this email.
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#142821]">{b.reference_id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'Checked out' ? 'bg-blue-100 text-blue-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-stone-900">{b.room_name}</h4>
                      <p className="text-xs text-stone-500">
                        {b.check_in} → {b.check_out} • {b.nights} night{b.nights > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs font-semibold text-emerald-900 mt-1">
                        ₱{Number(b.total_amount).toLocaleString()} ({b.payment_method} • {b.payment_status})
                      </p>
                    </div>

                    <button
                      onClick={() => onViewReceipt(b)}
                      className="px-4 py-2 rounded-full border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Bistro Orders */}
            {orders.length > 0 && (
              <div className="pt-4 border-t border-stone-200">
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">Food & Bistro orders</h3>
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 bg-white rounded-2xl border border-stone-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-900">{o.order_id}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold">{o.status}</span>
                        </div>
                        <p className="text-stone-700 mt-1">
                          {o.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </p>
                        <p className="text-stone-400 text-[11px]">Deliver to: {o.deliver_to}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 text-sm">₱{o.total_amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stars & Reviews matching screenshot */}
        {activeTab === 'reviews' && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="text-center mb-2">
              <span className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold">
                Your Opinion Matters
              </span>
              <h3 className="font-serif text-xl font-bold text-[#142821] mt-0.5">
                Review your stay
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Choose 1–5 stars and leave a comment after checking out of a confirmed stay.
              </p>
            </div>

            {reviewSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center border border-emerald-200">
                {reviewSuccess}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
                No past reservations found to review.
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="p-5 bg-white rounded-2xl border border-stone-200 text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-stone-800">{b.reference_id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <h4 className="font-serif font-bold text-base text-stone-900">{b.room_name}</h4>
                    <p className="text-stone-500 text-[11px]">{b.check_in} to {b.check_out}</p>
                  </div>

                  {b.status === 'Pending' ? (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center text-stone-500 space-y-2">
                      <div className="flex justify-center text-stone-300 gap-1">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5" />)}
                      </div>
                      <p className="text-[11px] italic">
                        The hotel must confirm this booking before it can be reviewed.
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-stone-100 space-y-3">
                      <div className="flex justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setSelectedBookingForReview(b.id);
                              setReviewRating(star);
                            }}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewRating && selectedBookingForReview === b.id
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        value={selectedBookingForReview === b.id ? reviewComment : ''}
                        onChange={(e) => {
                          setSelectedBookingForReview(b.id);
                          setReviewComment(e.target.value);
                        }}
                        placeholder="Write your review here (e.g. Clean room, delicious breakfast!)..."
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                      />

                      <button
                        onClick={() => handleSubmitReview(b)}
                        disabled={reviewSubmitting}
                        className="w-full py-2 rounded-full bg-[#183429] hover:bg-[#12281f] text-white text-xs font-semibold shadow"
                      >
                        {reviewSubmitting ? 'Posting Review...' : 'Submit Review'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div className="p-4 border-t border-stone-200 bg-stone-50 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
