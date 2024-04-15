import { memo, useMemo } from "react";
import { GameResult } from "../hooks/useScoreRelay_";
import { formatDate } from "@/lib/utils";

type RankingProps = {
  results: GameResult[];
  onStartNewGame: (gameSeedId?: string) => void;
};

const ScoreRelay = memo(({ results, onStartNewGame }: RankingProps) => {
  // スコアに基づいて結果を並べ替え、トップ3を取得
  const sortedRecords = useMemo(() => {
    return results.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [results]);

  return (
    <div>
      <h2>スコアリレー</h2>
      <p>
        一人のプレイヤーから始まり、スコアをどこまで伸ばせるか、みんなで協力してチャレンジしよう！
      </p>
      <ul>
        {sortedRecords.map((result, index) => (
          <li key={index}>
            <button onClick={() => onStartNewGame(result.gameSeedId)}>
              {`${index + 1}. ${result.score} points, ${
                result.name
              }, ${formatDate(new Date(result.latestTimestamp))}`}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => onStartNewGame()}>New Game</button>
    </div>
  );
});

ScoreRelay.displayName = "Ranking";

export default ScoreRelay;
