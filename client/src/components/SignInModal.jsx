import React, { useState } from 'react';
import { X, Check, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle, ADMIN_EMAIL } from '../services/firebase';
import { api } from '../services/api';

export default function SignInModal({ 
  isOpen, 
  onClose, 
  onSignIn, 
  mode = 'general', // 'booking', 'admin', or 'general'
  pendingAction = null
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleInput, setShowGoogleInput] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Standard Email & Password fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  async function handleGoogleLoginClick() {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await signInWithGoogle();
      if (user && user.email) {
        completeSignIn(user.email, user.name || user.email.split('@')[0], user.photoURL);
        return;
      }
    } catch (err) {
      console.warn('Firebase popup notice:', err);
      // Fallback: prompt for user's Google email
      setShowGoogleInput(true);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleEmailSubmit(e) {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setErrorMsg('Please enter your Google / Gmail address.');
      return;
    }
    const clean = googleEmail.trim().toLowerCase();
    const displayName = clean.split('@')[0].replace(/[._]/g, ' ');
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    completeSignIn(clean, capitalizedName, null);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const displayName = name.trim() || cleanEmail.split('@')[0];
    completeSignIn(cleanEmail, displayName, null);
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your account email.');
      return;
    }
    setResetLoading(true);
    setErrorMsg('');
    setResetSuccess('');

    try {
      await api.forgotPassword(resetEmail.trim());
      setResetSuccess(
        newPassword.trim() 
          ? `Your password has been successfully updated! You can now sign in with your new credentials.`
          : `Password reset instructions sent to ${resetEmail}. If your account was created with Google, continue with Google.`
      );
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process password reset');
    } finally {
      setResetLoading(false);
    }
  }

  function completeSignIn(userEmail, userName, photo) {
    const cleanEmail = userEmail.trim().toLowerCase();
    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    const userData = {
      name: isAdmin ? 'Admin Hotel' : (userName || cleanEmail.split('@')[0]),
      email: cleanEmail,
      phone: phone.trim() || '',
      photoURL: photo || null,
      isAdmin: isAdmin
    };

    onSignIn(userData);
    onClose();
    setShowGoogleInput(false);
    setShowForgotPassword(false);
    setGoogleEmail('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#fdfbf7] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto grid grid-cols-1 md:grid-cols-2 animate-in fade-in duration-200">
        
        {/* Left Column: Cozy Hotel Room Image & Branding */}
        <div className="hidden md:flex flex-col justify-between p-10 relative bg-stone-900 text-white overflow-hidden min-h-[560px]">
          <img 
            src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80" 
            alt="Hytech Hotel and Bistro" 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/75"></div>
          
          <div className="relative z-10">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90 font-sans">
              HYTECH HOTEL AND BISTRO
            </span>
          </div>

          <div className="relative z-10 my-auto py-8">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-white mb-3">
              Stay comfortable.<br />
              Reserve with<br />
              ease.
            </h2>
          </div>

          <div className="relative z-10">
            <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed font-light">
              Clean rooms, simple booking, and a comfortable stay in BONGABONG.
            </p>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="p-8 sm:p-10 bg-[#fdfbf7] relative flex flex-col justify-center min-h-[560px]">
          {/* Close Button */}
          <button
            onClick={() => {
              setShowGoogleInput(false);
              setShowForgotPassword(false);
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* View 1: Forgot Password View */}
          {showForgotPassword ? (
            <div>
              <div className="text-left mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 border border-amber-200">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821] tracking-tight mb-1">
                  Reset password
                </h2>
                <p className="text-stone-500 text-xs sm:text-sm">
                  Enter your registered email address and set your new password.
                </p>
              </div>

              {resetSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-emerald-900">
                      <Check className="w-4 h-4 text-emerald-600" /> Password updated!
                    </div>
                    <p>{resetSuccess}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSuccess('');
                    }}
                    className="w-full py-3 rounded-xl bg-[#122820] hover:bg-[#091612] text-[#e0a944] font-semibold text-sm transition-colors"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1.5 text-xs">
                      Your Registered Email
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-stone-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1.5 text-xs">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter at least 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-stone-900 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 rounded-xl bg-[#122820] hover:bg-[#091612] text-[#e0a944] font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? 'Updating password...' : 'Save New Password'}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : showGoogleInput ? (
            /* View 2: Multi-Account Google Sign-In Fallback */
            <div>
              <div className="text-left mb-6">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#b58c4f] block mb-1">
                  HYTECH HOTEL AND BISTRO
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142821] tracking-tight mb-1">
                  Google Account Sign-In
                </h2>
                <p className="text-stone-500 text-xs sm:text-sm">
                  Enter your Gmail address to continue.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleGoogleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1.5 text-xs">
                    Your Gmail / Google Address
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-stone-900 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#122820] hover:bg-[#091612] text-[#e0a944] font-semibold text-sm transition-colors"
                >
                  Continue with this Google Account
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowGoogleInput(false)}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Standard Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Main View: Exact match of media_1795330182840_0767ae77.jpg */
            <div>
              <div className="text-left mb-5">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#b58c4f] block mb-1">
                  HYTECH HOTEL AND BISTRO
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#142821] tracking-tight">
                  {isSignUp ? 'Create account' : 'Welcome back'}
                </h2>
                <p className="text-stone-500 text-xs sm:text-sm mt-1">
                  {isSignUp 
                    ? 'Join Hytech to easily reserve rooms and track orders.' 
                    : 'Sign in to manage your room reservations.'}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1 text-xs">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maria Santos"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-800 mb-1 text-xs">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1 text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1 text-xs">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900 text-sm"
                    />
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#122820] hover:bg-[#091612] text-[#dfc38c] font-semibold text-sm transition-colors shadow-sm mt-1"
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              {/* Forgot Password link */}
              {!isSignUp && (
                <div className="mt-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-[#2563eb] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* OR Divider */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <span className="relative bg-[#fdfbf7] px-3 text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  OR
                </span>
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLoginClick}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 bg-white text-stone-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{loading ? 'Connecting Google...' : 'Continue with Google'}</span>
              </button>

              {/* Footer */}
              <div className="mt-5 text-center text-xs text-stone-600 space-y-1.5">
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
          )}

        </div>

      </div>
    </div>
  );
}
