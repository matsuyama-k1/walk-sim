import { GameResult } from "@/app/game/hooks/useScoreRelay";
import { LeaderboardEntry } from "@/lib/model";

export async function addLeaderboardEntry(
  score: number,
  gameSeedId: string,
  playerName: string
) {
  const newEntry = new LeaderboardEntry({
    score,
    gameSeedId,
    name: playerName,
    timestamp: new Date(),
  });

  await newEntry.save();
}

export async function getTopLeaderboardEntries(): Promise<GameResult[]> {
  const topEntries = await LeaderboardEntry.find()
    .sort({ score: -1, timestamp: -1 })
    .limit(100)
    .lean();

  return topEntries.map((entry): GameResult => {
    return {
      score: entry.score,
      name: entry.name,
      gameSeedId: entry.gameSeedId,
      latestTimestamp: entry.timestamp.getTime(),
    };
  });
}
