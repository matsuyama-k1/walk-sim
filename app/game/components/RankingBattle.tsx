import { formatDate } from "@/lib/utils";
import { memo, useMemo } from "react";
import { GameResult } from "../hooks/useScoreRelay_";

type RankingProps = {
  results: GameResult[];
  onStartNewGame: () => void;
};

const RankingBattle = memo(({ results, onStartNewGame }: RankingProps) => {
  // スコアに基づいて結果を並べ替え、トップ3を取得
  const sortedRecords = useMemo(() => {
    return results.sort((a, b) => b.score - a.score);
  }, [results]);

  return (
    <div>
      <h2>ランキングバトル</h2>
      <p>他の人と競い、ハイスコアを目指すモード。接触・時間切れは５回以内。</p>
      <button onClick={() => onStartNewGame()}>New Game</button>
      <ul>
        {sortedRecords.map((result, index) => (
          <li key={index}>
            {`${index + 1}. ${result.score} points, ${
              result.name
            }, ${formatDate(new Date(result.latestTimestamp))}`}
          </li>
        ))}
      </ul>
    </div>
  );
});

RankingBattle.displayName = "RankingBattle";

export default RankingBattle;
