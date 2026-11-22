import React, { useState, useEffect } from 'react';
import { Users, Bed, ArrowUpRight, CheckCircle2, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { api } from '../services/api';

export default function Accommodations({ onSelectRoomForBooking }) {
  const [rooms, setRooms] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeModalRoom, setActiveModalRoom] = useState(null);

  // Calendar in modal state (Requirement 3)
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calData, setCalData] = useState(null);
  const [calLoading, setCalLoading] = useState(false);

  const filterOptions = ['All', 'Solo', 'Standard', 'Deluxe', 'Family', 'Group', 'Suite'];

  useEffect(() => {
    fetchRooms();
  }, [selectedFilter]);

  useEffect(() => {
    if (activeModalRoom) {
      loadRoomCalendar(activeModalRoom, calYear, calMonth);
    }
  }, [activeModalRoom, calYear, calMonth]);

  async function fetchRooms() {
    setLoading(true);
    try {
      const data = await api.getRooms(selectedFilter === 'All' ? null : selectedFilter);
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRoomCalendar(room, year, month) {
    setCalLoading(true);
    try {
      // Passes room id & name so server only counts admin-approved bookings for THIS room
      const res = await api.getCalendar(year, month, room.id, room.name);
      setCalData(res);
    } catch (e) {
      console.error('Failed to load room calendar:', e);
    } finally {
      setCalLoading(false);
    }
  }

  function handlePrevMonth() {
    if (calMonth === 1) {
      setCalYear(y => y - 1);
      setCalMonth(12);
    } else {
      setCalMonth(m => m - 1);
    }
  }

  function handleNextMonth() {
    if (calMonth === 12) {
      setCalYear(y => y + 1);
      setCalMonth(1);
    } else {
      setCalMonth(m => m + 1);
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <section id="our-rooms" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a382e] mb-3">
          Our Accommodations
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          11 room types for solo travelers, couples, families, and groups in Bongabong, Oriental Mindoro.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {filterOptions.map((opt) => {
            const isActive = selectedFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#183429] text-white shadow-sm'
                    : 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500 text-sm">Loading available rooms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-[#fcfbf7] rounded-3xl overflow-hidden border border-emerald-950/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 w-full overflow-hidden bg-stone-200">
                <img
                  src={room.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                  alt={room.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#1d3a30]/80 backdrop-blur-md text-emerald-100 border border-emerald-500/30">
                  {room.type}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#142821] mb-1">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Up to {room.capacity} guest{room.capacity > 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" />
                      {room.bed_type}
                    </span>
                  </div>

                  <div className="text-xl font-bold text-[#1d3d31] mb-3">
                    ₱{Number(room.price).toLocaleString()} <span className="text-xs font-normal text-stone-500">/ night</span>
                  </div>

                  <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCalYear(new Date().getFullYear());
                      setCalMonth(new Date().getMonth() + 1);
                      setActiveModalRoom(room);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                  >
                    View room details & calendar <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onSelectRoomForBooking(room)}
                    className="px-5 py-2 rounded-full bg-[#e2a63b] hover:bg-[#d2962a] text-[#142821] text-xs font-semibold shadow-sm transition-colors"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Details & Approved Calendar Modal (Requirement 3) */}
      {activeModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header Image */}
            <div className="relative h-52 sm:h-60 w-full shrink-0">
              <img
                src={activeModalRoom.image_url}
                alt={activeModalRoom.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalRoom(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-[#1d3a30] text-emerald-100">
                {activeModalRoom.type}
              </span>
            </div>

            {/* Scrollable details */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#142821]">{activeModalRoom.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
                    <span>Capacity: Up to {activeModalRoom.capacity} guests</span>
                    <span>•</span>
                    <span>Bed: {activeModalRoom.bed_type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#1d3d31]">
                    ₱{Number(activeModalRoom.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-500 font-normal block">/ night</span>
                </div>
              </div>

              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                {activeModalRoom.description}
              </p>

              {/* Amenities */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2">Included Amenities</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-700">
                  {activeModalRoom.amenities ? (
                    activeModalRoom.amenities.split(',').map((am, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{am.trim()}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Free Wi-Fi</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Hot & Cold Shower</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Linens & Towels</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Front Desk Support</div>
                    </>
                  )}
                </div>
              </div>

              {/* Live Room Calendar (Requirement 3: ONLY Admin-Approved Reservations appear on calendar) */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-800" />
                    <h4 className="font-serif font-bold text-sm text-stone-900">
                      Room Availability Calendar
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-stone-800 min-w-[110px] text-center">
                      {monthNames[calMonth - 1]} {calYear}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notice explaining Requirement 3 */}
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-[11px] text-emerald-900 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Admin-Approval Policy:</strong> Dates are only marked as reserved once confirmed & approved by the hotel administration. Pending requests do not block the room calendar.
                  </span>
                </div>

                {/* Calendar Grid */}
                {calLoading ? (
                  <div className="py-6 text-center text-xs text-stone-400">Loading availability...</div>
                ) : (
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 mb-1">
                      <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {/* Leading empty days */}
                      {Array.from({ length: calData?.firstDayOfWeek || 0 }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-9" />
                      ))}

                      {/* Month Days */}
                      {calData && Object.keys(calData.days || {}).map((dayNum) => {
                        const dayObj = calData.days[dayNum];
                        const isReserved = dayObj.status === 'reserved';

                        return (
                          <div
                            key={dayNum}
                            className={`h-9 rounded-xl flex flex-col items-center justify-center font-medium transition-all ${
                              isReserved
                                ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                                : 'bg-emerald-50/50 text-emerald-950 hover:bg-emerald-100/70 border border-emerald-100'
                            }`}
                            title={isReserved ? `Reserved (${dayObj.count} approved guest stay)` : 'Available for booking'}
                          >
                            <span className="text-xs leading-none">{dayNum}</span>
                            <span className={`text-[8px] font-semibold tracking-tighter ${
                              isReserved ? 'text-rose-700' : 'text-emerald-700'
                            }`}>
                              {isReserved ? 'Booked' : 'Free'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setActiveModalRoom(null)}
                  className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const r = activeModalRoom;
                    setActiveModalRoom(null);
                    onSelectRoomForBooking(r);
                  }}
                  className="flex-1 py-2.5 rounded-full bg-[#e2a63b] hover:bg-[#d2962a] text-[#142821] text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                >
                  Reserve This Room
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
