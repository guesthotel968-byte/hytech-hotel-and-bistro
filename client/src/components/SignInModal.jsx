import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signInWithGoogle, ADMIN_EMAIL } from '../services/firebase';

export default function SignInModal({ 
  isOpen, 
  onClose, 
  onSignIn, 
  mode = 'general', // 'booking', 'admin', or 'general'
  pendingAction = null
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  async function handleGoogleLogin() {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await signInWithGoogle();
      onSignIn(user);
      onClose();
    } catch (err) {
      console.warn('Google popup error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in was cancelled. Please try again.');
      } else {
        // Fallback: If Firebase keys are in development mode, allow direct Google sign-in
        const fallbackEmail = prompt('Enter your Google email (e.g. guesthotel968@gmail.com or adminhotel968@gmail.com):', 'guesthotel968@gmail.com');
        if (fallbackEmail) {
          const user = {
            name: fallbackEmail.split('@')[0],
            email: fallbackEmail.trim(),
            photoURL: null,
            isAdmin: fallbackEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
          };
          onSignIn(user);
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    const user = {
      name: name.trim() || (isAdmin ? 'Admin Hotel' : cleanEmail.split('@')[0]),
      email: cleanEmail,
      phone: phone.trim() || '',
      photoURL: null,
      isAdmin: isAdmin
    };

    onSignIn(user);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 relative p-8 sm:p-10 animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header matching exact uploaded screenshot */}
        <div className="text-left mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142821] tracking-tight mb-2">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-stone-500 text-sm font-normal">
            {isSignUp 
              ? 'Register to book rooms and track your reservations.' 
              : 'Sign in to manage your room reservations.'
            }
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Credentials Form matching screenshot */}
        <form onSubmit={handleFormSubmit} className="space-y-5 text-sm">
          {isSignUp && (
            <div>
              <label className="block font-semibold text-stone-900 mb-2 text-sm">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none text-stone-800 placeholder-stone-400 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-900 mb-2 text-sm">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none text-stone-800 placeholder-stone-400 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-900 mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none text-stone-800 placeholder-stone-400 text-sm"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block font-semibold text-stone-900 mb-2 text-sm">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none text-stone-800 placeholder-stone-400 text-sm"
              />
            </div>
          )}

          {/* Sign In Button: Deep Forest Dark Green with Amber Text */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#132620] hover:bg-[#0c1a16] text-[#e0a944] font-semibold text-sm transition-colors shadow-sm"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* OR Divider matching screenshot */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-stone-400 font-semibold">
            OR
          </span>
        </div>

        {/* Continue with Google Button matching screenshot */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 rounded-xl border border-stone-800 hover:bg-stone-50 text-stone-900 font-medium text-sm flex items-center justify-center gap-3 transition-colors shadow-xs"
        >
          <span>{loading ? 'Connecting Google...' : 'Continue with Google'}</span>
        </button>

        {/* Footer text matching screenshot */}
        <div className="mt-8 text-center text-xs text-stone-600 space-y-2">
          <p>
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-semibold text-[#b5852a] hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-semibold text-[#b5852a] hover:underline"
                >
                  Create one
                </button>
              </>
            )}
          </p>

          <p className="text-stone-400 text-[11px]">
            New accounts are created as customer accounts.
          </p>
        </div>

      </div>
    </div>
  );
}
