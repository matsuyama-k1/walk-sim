import { GameResult } from "@/app/game/hooks/useScoreRelay";
import { useCallback } from "react";

export const useRankingBattle = () => {
  const addLeaderboardEntry = useCallback(
    async (score: number, gameSeedId: string, playerName: string) => {
      try {
        const response = await fetch("/api/leaderboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ score, gameSeedId, playerName }),
        });

        if (!response.ok) {
          throw new Error("Failed to add leaderboard entry");
        }
      } catch (error) {
        console.error("Failed to add leaderboard entry:", error);
      }
    },
    []
  );

  const getTopLeaderboardEntries = useCallback(async (): Promise<
    GameResult[]
  > => {
    try {
      const response = await fetch("/api/leaderboard");

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard entries");
      }

      const topEntries: GameResult[] = await response.json();
      return topEntries;
    } catch (error) {
      console.error("Failed to fetch leaderboard entries:", error);
      return [];
    }
  }, []);

  return { addLeaderboardEntry, getTopLeaderboardEntries };
};
