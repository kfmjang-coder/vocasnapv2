import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { SpeakButton, speak } from '../components/ui';
import { useWords } from '../store/useWords';
import { useGame } from '../store/useGame';
import { recordAnswer } from '../lib/srs';
import type { Word } from '../lib/types';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function lev(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function Dictation() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const setId = params.get('set') ?? undefined;
  const { wordsOf, dueWords, updateWord } = useWords();
  const { addXp, recordStudy } = useGame();
  const inputRef = useRef<HTMLInputElement>(null);

  const [count, setCount] = useState(10);
  const [scope, setScope] = useState<'set' | 'all'>(setId ? 'set' : 'all');
  const [phase, setPhase] = useState<'setup' | 'test' | 'result'>('setup');

  const session = useMemo<Word[]>(() => {
    if (phase === 'setup') return [];
    const base = scope === 'set' && setId ? wordsOf(setId) : dueWords();
    return shuffle(base).slice(0, count);
  }, [phase]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [val, setVal] = useState('');
  const [t0] = useState(Date.now());

  useEffect(() => {
    if (phase !== 'test') return;
    setVal(answers[idx] ?? '');
    inputRef.current?.focus();
    speak(session[idx].en);
  }, [idx, phase]);

  const available = (scope === 'set' && setId ? wordsOf(setId) : dueWords()).length;

  if (phase === 'setup') {
    return (
      <Page>
        <div className="flex min-h-[70vh] flex-col justify-center gap-7">
          <div className="text-center">
            <h2 className="font-display text-2xl font-medium text-txt">모의테스트</h2>
            <p className="mt-1.5 text-[13px] text-sub">뜻을 보고 영어 단어를 받아쓰기</p>
          </div>
          <div>
            <p className="mb-2.5 text-[13px] text-sub">문제 수</p>
            <div className="flex gap-2">
              {[5, 10, 20].map((n) => (
                <button key={n} onClick={() => setCount(n)} className={`chip ${count === n ? 'chip-on' : ''}`}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2.5 text-[13px] text-sub">출제 범위</p>
            <div className="flex gap-2">
              <button onClick={() => setScope('set')} disabled={!setId} className={`chip ${scope === 'set' ? 'chip-on' : ''} disabled:opacity-30`}>이 단어장</button>
              <button onClick={() => setScope('all')} className={`chip ${scope === 'all' ? 'chip-on' : ''}`}>전체</button>
            </div>
          </div>
          <button
            onClick={() => { setPhase('test'); setIdx(0); setAnswers([]); }}
            disabled={available === 0}
            className="btn btn-primary w-full disabled:opacity-40"
          >
            {available === 0 ? '학습할 단어가 없어요' : '시작하기'}
          </button>
        </div>
      </Page>
    );
  }

  if (phase === 'result') {
    const sec = Math.floor((Date.now() - t0) / 1000);
    let right = 0;
    const wrong: { w: Word; u: string; sk: boolean }[] = [];
    session.forEach((w, i) => {
      const u = (answers[i] ?? '').trim();
      if (!u) { wrong.push({ w, u: '(미응답)', sk: true }); return; }
      const d = lev(u.toLowerCase(), w.en.toLowerCase());
      const ok = d <= 1;
      updateWord(w.id, recordAnswer(w, ok));
      recordStudy(ok);
      if (ok) right++;
      else wrong.push({ w, u, sk: false });
    });
    const acc = Math.round((right / session.length) * 100);
    addXp(right * 25);

    return (
      <Page>
        <div className="pt-2 text-center">
          <p className="font-display text-5xl font-medium text-accent">{acc}%</p>
          <p className="text-sm text-sub">{session.length}문제 중 {right}개 정답</p>
        </div>
        <div className="my-4 flex gap-2">
          <Metric label="맞음" value={String(right)} color="text-goodTxt" />
          <Metric label="틀림" value={String(wrong.filter((x) => !x.sk).length)} color="text-badTxt" />
          <Metric label="시간" value={`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`} color="text-txt" />
        </div>
        <p className="mb-1.5 text-center text-lg font-medium text-goodTxt">⚡ +{right * 25} XP</p>

        {wrong.length > 0 && (
          <div className="mt-3 pb-6">
            <p className="mb-1 text-[13px] text-sub">다시 볼 단어</p>
            {wrong.map((x, i) => (
              <div key={i} className="flex items-center justify-between border-t border-line/60 py-2.5">
                <div className="text-left">
                  <p className="font-display text-[15px] text-txt">{x.w.en}</p>
                  <p className={`text-xs ${x.sk ? 'text-sub' : 'text-badTxt'}`}>{x.u}</p>
                </div>
                <p className="max-w-[130px] text-right text-[13px] text-sub">{x.w.ko}</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setPhase('setup')} className="btn btn-primary mt-2 w-full">다시 풀기</button>
      </Page>
    );
  }

  // test phase
  const last = idx === session.length - 1;
  const save = () => setAnswers((a) => { const n = [...a]; n[idx] = val; return n; });
  const next = () => { save(); last ? setPhase('result') : setIdx((i) => i + 1); };
  const skip = () => { setAnswers((a) => { const n = [...a]; n[idx] = ''; return n; }); last ? setPhase('result') : setIdx((i) => i + 1); };
  const prev = () => { save(); setIdx((i) => Math.max(0, i - 1)); };
  const w = session[idx];

  return (
    <Page>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] text-sub">{idx + 1} / {session.length}</span>
        <button onClick={() => setPhase('setup')} className="text-[13px] text-faint">그만두기</button>
      </div>
      <div className="mb-2 flex flex-wrap justify-center gap-1.5">
        {session.map((_, i) => (
          <span key={i} className={`inline-block rounded-full ${i === idx ? 'h-2.5 w-2.5 border border-accent' : answers[i] ? 'h-2 w-2 bg-accent' : 'h-2 w-2 bg-line'}`} />
        ))}
      </div>

      <div className="flex min-h-[36vh] flex-col items-center justify-center gap-4">
        <SpeakButton text={w.en} size={64} />
        <p className="text-lg font-medium text-[#C9C9D4]">{w.ko}</p>
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } }}
          placeholder="영어 단어 입력"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          className="h-[52px] w-full rounded-[14px] border border-lineHi bg-ink text-center font-display text-xl text-txt outline-none focus:border-accent"
        />
      </div>

      <div className="mt-3.5 flex gap-2 pb-6">
        <button onClick={prev} disabled={idx === 0} className="btn btn-ghost w-14 flex-none disabled:opacity-30">←</button>
        <button onClick={skip} className="btn btn-ghost flex-1">건너뛰기</button>
        <button onClick={next} className="btn btn-primary flex-[1.4]">{last ? '제출' : '다음'}</button>
      </div>
    </Page>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 rounded-xl2 bg-card py-3 text-center">
      <p className={`text-xl font-medium ${color}`}>{value}</p>
      <p className="text-xs text-sub">{label}</p>
    </div>
  );
}
