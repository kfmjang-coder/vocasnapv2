import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { extractWords } from '../lib/gemini';
import type { ExtractedWord } from '../lib/types';
import { useWords } from '../store/useWords';
import { useToast } from '../store/useToast';
import { speak } from '../components/ui';

type Stage = 'entry' | 'analyze' | 'extract' | 'done';
interface Row extends ExtractedWord {
  sel: boolean;
  open: boolean;
}

const STEPS = ['이미지 준비 중', 'Gemini AI 분석 중', '단어 추출 중', '결과 정리 중', '완료'];

export function AddWord() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { todaySet, addExtracted } = useWords();
  const toast = useToast((s) => s.show);

  const [stage, setStage] = useState<Stage>('entry');
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [wsName] = useState(() => `${new Date().toLocaleDateString('ko-KR')} 단어`);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStage('analyze');
    setStep(0);
    const tick = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 600);
    const result = await extractWords(file);
    clearInterval(tick);
    setStep(STEPS.length - 1);
    if (result.demo) toast('데모 단어로 진행 (서버 미연결)');
    setRows(result.words.map((w) => ({ ...w, sel: true, open: false })));
    setTimeout(() => setStage('extract'), 350);
  }

  const selCount = rows.filter((r) => r.sel).length;

  function save() {
    const ws = todaySet();
    addExtracted(ws.id, rows.filter((r) => r.sel));
    setStage('done');
  }

  if (stage === 'analyze') {
    return (
      <Page>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-7">
          <div className="rotate-[-2deg] rounded-xl2 bg-[#E9E7DF] p-4" style={{ width: 130, height: 162 }}>
            <p className="text-[13px] font-medium text-[#2A2A2A]">vocabulary</p>
            <div className="my-2 h-px bg-[#C9C6BC]" />
            {['accomplish', 'genuine', 'estimate', 'fragile'].map((w) => (
              <p key={w} className="my-1.5 text-[11px] text-[#3A3A3A]">{w}</p>
            ))}
          </div>
          <div className="w-full">
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(step + 1) * 20}%` }} />
            </div>
            <p className="mt-3.5 text-center text-sm text-txt">{STEPS[step]}</p>
          </div>
        </div>
      </Page>
    );
  }

  if (stage === 'done') {
    return (
      <Page>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2EE6A6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" />
          </svg>
          <h2 className="font-display text-xl font-medium text-txt">{selCount}개 단어를 저장했어요</h2>
          <p className="text-sm text-sub">{wsName}에 추가됨</p>
        </div>
        <div className="space-y-2.5">
          <button onClick={() => nav('/quiz')} className="btn btn-primary w-full">바로 학습하기</button>
          <button onClick={() => { setStage('entry'); setRows([]); }} className="btn btn-ghost w-full">단어 더 추가</button>
        </div>
      </Page>
    );
  }

  if (stage === 'extract') {
    const allSel = selCount === rows.length;
    const toggle = (i: number, patch: Partial<Row>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
    return (
      <Page>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-accent">✦</span>
          <h2 className="text-lg font-medium text-txt">{rows.length}개 단어를 찾았어요</h2>
        </div>

        <div className="card mb-3 flex items-center justify-between p-3.5">
          <span className="text-[15px] text-txt">📁 {wsName}</span>
          <span className="text-[13px] text-faint">자동 생성</span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] text-sub">{selCount}개 선택됨</span>
          <button
            onClick={() => setRows((r) => r.map((row) => ({ ...row, sel: !allSel })))}
            className="text-[13px] text-accent"
          >
            {allSel ? '전체 해제' : '전체 선택'}
          </button>
        </div>

        <div className="space-y-2 pb-28">
          {rows.map((w, i) => (
            <div key={i} className={`card p-3 ${w.sel ? '' : 'opacity-40'}`}>
              <div className="flex items-center gap-3" onClick={() => toggle(i, { open: !w.open })}>
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(i, { sel: !w.sel }); }}
                  className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] border ${w.sel ? 'border-accent bg-accent text-ink' : 'border-lineHi'}`}
                >
                  {w.sel && '✓'}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[17px] font-medium text-txt">{w.en}</span>
                    <span className="rounded-md bg-accentDim px-2 py-0.5 text-[11px] text-accent">{w.pos}</span>
                  </div>
                  <p className="text-[13px] text-sub">{w.ko}</p>
                </div>
                <span className="text-faint">{w.open ? '▲' : '▼'}</span>
              </div>
              {w.open && (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="mb-1.5 font-mono text-[13px] text-sub">/{w.phonetic}/</p>
                  <p className="text-[13px] italic text-[#B6B6C2]">{w.example}</p>
                  <div className="mt-2.5 flex gap-2">
                    <button onClick={() => speak(w.en)} className="btn btn-ghost min-h-[38px] flex-1 text-[13px]">발음 듣기</button>
                    <button
                      onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
                      className="btn btn-ghost min-h-[38px] flex-1 text-[13px] text-badTxt"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[440px] -translate-x-1/2 bg-surface/95 px-5 pt-2 backdrop-blur" style={{ paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
          <button onClick={save} disabled={selCount === 0} className="btn btn-primary w-full disabled:opacity-40">
            {selCount}개 저장하기
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex min-h-[70vh] flex-col justify-center gap-7">
        <div className="text-center">
          <h2 className="font-display text-2xl font-medium text-txt">단어 추가</h2>
          <p className="mt-1.5 text-[13px] text-sub">사진 속 영어 단어를 자동으로 추출해요</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
        <div className="space-y-2.5">
          <button onClick={() => fileRef.current?.click()} className="btn btn-primary min-h-[80px] w-full flex-col gap-1.5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h3l2-2h8l2 2h3v12H3z" /><circle cx="12" cy="13" r="3.5" /></svg>
            사진 촬영
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn btn-ghost w-full">갤러리에서 선택</button>
        </div>
        <p className="text-center text-xs text-faint">교과서·시험지·단어장 무엇이든 OK</p>
      </div>
    </Page>
  );
}
