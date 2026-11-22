import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Camera, Check, Shield } from 'lucide-react';
import { api } from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
];

export default function ProfileModal({ isOpen, onClose, currentUser, onUpdateUser }) {
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

  if (!isOpen || !currentUser) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#fcfbf7] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-6 bg-[#183429] text-white relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[10px] uppercase tracking-widest text-amber-300/90 font-semibold block mb-1">
            Guest Account
          </span>
          <h2 className="font-serif text-2xl font-bold">My Profile</h2>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Manage your personal info & profile picture
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs text-stone-700">
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-700/40 bg-stone-200 shadow-md flex items-center justify-center">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-stone-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-[#183429] hover:bg-[#12281f] text-white rounded-full shadow cursor-pointer transition-transform hover:scale-110">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center">
              <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                Or choose an avatar:
              </span>
              <div className="flex gap-2 justify-center">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPhotoURL(url);
                      setCustomPhotoInput('');
                    }}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      photoURL === url ? 'border-amber-500 ring-2 ring-amber-300' : 'border-stone-200'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email (Read only) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-100/80 text-stone-500 cursor-not-allowed font-mono text-[11px]"
            />
            {currentUser.isAdmin && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 mt-1">
                <Shield className="w-3 h-3 text-emerald-700" /> Hotel Administrator
              </span>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-stone-900"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>Contact Number</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 09171234567"
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-stone-900"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 font-semibold text-stone-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-full bg-[#183429] hover:bg-[#12281f] text-white font-semibold shadow-md transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
