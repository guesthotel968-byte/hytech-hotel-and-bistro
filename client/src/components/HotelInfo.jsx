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
    <section id="the-hotel" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18392e]/10 text-[#18392e] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Bongabong, Oriental Mindoro</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142821] mb-3">
          Why Choose Hytech Hotel & Bistro
        </h2>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Combining contemporary comforts with genuine Filipino hospitality. Clean rooms, delicious bistro dining, and attentive service for every traveler.
        </p>
      </div>

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
