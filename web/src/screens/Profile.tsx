import { Page } from '../components/Page';
import { isFirebaseConfigured } from '../lib/firebase';

export function Profile() {
  return (
    <Page>
      <h1 className="mb-5 font-display text-2xl font-medium text-txt">내정보</h1>
      <div className="card mb-4 flex items-center gap-3 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accentDim text-accent">G</div>
        <div>
          <p className="text-txt">게스트</p>
          <p className="text-[13px] text-faint">{isFirebaseConfigured ? '로그인하면 기기 간 동기화돼요' : '로컬에만 저장 중'}</p>
        </div>
      </div>
      <div className="card divide-y divide-line">
        {['알림 설정', '다크 모드', '데이터 동기화', '개인정보처리방침'].map((r) => (
          <div key={r} className="flex items-center justify-between p-4 text-txt">
            <span>{r}</span><span className="text-faint">›</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-faint">VocaSnap v2.0.0</p>
    </Page>
  );
}
