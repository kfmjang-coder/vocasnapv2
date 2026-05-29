import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { useAuth } from '../store/useAuth';
import { useToast } from '../store/useToast';

export function Login() {
  const nav = useNavigate();
  const { signUp, signIn, google } = useAuth();
  const toast = useToast((s) => s.show);

  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (mode === 'up') await signUp(name.trim(), email.trim(), pw);
      else await signIn(email.trim(), pw);
      nav('/');
    } catch (e: any) {
      toast(prettyError(e?.code) ?? '문제가 생겼어요');
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    setBusy(true);
    try {
      await google();
      nav('/');
    } catch (e: any) {
      toast(prettyError(e?.code) ?? 'Google 로그인 실패');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <div className="flex min-h-[80vh] flex-col justify-center gap-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium text-txt">VocaSnap</h1>
          <p className="mt-1.5 text-sm text-sub">{mode === 'up' ? '계정을 만들어 어디서든 이어 학습하세요' : '로그인하고 기기 간 동기화'}</p>
        </div>

        <div className="space-y-2.5">
          {mode === 'up' && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름"
              className="h-[50px] w-full rounded-[14px] border border-lineHi bg-ink px-4 text-txt outline-none focus:border-accent" />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일"
            autoCapitalize="off" autoComplete="email"
            className="h-[50px] w-full rounded-[14px] border border-lineHi bg-ink px-4 text-txt outline-none focus:border-accent" />
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="비밀번호 (6자 이상)"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="h-[50px] w-full rounded-[14px] border border-lineHi bg-ink px-4 text-txt outline-none focus:border-accent" />
        </div>

        <button onClick={submit} disabled={busy} className="btn btn-primary w-full disabled:opacity-50">
          {mode === 'up' ? '회원가입' : '로그인'}
        </button>

        <div className="flex items-center gap-3 text-xs text-faint">
          <div className="h-px flex-1 bg-line" /> 또는 <div className="h-px flex-1 bg-line" />
        </div>

        <button onClick={withGoogle} disabled={busy} className="btn btn-ghost w-full">
          Google로 계속하기
        </button>

        <div className="text-center text-sm">
          <button onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="text-accent">
            {mode === 'in' ? '계정이 없나요? 회원가입' : '이미 계정이 있나요? 로그인'}
          </button>
        </div>

        <button onClick={() => nav('/')} className="text-center text-sm text-faint">
          게스트로 계속하기
        </button>
      </div>
    </Page>
  );
}

function prettyError(code?: string): string | null {
  const map: Record<string, string> = {
    'auth/invalid-email': '올바른 이메일 형식이 아니에요',
    'auth/weak-password': '비밀번호를 6자 이상 입력해주세요',
    'auth/email-already-in-use': '이미 가입된 이메일이에요',
    'auth/invalid-credential': '이메일 또는 비밀번호가 맞지 않아요',
    'auth/popup-closed-by-user': 'Google 창이 닫혔어요',
  };
  return code ? map[code] ?? null : null;
}
