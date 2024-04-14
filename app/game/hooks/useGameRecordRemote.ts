import { AgentMovement } from "@/app/game/models/Agent";
import { useCallback, useState } from "react";

export type AgentRecord = {
  movements: AgentMovement[];
  name?: string;
};

export type GameRecord = {
  score: number;
  agentRecords: AgentRecord[]; // それぞれのエージェントの動きの配列
  gameSeedId: string;
  latestName?: string;
  latestTimestamp: number;
};

export type GameResult = {
  score: number;
  name?: string;
  gameSeedId: string;
  latestTimestamp: number;
};

export const useGameRecordRemote = () => {
  const [records, setRecords] = useState<GameRecord[]>([]);

  const saveGameRecord = async (
    score: number,
    gameSeedId: string,
    agentRecord: AgentRecord
  ) => {
    try {
      const response = await fetch(`/api/gameRecords/${gameSeedId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score,
          agentRecord,
        }),
      });

      if (response.ok) {
        const updatedRecord: GameRecord = await response.json();
        setRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.gameSeedId === gameSeedId ? updatedRecord : record
          )
        );
      }
    } catch (error) {
      console.error("Failed to save game record:", error);
    }
  };

  const getGameRecord = useCallback(
    async (gameSeedId: string): Promise<GameRecord | undefined> => {
      try {
        const response = await fetch(`/api/gameRecords/${gameSeedId}`);
        if (response.ok) {
          const record: GameRecord = await response.json();
          return record;
        }
      } catch (error) {
        console.error("Failed to fetch game record:", error);
      }
      return undefined;
    },
    []
  );

  const getTop3Results = useCallback(async (): Promise<GameResult[]> => {
    try {
      const response = await fetch("/api/gameRecords/top3");
      if (response.ok) {
        const top3Results: GameResult[] = await response.json();
        return top3Results;
      }
    } catch (error) {
      console.error("Failed to fetch top 3 results:", error);
    }
    return [];
  }, []);

  return { saveGameRecord, getGameRecord, getTop3Results };
};
