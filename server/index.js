import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json({ limit: '12mb' }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));

const KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

const PROMPT = `You are an English vocabulary extractor for Korean learners.
From the image, extract every distinct English vocabulary word.
Return ONLY a JSON array, no markdown, no commentary. Each item:
{"en":"word","ko":"한국어 뜻","pos":"noun|verb|adj|adv","phonetic":"IPA without slashes","example":"a short English sentence","difficulty":1-5}
Skip non-English text, page numbers, and duplicates.`;

app.get('/health', (_req, res) => res.json({ ok: true, model: MODEL, keyed: Boolean(KEY) }));

app.post('/api/extract', async (req, res) => {
  if (!KEY) return res.status(500).json({ error: 'GEMINI_API_KEY 미설정' });
  const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 필요' });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 85_000);
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });
    clearTimeout(timer);
    const json = await r.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    let words = [];
    try { words = JSON.parse(clean); } catch { words = []; }
    words = (Array.isArray(words) ? words : []).filter((w) => w && w.en).map((w) => ({
      en: String(w.en).trim(),
      ko: String(w.ko || '').trim(),
      pos: String(w.pos || '').trim(),
      phonetic: String(w.phonetic || '').replace(/\//g, '').trim(),
      example: String(w.example || '').trim(),
      difficulty: Number(w.difficulty) || 3,
    }));
    res.json({ words });
  } catch (e) {
    res.status(502).json({ error: 'Gemini 호출 실패', detail: String(e) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`VocaSnap API on :${PORT} (keyed: ${Boolean(KEY)})`));
