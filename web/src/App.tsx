import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/ui';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { loadAndSync, stopSync } from './lib/sync';
import { useAuth } from './store/useAuth';
import { Home } from './screens/Home';
import { WordSets } from './screens/WordSets';
import { AddWord } from './screens/AddWord';
import { Quiz } from './screens/Quiz';
import { Dictation } from './screens/Dictation';
import { Stats } from './screens/Stats';
import { Profile } from './screens/Profile';
import { Login } from './screens/Login';

const IMMERSIVE = ['/add', '/quiz', '/dictation', '/login'];

export default function App() {
  const location = useLocation();
  const showNav = !IMMERSIVE.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      useAuth.getState().setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        useAuth.getState().setUser({ uid: u.uid, email: u.email, name: u.displayName });
        try {
          await loadAndSync(u.uid);
        } catch {
          /* offline / rules — local data still works */
        }
      } else {
        useAuth.getState().setUser(null);
        stopSync();
      }
      useAuth.getState().setReady(true);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-ink" style={{ paddingBottom: showNav ? 'calc(var(--safe-bottom) + 60px)' : 0 }}>
      <Toast />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/sets" element={<WordSets />} />
          <Route path="/add" element={<AddWord />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dictation" element={<Dictation />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
}
