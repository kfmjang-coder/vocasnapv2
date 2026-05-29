import type { ExtractedWord } from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const DEMO_WORDS: ExtractedWord[] = [
  { en: 'accomplish', ko: '성취하다, 해내다', pos: 'verb', phonetic: 'əˈkʌmplɪʃ', example: 'She worked hard to accomplish her goals.', difficulty: 3 },
  { en: 'genuine', ko: '진실한, 진짜의', pos: 'adj', phonetic: 'ˈdʒenjuɪn', example: 'He showed genuine interest.', difficulty: 2 },
  { en: 'estimate', ko: '추정하다, 견적', pos: 'verb', phonetic: 'ˈestɪmeɪt', example: 'Experts estimate the cost.', difficulty: 3 },
  { en: 'fragile', ko: '깨지기 쉬운, 연약한', pos: 'adj', phonetic: 'ˈfrædʒaɪl', example: 'The vase is extremely fragile.', difficulty: 2 },
  { en: 'negotiate', ko: '협상하다', pos: 'verb', phonetic: 'nɪˈɡoʊʃieɪt', example: 'They will negotiate a new contract.', difficulty: 4 },
  { en: 'vivid', ko: '생생한, 선명한', pos: 'adj', phonetic: 'ˈvɪvɪd', example: 'She has vivid memories.', difficulty: 3 },
];

/** Reads a File into a base64 string (no data: prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('파일을 읽지 못했어요'));
    reader.readAsDataURL(file);
  });
}

export interface ExtractResult {
  words: ExtractedWord[];
  demo: boolean;
}

/**
 * Sends the image to the server proxy. If the proxy is unreachable or
 * not configured, falls back to demo words so the flow stays usable.
 */
export async function extractWords(file: File): Promise<ExtractResult> {
  if (!API_BASE) return { words: DEMO_WORDS, demo: true };

  try {
    const imageBase64 = await fileToBase64(file);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 90_000);
    const res = await fetch(`${API_BASE}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType: file.type || 'image/jpeg' }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`서버 오류 ${res.status}`);
    const data = (await res.json()) as { words?: ExtractedWord[] };
    if (!data.words?.length) throw new Error('단어를 찾지 못했어요');
    return { words: data.words, demo: false };
  } catch {
    return { words: DEMO_WORDS, demo: true };
  }
}
