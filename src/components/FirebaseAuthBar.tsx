import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  loginWithGoogleRedirect, 
  handleRedirectResult, 
  logoutUser, 
  testFirestoreConnection 
} from '../lib/firebase';
import { 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Bookmark, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  X,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface FirebaseAuthBarProps {
  onViewBookmarks?: () => void;
  savedJobsCount?: number;
}

export function FirebaseAuthBar({ onViewBookmarks, savedJobsCount = 0 }: FirebaseAuthBarProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<{
    code: string;
    message: string;
    isUnauthorizedDomain: boolean;
  } | null>(null);

  useEffect(() => {
    testFirestoreConnection().catch(() => {});

    // Check redirect login results on boot
    handleRedirectResult()
      .catch((err) => {
        console.error('Redirect auth catch:', err);
        const code = err?.code || 'auth/unknown';
        const msg = err?.message || 'Redirect sign-in failed.';
        setAuthError({
          code,
          message: msg,
          isUnauthorizedDomain: code === 'auth/unauthorized-domain' || msg.includes('unauthorized domain')
        });
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginPopup = async () => {
    setAuthError(null);
    setAuthenticating(true);
    try {
      await loginWithGoogle(false);
    } catch (err: any) {
      console.error('Login failed:', err);
      const code = err?.code || 'auth/unknown';
      const msg = err?.message || 'Authentication error';
      
      const isUnauthorizedDomain = 
        code === 'auth/unauthorized-domain' || 
        msg.includes('unauthorized domain') ||
        msg.includes('unauthorized-domain');

      setAuthError({
        code,
        message: msg,
        isUnauthorizedDomain
      });
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLoginRedirect = async () => {
    setAuthError(null);
    setAuthenticating(true);
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      console.error('Redirect login error:', err);
      setAuthError({
        code: err?.code || 'auth/unknown',
        message: err?.message || 'Redirect authentication failed.',
        isUnauthorizedDomain: err?.code === 'auth/unauthorized-domain'
      });
      setAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.onrender.com';

  if (loadingAuth) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        Connecting Firebase Auth...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 relative">
      {currentUser ? (
        <div className="flex items-center gap-2.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-3 py-1.5">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="w-7 h-7 rounded-full border border-indigo-300 object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
            </div>
          )}

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-gray-900 leading-none flex items-center gap-1">
              {currentUser.displayName || currentUser.email?.split('@')[0]}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline-block" />
            </div>
            <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
              {currentUser.email}
            </div>
          </div>

          {onViewBookmarks && (
            <button
              onClick={onViewBookmarks}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm ml-1"
              title="View your saved job bookmarks"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks</span>
              {savedJobsCount > 0 && (
                <span className="bg-white text-indigo-700 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ml-0.5">
                  {savedJobsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Sign out of Firebase"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoginPopup}
            disabled={authenticating}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {authenticating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Sign in with Google
          </button>
        </div>
      )}

      {/* Error & Render Help Modal */}
      {authError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative text-left space-y-4">
            <button 
              onClick={() => setAuthError(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {authError.isUnauthorizedDomain 
                    ? 'Firebase Domain Authorization Required' 
                    : 'Firebase Sign-In Issue'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Error Code: <span className="font-mono text-amber-700 font-bold">{authError.code}</span>
                </p>
              </div>
            </div>

            {authError.isUnauthorizedDomain || authError.code === 'auth/popup-closed-by-user' || authError.code === 'auth/popup-blocked' ? (
              <div className="space-y-3 bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
                <p className="font-semibold text-amber-950">
                  Why did the Google popup close immediately on Render?
                </p>
                <p>
                  Firebase Authentication requires hosted domains to be explicitly listed in your Firebase Console's <strong className="text-amber-950 font-bold">Authorized Domains</strong> list.
                </p>
                <div className="bg-white/90 border border-amber-300 rounded-lg p-3 space-y-2">
                  <div className="text-[11px] font-bold text-gray-800">Your Current Hosting Domain:</div>
                  <div className="font-mono text-[11px] bg-amber-100/70 text-amber-900 px-2 py-1 rounded border border-amber-200 font-bold select-all break-all">
                    {currentHost}
                  </div>
                </div>

                <p className="font-bold text-amber-950 pt-1">To fix this in 1 minute:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 font-medium">
                  <li>Go to your <strong className="text-amber-950">Firebase Console</strong>.</li>
                  <li>Navigate to <strong className="text-amber-950">Authentication &rarr; Settings &rarr; Authorized Domains</strong>.</li>
                  <li>Click <strong className="text-amber-950">Add Domain</strong> and paste <code className="bg-amber-100 px-1 rounded font-bold">{currentHost}</code>.</li>
                </ol>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {authError.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleLoginRedirect}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <span>Try Page Redirect Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAuthError(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
