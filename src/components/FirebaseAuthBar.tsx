import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, testFirestoreConnection } from '../lib/firebase';
import { LogIn, LogOut, User as UserIcon, Bookmark, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FirebaseAuthBarProps {
  onViewBookmarks?: () => void;
  savedJobsCount?: number;
}

export function FirebaseAuthBar({ onViewBookmarks, savedJobsCount = 0 }: FirebaseAuthBarProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(true);

  useEffect(() => {
    testFirestoreConnection().catch(() => setFirebaseConnected(false));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        Connecting Firebase Auth...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
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
        <button
          onClick={handleLogin}
          className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Sign in with Google
        </button>
      )}
    </div>
  );
}
