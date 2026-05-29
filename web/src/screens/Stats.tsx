import { Page } from '../components/Page';
import { useGame, levelOf, tierOf } from '../store/useGame';
import { useWords } from '../store/useWords';

export function Stats() {
  const { xp, streak, bestStreak, totalAnswered, totalCorrect } = useGame();
  const { words } = useWords();
  const level = levelOf(xp);
  const mastered = words.filter((w) => w.status === 'mastered').length;
  const acc = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const cards = [
    { label: '레벨', value: `Lv.${level}` },
    { label: '등급', value: tierOf(level) },
    { label: '총 XP', value: xp.toLocaleString() },
    { label: '연속 학습', value: `${streak}일` },
    { label: '최고 연속', value: `${bestStreak}일` },
    { label: '평균 정답률', value: `${acc}%` },
    { label: '마스터 단어', value: String(mastered) },
    { label: '총 단어', value: String(words.length) },
  ];

  return (
    <Page>
      <h1 className="mb-5 font-display text-2xl font-medium text-txt">통계</h1>
      <div className="grid grid-cols-2 gap-3 pb-28">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl2 bg-card p-4">
            <p className="text-[13px] text-sub">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-medium text-txt">{c.value}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}
