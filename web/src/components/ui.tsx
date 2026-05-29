import { useToast } from '../store/useToast';

/** Text-to-speech using the Web Speech API (native on most devices). */
export function speak(text: string, lang = 'en-US') {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.92;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {
    /* TTS unsupported — silently ignore */
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

export function SpeakButton({ text, size = 48 }: { text: string; size?: number }) {
  return (
    <button
      aria-label="발음 듣기"
      onClick={() => speak(text)}
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full border border-accent/40 bg-accentDim text-accent active:scale-95 transition-transform"
    >
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 5a9 9 0 0 1 0 14" />
      </svg>
    </button>
  );
}

export function Toast() {
  const message = useToast((s) => s.message);
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 rounded-full border border-lineHi bg-cardHi px-4 py-2 text-[13px] text-txt"
      style={{ top: 'calc(var(--safe-top) + 16px)' }}>
      {message}
    </div>
  );
}
