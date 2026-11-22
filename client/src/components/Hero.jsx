import React from 'react';
import { Star } from 'lucide-react';

export default function Hero({ onOpenBooking }) {
  return (
    <section id="home" className="relative min-h-[560px] md:min-h-[640px] flex items-center justify-center overflow-hidden">
      {/* Background building photo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hotel-building.jpg"
          alt="Hytech Hotel & Bistro Building Facade"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#eaf0ec]" />
      </div>

      {/* Floating Center Card */}
      <div className="relative z-10 max-w-3xl mx-4 my-12 p-8 sm:p-12 rounded-3xl bg-[#1d382e]/90 backdrop-blur-md border border-emerald-700/40 text-white text-center shadow-2xl">
        {/* Rating Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/20 border border-emerald-600/30 text-amber-300 text-xs sm:text-sm font-medium mb-6">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>4.8 (Google Reviews)</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
          Experience Comfort in the<br className="hidden sm:inline" /> Heart of Hytech Hotel & Bistro
        </h1>

        {/* Description */}
        <p className="text-emerald-100/90 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 font-light leading-relaxed">
          Immaculate accommodations, seamless booking, and exceptional hospitality in Bongabong, Oriental Mindoro.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onOpenBooking()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#e2a63b] hover:bg-[#d2962a] text-[#142821] font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200"
          >
            Reserve Now
          </button>
          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/15 border border-emerald-400/50 text-white font-medium text-base transition-all duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
