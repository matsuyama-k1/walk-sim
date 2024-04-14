import { memo, useMemo } from "react";
import { GameResult } from "../hooks/useGameRecords";

type RankingProps = {
  results: GameResult[];
  onStartNewGame: (gameSeedId?: string) => void;
};

const Ranking = memo(({ results, onStartNewGame }: RankingProps) => {
  // スコアに基づいて結果を並べ替え、トップ3を取得
  const sortedRecords = useMemo(() => {
    return results.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [results]);

  return (
    <div>
      <h2>Zen Mode</h2>
      <p>
        スコア世界一を目指すモード。被弾は無制限。上位３位のデータを引き継ぐことも可能。
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

Ranking.displayName = "Ranking";

export default Ranking;

function formatDate(date: Date) {
  const year = date.getFullYear(); // 年を取得
  const month = date.getMonth() + 1; // 月を取得（0から始まるため+1）
  const day = date.getDate(); // 日を取得
  const hours = date.getHours(); // 時を取得
  const minutes = date.getMinutes(); // 分を取得
  const seconds = date.getSeconds(); // 秒を取得

  // 各部分を二桁に整形するヘルパー関数
  const padTo2Digits = (num: number) => num.toString().padStart(2, "0");

  // フォーマットされた日付文字列を返す
  return `${year}/${padTo2Digits(month)}/${padTo2Digits(day)} ${padTo2Digits(
    hours
  )}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}
