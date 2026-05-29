import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { useGame, levelOf, tierOf } from '../store/useGame';
import { useWords } from '../store/useWords';

export function Home() {
  const nav = useNavigate();
  const { xp, streak, todayCount } = useGame();
  const { wordSets, dueWords, progressOf, wordsOf } = useWords();
  const level = levelOf(xp);
  const xpInLevel = xp % 100;
  const due = dueWords();

  return (
    <Page>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-sub">오늘도 한 판</p>
          <h1 className="font-display text-2xl font-medium text-txt">VocaSnap</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm">
          <span className="text-warn">●</span>
          <span className="text-txt">{streak}일 연속</span>
        </div>
      </header>

      <section className="card mb-5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-sub">
            Lv.{level} · {tierOf(level)}
          </span>
          <span className="text-sm text-sub">{xpInLevel} / 100 XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent" style={{ width: `${xpInLevel}%` }} />
        </div>
        <p className="mt-3 text-[13px] text-faint">오늘 {todayCount}개 학습 완료</p>
      </section>

      <button
        onClick={() => nav('/quiz')}
        disabled={due.length === 0}
        className="btn btn-primary mb-6 min-h-[60px] w-full text-[17px] disabled:opacity-40"
      >
        {due.length > 0 ? `이어서 학습하기 (${due.length}개 남음)` : '학습할 단어가 없어요'}
      </button>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base text-txt">내 단어장</h2>
        <button onClick={() => nav('/sets')} className="text-sm text-accent">
          전체 보기
        </button>
      </div>

      {wordSets.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sub">아직 단어장이 없어요</p>
          <button onClick={() => nav('/add')} className="text-accent">
            사진으로 단어 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 pb-28">
          {wordSets.slice(0, 4).map((ws) => (
            <button
              key={ws.id}
              onClick={() => nav('/quiz?set=' + ws.id)}
              className="card flex w-full items-center justify-between p-4 text-left active:scale-[0.99]"
            >
              <div>
                <p className="text-txt">{ws.name}</p>
                <p className="text-[13px] text-faint">{wordsOf(ws.id).length}개 단어</p>
              </div>
              <span className="text-sm" style={{ color: ws.color }}>
                {progressOf(ws.id)}%
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => nav('/add')}
        aria-label="단어 추가"
        className="fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink shadow-lg active:scale-95"
        style={{ right: 20, bottom: 'calc(var(--safe-bottom) + 76px)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </Page>
  );
}
