import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Camera, Check, Shield, BookOpen, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { isUserAdmin } from '../services/firebase';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
];

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateUser,
  onOpenSignIn,
  onOpenMyBookings,
  onSignOut,
  onOpenAdmin
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setPhotoURL(currentUser.photoURL || '');
      setCustomPhotoInput('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const finalPhoto = customPhotoInput.trim() || photoURL;
      await api.updateProfile({
        email: currentUser.email,
        name: name.trim(),
        phone: phone.trim()
      });

      const updated = {
        ...currentUser,
        name: name.trim(),
        phone: phone.trim(),
        photoURL: finalPhoto
      };

      onUpdateUser(updated);
      setPhotoURL(finalPhoto);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoURL(reader.result);
        setCustomPhotoInput(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  const isAdmin = currentUser && isUserAdmin(currentUser);

  // View 1: Not signed in - Exactly matches media_1795330161323_42be1c7e.png
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200/90 relative my-auto animate-in fade-in duration-200">
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 w-full bg-[#c5a880]"></div>
          
          <div className="p-8 sm:p-10 relative text-left">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Serif Title */}
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142821] tracking-tight">
              Profile
            </h2>

            {/* Subtitle */}
            <p className="text-stone-600 text-sm mt-3 leading-relaxed">
              Sign in to manage your reservations, food orders, and reviews.
            </p>

            {/* Dark Green Sign In Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenSignIn) onOpenSignIn();
                }}
                className="bg-[#1c392c] hover:bg-[#152c22] text-white font-medium text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all inline-block cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Signed in user profile
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#fcfbf7] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200/90 relative my-auto animate-in fade-in duration-200">
        
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-[#c5a880]"></div>

        <div className="p-6 sm:p-8 relative text-left">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#b58c4f] font-bold block mb-0.5">
                {isAdmin ? 'ADMINISTRATOR' : 'GUEST ACCOUNT'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821]">
                Profile
              </h2>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-200 mb-5 shadow-2xs">
            <div className="relative group shrink-0">
              <img
                src={photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={name || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#c5a880] shadow-sm"
              />
              <label className="absolute bottom-0 right-0 p-1 bg-[#142821] text-white rounded-full cursor-pointer hover:bg-stone-800 transition-colors shadow">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-900 text-base truncate">
                {currentUser.name || 'Guest User'}
              </h3>
              <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {currentUser.email}
              </p>
              {currentUser.phone && (
                <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> {currentUser.phone}
                </p>
              )}
            </div>
          </div>

          {/* Quick Avatar Presets */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Choose an Avatar
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPhotoURL(url);
                    setCustomPhotoInput(url);
                  }}
                  className={`relative shrink-0 rounded-full overflow-hidden transition-all ${
                    photoURL === url ? 'ring-2 ring-emerald-700 ring-offset-2 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-10 h-10 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1c392c] hover:bg-[#152c22] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="mt-5 pt-4 border-t border-stone-200/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenMyBookings) onOpenMyBookings();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#b58c4f]" />
              <span>View My Reservations & Bistro Orders</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Open Admin Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSignOut) onSignOut();
              }}
              className="w-full py-2 text-center text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center justify-center gap-1.5 transition-colors mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
