import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, User, CreditCard, Sparkles, AlertCircle, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function ReservationModal({ 
  isOpen, 
  onClose, 
  preSelectedRoom, 
  currentUser,
  onBookingSuccess 
}) {
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [guestCount, setGuestCount] = useState(1);

  // Step 2 details
  const [fullName, setFullName] = useState(currentUser?.name || 'Carl Faa');
  const [email, setEmail] = useState(currentUser?.email || 'guesthotel968@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '09141278921');
  const [companions, setCompanions] = useState([]);
  
  // Set default dates to 2026-11-18 to 2026-11-19 as in screenshot or current
  const [checkIn, setCheckIn] = useState('2026-11-18');
  const [checkOut, setCheckOut] = useState('2026-11-19');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 3 extras
  const [availableExtras, setAvailableExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([1]); // default select Massage Relaxation

  // Step 4 payment & promo
  const [voucherCode, setVoucherCode] = useState('MINSU');
  const [voucherDiscount, setVoucherDiscount] = useState(990);
  const [appliedVoucher, setAppliedVoucher] = useState('MINSU');
  const [voucherMessage, setVoucherMessage] = useState('MINSU (99% off) applied!');
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [gcashRef, setGcashRef] = useState('224466880011');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preSelectedRoom) {
      setSelectedRoom(preSelectedRoom);
    }
  }, [preSelectedRoom]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setFullName(currentUser.name);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  async function loadInitialData() {
    try {
      const [roomsData, extrasData] = await Promise.all([
        api.getRooms(),
        api.getExtras()
      ]);
      setRooms(roomsData);
      setAvailableExtras(extrasData);
      if (!selectedRoom && roomsData.length > 0) {
        // Default to Solo Room or first room
        const solo = roomsData.find(r => r.type === 'Solo') || roomsData[0];
        setSelectedRoom(solo);
      }
    } catch (err) {
      console.error('Error loading booking data:', err);
    }
  }

  if (!isOpen) return null;

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.max(0, checkOutDate - checkInDate);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) || 1;

  // Calculate costs
  const basePricePerNight = selectedRoom ? selectedRoom.price : 0;
  const roomCharges = basePricePerNight * roomQuantity * nights;

  // Calculate extras
  let extrasTotal = 0;
  const activeExtrasObjects = availableExtras.filter(e => selectedExtras.includes(e.id));
  activeExtrasObjects.forEach(e => {
    if (e.billing_unit.includes('person')) {
      extrasTotal += e.price * guestCount * roomQuantity;
    } else if (e.billing_unit.includes('night')) {
      extrasTotal += e.price * nights * roomQuantity;
    } else {
      extrasTotal += e.price * roomQuantity;
    }
  });

  const totalBeforeDiscount = roomCharges + extrasTotal;
  const finalTotal = Math.max(0, roomCharges - voucherDiscount) + extrasTotal;

  async function handleApplyVoucher() {
    if (!voucherCode.trim()) return;
    try {
      const res = await api.validateVoucher(voucherCode.trim(), roomCharges);
      if (res.valid) {
        setVoucherDiscount(res.discount_amount);
        setAppliedVoucher(res.code);
        setVoucherMessage(res.message);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Voucher error: ' + err.message);
    }
  }

  async function handleConfirmBooking() {
    if (paymentMethod === 'GCash' && !gcashRef.trim()) {
      alert('Please enter your GCash reference number to complete reservation.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        guest_name: fullName,
        email: email,
        phone: phone,
        room_id: selectedRoom.id,
        room_name: selectedRoom.name,
        guest_count: guestCount,
        companions: companions.filter(c => c && c.trim()),
        check_in: checkIn,
        check_out: checkOut,
        nights: nights,
        room_charges: roomCharges,
        discount_code: appliedVoucher || null,
        discount_amount: voucherDiscount,
        extras: activeExtrasObjects.map(e => ({ name: e.name, price: e.price, unit: e.billing_unit })),
        extras_amount: extrasTotal,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        payment_reference: paymentMethod === 'GCash' ? gcashRef : null,
        special_requests: specialRequests || 'None'
      };

      const newBooking = await api.createBooking(payload);
      
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onBookingSuccess(newBooking);
      onClose();
    } catch (err) {
      alert('Failed to create reservation: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#fcfbf7] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200">
        
        
        <div className="p-6 border-b border-stone-200/80 relative text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821]">
            Reserve your stay
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Select your rooms, add your details, and confirm your stay.
          </p>

          
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6">
            {[
              { num: 1, label: 'Rooms' },
              { num: 2, label: 'Your stay' },
              { num: 3, label: 'Extras' },
              { num: 4, label: 'Payment' }
            ].map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCurrent
                        ? 'bg-[#183429] text-white ring-2 ring-emerald-800'
                        : isDone
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium ${isCurrent ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">Choose your rooms</h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-200 text-stone-700 font-medium">
                1 selected
              </span>
            </div>
            <p className="text-stone-500 text-xs">
              Mix room types or book several of the same type. All rooms share the dates below.
            </p>

            <div className="space-y-3 pt-2">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-50/50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => setSelectedRoom(room)}
                        className="w-4 h-4 rounded text-emerald-800 accent-[#183429]"
                      />
                      <img
                        src={room.image_url}
                        alt={room.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif font-bold text-sm text-stone-900">{room.name}</h4>
                          <span className="text-xs font-bold text-emerald-900">₱{room.price} / night</span>
                        </div>
                        <p className="text-[11px] text-stone-500">Up to {room.capacity} guests • {room.bed_type}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-emerald-900/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-600">Rooms:</span>
                          <select
                            value={roomQuantity}
                            onChange={(e) => setRoomQuantity(Number(e.target.value))}
                            className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs"
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-stone-600">Guests per room:</span>
                          <select
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs"
                          >
                            {Array.from({ length: room.capacity || 2 }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        
        {step === 2 && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Carl Faa"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. guesthotel968@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Contact number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 09141278921"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Check-in</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Check-out</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Companion / Kasama fields if guestCount > 1 */}
            {guestCount > 1 && (
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-900/10 space-y-2">
                <label className="block text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Kasama / Companion Names ({guestCount - 1} companion{guestCount > 2 ? 's' : ''})</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Please provide the full name of each companion for hotel guest registration and directory.
                </p>
                <div className="space-y-2 pt-1">
                  {Array.from({ length: Math.max(0, guestCount - 1) }).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required
                      placeholder={`Companion #${idx + 1} Full Name`}
                      value={companions[idx] || ''}
                      onChange={(e) => {
                        const updated = [...companions];
                        updated[idx] = e.target.value;
                        setCompanions(updated);
                      }}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Special Requests (Optional)</label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Quiet room facing garden, late check-in at 8 PM"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
              />
            </div>
          </div>
        )}

       
        {step === 3 && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Make your stay your own</h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Optional services apply to every selected room. Per-person services cover each guest once per stay.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {availableExtras.map((extra) => {
                const isSelected = selectedExtras.includes(extra.id);
                return (
                  <div
                    key={extra.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedExtras(selectedExtras.filter(id => id !== extra.id));
                      } else {
                        setSelectedExtras([...selectedExtras, extra.id]);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-50/60 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 mt-1 rounded text-emerald-800 accent-[#183429]"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-serif font-bold text-sm text-stone-900">{extra.name}</h4>
                          <span className="text-xs font-bold text-emerald-900">
                            ₱{extra.price} {extra.billing_unit}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {extra.description}
                        </p>

                        {isSelected && (
                          <div className="mt-2 text-xs font-semibold text-emerald-800 flex justify-between">
                            <span>Added to your stay</span>
                            <span>₱{extra.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-200">
              Per stay: once per room. Per night: each room, each night. Per item: chosen quantity per room. Room discounts do not reduce extra-service charges.
            </p>
          </div>
        )}

      
        {step === 4 && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Room charges</span>
                <span>₱{roomCharges.toLocaleString()}</span>
              </div>

              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Room discount ({appliedVoucher})</span>
                  <span>-₱{voucherDiscount.toLocaleString()}</span>
                </div>
              )}

              {extrasTotal > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Optional extras</span>
                  <span>₱{extrasTotal.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-300 flex justify-between font-bold text-stone-900 text-base">
                <span>Total for all rooms</span>
                <span className="text-[#183429]">₱{finalTotal.toLocaleString()}</span>
              </div>
            </div>

           
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Promo Code (e.g. MINSU, SUMMER0123)"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white uppercase font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="px-4 py-2 bg-[#183429] text-white rounded-xl text-xs font-semibold hover:bg-[#12281f]"
              >
                Apply
              </button>
            </div>
            {voucherMessage && (
              <p className="text-[11px] text-emerald-800 -mt-3 font-medium">{voucherMessage}</p>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-2">Payment method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('GCash')}
                  className={`py-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    paymentMethod === 'GCash'
                      ? 'bg-[#183429] text-white border-emerald-900 shadow'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  GCash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`py-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    paymentMethod === 'Cash'
                      ? 'bg-[#183429] text-white border-emerald-900 shadow'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  Cash
                </button>
              </div>
            </div>

            
            {paymentMethod === 'GCash' && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-stone-800 space-y-3">
                <p className="leading-relaxed">
                  Send <strong className="text-emerald-900 font-bold">₱{finalTotal.toLocaleString()}</strong> to GCash number <strong className="text-emerald-900">0923-456-7890</strong> (Hytech Hotel and Bistro), then enter the reference number from your GCash receipt.
                </p>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">GCash reference number</label>
                  <input
                    type="text"
                    required
                    value={gcashRef}
                    onChange={(e) => setGcashRef(e.target.value)}
                    placeholder="e.g. 224466880011"
                    className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white font-mono text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

       
        <div className="p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500">
              {roomQuantity} room / {nights} night{nights > 1 ? 's' : ''}
            </div>
            <div className="text-lg font-bold text-[#183429]">
              ₱{finalTotal.toLocaleString()}
            </div>
            {voucherDiscount > 0 && (
              <div className="text-[10px] text-emerald-700 font-medium">
                Includes ₱{voucherDiscount} discount
              </div>
            )}
          </div>

          <div className="flex gap-2.5">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-100"
              >
                Back
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full bg-[#e2a63b] hover:bg-[#d4962c] text-[#142821] text-xs sm:text-sm font-bold shadow transition-colors"
              >
                Guest details
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => {
                  if (!fullName || !email || !phone) {
                    alert('Please fill out your name, email, and phone.');
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-2.5 rounded-full bg-[#e2a63b] hover:bg-[#d4962c] text-[#142821] text-xs sm:text-sm font-bold shadow transition-colors"
              >
                Choose extras
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-full bg-[#e2a63b] hover:bg-[#d4962c] text-[#142821] text-xs sm:text-sm font-bold shadow transition-colors"
              >
                Continue to payment
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 rounded-full bg-[#e2a63b] hover:bg-[#d4962c] text-[#142821] text-xs sm:text-sm font-bold shadow transition-colors"
              >
                {submitting ? 'Confirming...' : `Reserve ${roomQuantity} room`}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
