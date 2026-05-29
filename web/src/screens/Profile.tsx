import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../store/useAuth';
import { useToast } from '../store/useToast';

export function Profile() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast((s) => s.show);

  const initial = (user?.name ?? user?.email ?? 'G').charAt(0).toUpperCase();

  return (
    <Page>
      <h1 className="mb-5 font-display text-2xl font-medium text-txt">내정보</h1>

      <div className="card mb-4 flex items-center gap-3 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accentDim text-accent">{initial}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-txt">{user ? (user.name ?? user.email) : '게스트'}</p>
          <p className="truncate text-[13px] text-faint">
            {user ? user.email : isFirebaseConfigured ? '로그인하면 기기 간 동기화돼요' : '로컬에만 저장 중'}
          </p>
        </div>
      </div>

      {!user && isFirebaseConfigured && (
        <button onClick={() => nav('/login')} className="btn btn-primary mb-4 w-full">
          로그인 / 회원가입
        </button>
      )}

      <div className="card divide-y divide-line">
        {['알림 설정', '데이터 동기화', '개인정보처리방침'].map((r) => (
          <div key={r} className="flex items-center justify-between p-4 text-txt">
            <span>{r}</span><span className="text-faint">›</span>
          </div>
        ))}
      </div>

      {user && (
        <button
          onClick={async () => { await logout(); toast('로그아웃됐어요'); }}
          className="btn btn-ghost mt-4 w-full text-badTxt"
        >
          로그아웃
        </button>
      )}

      <p className="mt-6 text-center text-xs text-faint">VocaSnap v2.0.0</p>
    </Page>
  );
}
