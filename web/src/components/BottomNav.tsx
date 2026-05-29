import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: '홈', icon: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { to: '/sets', label: '단어장', icon: 'M4 5h12a2 2 0 0 1 2 2v13l-4-2-4 2-4-2-2 1V5z' },
  { to: '/stats', label: '통계', icon: 'M4 20V10M10 20V4M16 20v-8M22 20H2' },
  { to: '/profile', label: '내정보', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[440px] -translate-x-1/2 justify-around border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'text-accent' : 'text-faint'}`
          }
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={t.icon} />
          </svg>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
