import React, { useState, useEffect } from 'react';
import { Users, Bed, ArrowUpRight, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';

export default function Accommodations({ onSelectRoomForBooking }) {
  const [rooms, setRooms] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeModalRoom, setActiveModalRoom] = useState(null);

  const filterOptions = ['All', 'Solo', 'Standard', 'Deluxe', 'Family', 'Group', 'Suite'];

  useEffect(() => {
    fetchRooms();
  }, [selectedFilter]);

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

  return (
    <section id="our-rooms" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
     
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a382e] mb-3">
          Our Accommodations
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          11 room types for solo travelers, couples, families, and groups.
        </p>

       
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
                    onClick={() => setActiveModalRoom(room)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:text-emerald-950 underline"
                  >
                    View room details <ArrowUpRight className="w-3 h-3" />
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

     
      {activeModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#fcfbf7] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <div className="relative h-60 w-full">
              <img
                src={activeModalRoom.image_url}
                alt={activeModalRoom.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalRoom(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-[#1d3a30] text-emerald-100">
                {activeModalRoom.type}
              </span>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-2xl font-bold text-[#142821]">{activeModalRoom.name}</h3>
                <span className="text-xl font-bold text-[#1d3d31]">
                  ₱{Number(activeModalRoom.price).toLocaleString()} <span className="text-xs text-stone-500 font-normal">/ night</span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-600 mb-4 pb-3 border-b border-stone-200">
                <span>Capacity: Up to {activeModalRoom.capacity} guests</span>
                <span>•</span>
                <span>Bed: {activeModalRoom.bed_type}</span>
              </div>

              <p className="text-stone-700 text-sm mb-6 leading-relaxed">
                {activeModalRoom.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2">Included Amenities</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-700">
                  {activeModalRoom.amenities ? (
                    activeModalRoom.amenities.split(',').map((am, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{am.trim()}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Wi-Fi</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Hot Shower</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Fresh Towels</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Room Service</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModalRoom(null)}
                  className="flex-1 py-2.5 rounded-full border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const r = activeModalRoom;
                    setActiveModalRoom(null);
                    onSelectRoomForBooking(r);
                  }}
                  className="flex-1 py-2.5 rounded-full bg-[#e2a63b] hover:bg-[#d2962a] text-[#142821] text-sm font-semibold shadow-sm"
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
