import React, { useState } from 'react';
import { X, User, Lock, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function SignInModal({ isOpen, onClose, onSignIn, onOpenAdmin }) {
  const [email, setEmail] = useState('guesthotel968@gmail.com');
  const [name, setName] = useState('Carl Faa');
  const [phone, setPhone] = useState('09141278921');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSignIn({
      name,
      email,
      phone
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#fcfbf7] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200 text-center relative bg-[#183429] text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-amber-300" />
          </div>
          <h3 className="font-serif text-2xl font-bold">Sign In / Register</h3>
          <p className="text-xs text-emerald-200/80 mt-1">
            Access your reservations, food orders, and leave reviews.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#e2a63b] hover:bg-[#d4962c] text-[#142821] font-bold text-sm shadow transition-colors"
          >
            Continue as Guest
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
            <span className="relative bg-[#fcfbf7] px-2 text-[11px] text-stone-400">or admin access</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="w-full py-2.5 rounded-full border border-emerald-800 text-emerald-900 hover:bg-emerald-50 font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Open Admin Panel (Staff)</span>
          </button>
        </form>

      </div>
    </div>
  );
}
