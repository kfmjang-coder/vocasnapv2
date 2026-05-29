import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/ui';
import { Home } from './screens/Home';
import { WordSets } from './screens/WordSets';
import { AddWord } from './screens/AddWord';
import { Quiz } from './screens/Quiz';
import { Dictation } from './screens/Dictation';
import { Stats } from './screens/Stats';
import { Profile } from './screens/Profile';

// routes that hide the bottom nav (immersive / full-flow screens)
const IMMERSIVE = ['/add', '/quiz', '/dictation'];

export default function App() {
  const location = useLocation();
  const showNav = !IMMERSIVE.some((p) => location.pathname.startsWith(p));

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
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
}
