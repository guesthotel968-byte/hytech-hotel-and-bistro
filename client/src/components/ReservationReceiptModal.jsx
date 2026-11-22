import React from 'react';
import { X, Printer, CheckCircle, Download } from 'lucide-react';

export default function ReservationReceiptModal({ booking, onClose }) {
  if (!booking) return null;

  function formatDate(dStr) {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dStr;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#fcfbf7] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200">
        
        {/* Top Banner Alert exactly matching screenshot */}
        <div className="bg-[#fcf5e5] border-b border-amber-200/80 px-6 py-3.5 text-center relative">
          <p className="text-xs sm:text-sm font-semibold text-[#8a5b17]">
            Reservation received. Waiting for the hotel to confirm it.
          </p>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full text-stone-500 hover:text-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Receipt Card with dashed outline */}
        <div className="p-6 sm:p-8">
          <div className="border-2 border-dashed border-stone-300 rounded-3xl p-6 sm:p-7 bg-white shadow-inner">
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#142821] uppercase">
                Hytech Hotel and Bistro
              </h3>
              <p className="text-xs text-stone-500 font-sans tracking-wide mt-0.5">
                Official Reservation Receipt
              </p>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-stone-800">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Booking Reference:</span>
                <span className="font-mono font-bold text-emerald-950">{booking.reference_id}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Guest Name:</span>
                <span className="font-medium">{booking.guest_name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Email:</span>
                <span className="font-mono text-xs">{booking.email}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Contact Phone:</span>
                <span>{booking.phone}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Selected Room:</span>
                <span className="font-serif font-bold text-[#142821]">{booking.room_name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Room Number:</span>
                <span className="italic text-stone-500">{booking.room_number || 'Assigned once confirmed'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Guests:</span>
                <span>{booking.guest_count}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Check-In Date:</span>
                <span>{formatDate(booking.check_in)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Check-Out Date:</span>
                <span>{formatDate(booking.check_out)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Duration:</span>
                <span>{booking.nights} night(s)</span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Payment Method:</span>
                <span className="font-semibold">{booking.payment_method}</span>
              </div>

              {booking.payment_reference && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="font-semibold text-stone-600">GCash Reference:</span>
                  <span className="font-mono">{booking.payment_reference}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Payment Status:</span>
                <span className={`font-semibold ${booking.payment_status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {booking.payment_status}
                </span>
              </div>

              {booking.discount_amount > 0 && (
                <div className="flex justify-between py-1 border-b border-stone-100 text-emerald-800 font-medium">
                  <span>Discount ({booking.discount_code || 'VOUCHER'}):</span>
                  <span>-₱{booking.discount_amount}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-semibold text-stone-600">Special Requests:</span>
                <span className="italic">{booking.special_requests || 'None'}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="font-semibold text-stone-600">Booking Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-stone-300 flex justify-between items-baseline font-bold text-base text-[#142821]">
                <span>Total Amount:</span>
                <span className="text-lg">₱{Number(booking.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-white font-semibold text-xs sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
