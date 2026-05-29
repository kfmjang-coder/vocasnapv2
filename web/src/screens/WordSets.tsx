import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { useWords } from '../store/useWords';

export function WordSets() {
  const nav = useNavigate();
  const { wordSets, wordsOf, progressOf, deleteWordSet } = useWords();

  const groups = [
    { title: '🌟 정복한 단어장', test: (p: number) => p >= 90 },
    { title: '⚔️ 진행 중', test: (p: number) => p >= 10 && p < 90 },
    { title: '🆕 새 도전', test: (p: number) => p < 10 },
  ];

  return (
    <Page>
      <h1 className="mb-5 font-display text-2xl font-medium text-txt">단어장</h1>
      {wordSets.length === 0 && (
        <div className="card flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sub">단어장이 비어 있어요</p>
          <button onClick={() => nav('/add')} className="text-accent">사진으로 단어 추가</button>
        </div>
      )}
      <div className="space-y-6 pb-28">
        {groups.map((g) => {
          const items = wordSets.filter((ws) => g.test(progressOf(ws.id)));
          if (!items.length) return null;
          return (
            <section key={g.title}>
              <h2 className="mb-2.5 text-sm text-sub">{g.title}</h2>
              <div className="space-y-2.5">
                {items.map((ws) => (
                  <div key={ws.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <button onClick={() => nav('/quiz?set=' + ws.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-txt">{ws.name}</p>
                        <p className="text-[13px] text-faint">{wordsOf(ws.id).length}개 · {progressOf(ws.id)}%</p>
                      </button>
                      <button onClick={() => confirm('이 단어장과 모든 단어가 삭제됩니다') && deleteWordSet(ws.id)} className="ml-2 text-faint">✕</button>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full" style={{ width: `${progressOf(ws.id)}%`, background: ws.color }} />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => nav('/quiz?set=' + ws.id)} className="btn btn-ghost min-h-[40px] flex-1 text-[13px]">객관식</button>
                      <button onClick={() => nav('/dictation?set=' + ws.id)} className="btn btn-ghost min-h-[40px] flex-1 text-[13px]">받아쓰기</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
