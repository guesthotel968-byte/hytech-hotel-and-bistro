import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactSection() {
  return (
    <footer id="contact" className="bg-[#1a352a] text-white pt-16 pb-12 mt-12 border-t border-emerald-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Title */}
        <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-8 tracking-tight">
          Contact Us
        </h2>

     
        <div className="space-y-4 text-emerald-100 text-sm sm:text-base font-light mb-12">
          <p className="flex items-center justify-center gap-2">
            <span className="font-semibold text-white">Address:</span>
            <span>Bongabong, Oriental Mindoro, Philippines</span>
          </p>

          <p className="flex items-center justify-center gap-2">
            <span className="font-semibold text-white">Phone:</span>
            <a href="tel:+6309667932441" className="hover:text-amber-300 underline transition-colors">
              +63 (09) 66793-2441
            </a>
          </p>

          <p className="flex items-center justify-center gap-2">
            <span className="font-semibold text-white">Email:</span>
            <a href="mailto:hytechhotel@gmail.com" className="hover:text-amber-300 underline transition-colors">
              hytechhotel@gmail.com
            </a>
          </p>
        </div>

        
        <div className="pt-8 border-t border-emerald-800/60 text-xs text-emerald-300/80">
          <p>© 2026 Hytech HOTEL AND BISTRO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
