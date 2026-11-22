import React from 'react';
import { Wifi, Coffee, Utensils, Shield, Clock, MapPin } from 'lucide-react';

export default function HotelInfo() {
  const highlights = [
    {
      icon: <Utensils className="w-5 h-5 text-amber-500" />,
      title: 'Bistro & Rooftop Dining',
      desc: 'Savor freshly cooked Filipino favorites, seafood platters, and artisanal coffee at our in-house bistro.'
    },
    {
      icon: <Wifi className="w-5 h-5 text-amber-500" />,
      title: 'High-Speed Wi-Fi',
      desc: 'Seamless connectivity across all guest rooms, bistro lounges, and conference spaces.'
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      title: '24/7 Front Desk & Security',
      desc: 'Assistance available around the clock to cater to your needs and ensure your peace of mind.'
    },
    {
      icon: <MapPin className="w-5 h-5 text-amber-500" />,
      title: 'Prime Bongabong Location',
      desc: 'Conveniently situated near municipal landmarks, markets, transit points, and Mindoro coastal gems.'
    }
  ];

  return (
    <section id="the-hotel" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">About Our Hotel</span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#142921] font-bold mt-2 mb-4">
          A Peaceful Sanctuary in Oriental Mindoro
        </h2>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Hytech Hotel & Bistro combines contemporary comforts with genuine Filipino warmth. Whether you are traveling for business, vacation, or visiting family, enjoy restful rooms and culinary delights crafted with passion.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h3 className="font-serif text-lg font-semibold text-emerald-950 mb-2">{item.title}</h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
