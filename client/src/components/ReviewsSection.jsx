import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ReviewsSection({ currentUser, onOpenSignIn, onOpenMyBookings }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const data = await api.getReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="reviews" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">Guest Experiences</span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#142821] font-bold mt-1 mb-3">
          Verified Guest Reviews
        </h2>
        <p className="text-stone-600 text-sm">
          Hear from travelers, vacationers, and business guests who experienced Hytech Hotel & Bistro.
        </p>

        {/* Action Button matching screenshot */}
        <div className="mt-6 flex flex-col items-center">
          {currentUser ? (
            <button
              onClick={onOpenMyBookings}
              className="px-6 py-2.5 rounded-full bg-[#1e3c31] hover:bg-[#162d25] text-white text-xs sm:text-sm font-semibold shadow transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>Review your stay in My Bookings</span>
            </button>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="px-6 py-2.5 rounded-full bg-[#1e3c31] hover:bg-[#162d25] text-white text-xs sm:text-sm font-semibold shadow transition-colors"
            >
              Sign in to review your stay
            </button>
          )}
          <p className="text-stone-500 text-xs mt-2 max-w-md">
            Reviews open after check-out for confirmed reservations. You can also find them in My Bookings → Stars & reviews.
          </p>
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="py-12 text-center text-stone-500 text-sm">Loading guest reviews...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-emerald-950/10 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {rev.created_at ? rev.created_at.split(' ')[0] : 'Recent'}
                  </span>
                </div>

                <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-stone-900">{rev.guest_name}</h4>
                  <p className="text-[11px] text-emerald-800">{rev.room_name}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
