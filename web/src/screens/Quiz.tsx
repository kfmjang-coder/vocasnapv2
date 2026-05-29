import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { SpeakButton, vibrate } from '../components/ui';
import { useWords } from '../store/useWords';
import { useGame } from '../store/useGame';
import { recordAnswer } from '../lib/srs';
import type { Word } from '../lib/types';

const SESSION = 10;
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

interface Q {
  word: Word;
  choices: string[];
}

export function Quiz() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const setId = params.get('set') ?? undefined;
  const { wordsOf, dueWords, updateWord } = useWords();
  const { addXp, recordStudy } = useGame();

  const pool = useMemo(() => (setId ? wordsOf(setId) : wordsOf()), [setId]);
  const session = useMemo<Q[]>(() => {
    const base = setId ? wordsOf(setId) : dueWords();
    return shuffle(base)
      .slice(0, SESSION)
      .map((word) => {
        const distractors = shuffle(pool.filter((w) => w.id !== word.id))
          .slice(0, 3)
          .map((w) => w.ko);
        return { word, choices: shuffle([word.ko, ...distractors]) };
      });
  }, []);

  const [idx, setIdx] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  if (pool.length < 4) {
    return (
      <Page>
        <Back nav={nav} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sub">객관식은 단어가 4개 이상 필요해요</p>
          <button onClick={() => nav('/add')} className="text-accent">단어 추가하기</button>
        </div>
      </Page>
    );
  }

  if (idx >= session.length) {
    const acc = Math.round((correct / session.length) * 100);
    return (
      <Page>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="font-display text-5xl font-medium text-accent">{acc}%</p>
          <p className="mt-1 text-sm text-sub">{session.length}문제 중 {correct}개 정답</p>
          <p className="mt-5 text-lg font-medium text-goodTxt">⚡ +{correct * 18} XP</p>
        </div>
        <div className="space-y-2.5">
          <button onClick={() => nav(0)} className="btn btn-primary w-full">한 판 더</button>
          <button onClick={() => nav('/')} className="btn btn-ghost w-full">홈으로</button>
        </div>
      </Page>
    );
  }

  const q = session[idx];

  function answer(choice: string) {
    if (picked) return;
    setPicked(choice);
    const ok = choice === q.word.ko;
    vibrate(ok ? 18 : [12, 40, 12]);
    updateWord(q.word.id, recordAnswer(q.word, ok));
    recordStudy(ok);
    if (ok) {
      addXp(18);
      setCombo((c) => c + 1);
      setCorrect((c) => c + 1);
    } else {
      addXp(5);
      setCombo(0);
    }
    setTimeout(() => {
      setPicked(null);
      setIdx((i) => i + 1);
    }, ok ? 720 : 1180);
  }

  return (
    <Page>
      <div className="mb-3 flex items-center gap-3">
        <Back nav={nav} />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(idx / session.length) * 100}%` }} />
        </div>
        <span className="text-[13px] text-sub">{idx + 1} / {session.length}</span>
      </div>

      <div className="h-6">
        {combo > 1 && <span className="text-[13px] text-warn">🔥 {combo} 콤보</span>}
      </div>

      <div className="flex min-h-[34vh] flex-col items-center justify-center gap-3 text-center">
        <span className="font-display text-[38px] font-medium tracking-wide text-txt">{q.word.en}</span>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-base text-sub">/{q.word.phonetic}/</span>
          <SpeakButton text={q.word.en} size={38} />
        </div>
      </div>

      <div className="mt-3 space-y-2.5 pb-6">
        {q.choices.map((c) => {
          let cls = 'border-line bg-card text-txt';
          if (picked) {
            if (c === q.word.ko) cls = 'border-good bg-good/15 text-goodTxt';
            else if (c === picked) cls = 'border-bad bg-bad/15 text-badTxt';
          }
          return (
            <button
              key={c}
              onClick={() => answer(c)}
              className={`flex min-h-[54px] w-full items-center justify-center rounded-[14px] border px-4 text-[17px] transition-colors active:scale-[0.985] ${cls}`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </Page>
  );
}

function Back({ nav }: { nav: ReturnType<typeof useNavigate> }) {
  return (
    <button onClick={() => nav('/')} aria-label="닫기" className="flex h-8 w-8 items-center justify-center text-sub">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
    </button>
  );
}
