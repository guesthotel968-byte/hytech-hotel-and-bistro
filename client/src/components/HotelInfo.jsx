import React from 'react';
import { Wifi, Utensils, Clock, MapPin, Sparkles } from 'lucide-react';

export default function HotelInfo() {
  const highlights = [
    {
      icon: <Utensils className="w-5 h-5 text-amber-400" />,
      title: 'Bistro & Rooftop Dining',
      desc: 'Freshly prepared Filipino specialties, seafood platters, and hot breakfast plates.'
    },
    {
      icon: <Wifi className="w-5 h-5 text-amber-400" />,
      title: 'High-Speed Wi-Fi',
      desc: 'Fast, seamless internet connectivity throughout the entire hotel and bistro.'
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      title: '24/7 Front Desk',
      desc: 'Assistance anytime for late arrivals, room services, and inquiries.'
    },
    {
      icon: <MapPin className="w-5 h-5 text-amber-400" />,
      title: 'Prime Bongabong Location',
      desc: 'Situated along the town center with easy access to transit, beaches, and markets.'
    }
  ];

  return (
    <section id="the-hotel" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Showcase Banner with the user's second photo */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/20 mb-12">
        {/* Actual photo of Bongabong View building */}
        <div className="relative min-h-[460px] md:min-h-[520px] flex items-center">
          <img
            src="/images/hotel-info-building.jpg"
            alt="Hytech Hotel & Bistro Building"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Elegant Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#11241d]/95 via-[#11241d]/85 to-black/40" />

          {/* Text Content over Image */}
          <div className="relative z-10 max-w-2xl p-8 sm:p-12 md:p-16 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bongabong, Oriental Mindoro</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
              A Peaceful Sanctuary in the Heart of Town
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6 font-light">
              Hytech Hotel & Bistro (Bongabong View) combines contemporary comforts with genuine Filipino hospitality. Whether visiting for business, a peaceful getaway, or social gatherings, enjoy clean, air-conditioned rooms, delicious bistro dining, and friendly service tailored to your stay.
            </p>

            <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-medium text-emerald-200">
              <span className="flex items-center gap-1.5">✓ 11 Room Types</span>
              <span className="flex items-center gap-1.5">✓ Restaurant & Events Place</span>
              <span className="flex items-center gap-1.5">✓ Secure Parking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-emerald-950/10 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1d3a30] text-amber-400 flex items-center justify-center mb-4 shadow-sm">
              {item.icon}
            </div>
            <h3 className="font-serif text-lg font-bold text-[#142821] mb-2">{item.title}</h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
