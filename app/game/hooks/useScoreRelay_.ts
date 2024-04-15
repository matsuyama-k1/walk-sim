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

export const useScoreRelay = () => {
  const [records, setRecords] = useState<GameRecord[]>([]);

  const saveGameRecord = async (
    score: number,
    gameSeedId: string,
    agentRecord: AgentRecord
  ) => {
    const loadedRecord = getGameRecord(gameSeedId);
    await delay(0.05);
    if (loadedRecord) {
      if (score <= loadedRecord.score) {
        // 既存の結果よりスコアが低い場合は保存しない
        return;
      }
      // 保存
      loadedRecord.agentRecords.push(agentRecord);
      loadedRecord.score = score;
      loadedRecord.latestName = agentRecord.name;
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.gameSeedId === gameSeedId ? loadedRecord : record
        )
      );
      return;
    } else {
      // 新しい結果を追加
      const newRecord: GameRecord = {
        score,
        gameSeedId,
        agentRecords: [agentRecord],
        latestName: agentRecord.name,
        latestTimestamp: new Date().getTime(),
      };
      setRecords((prevRecords) => [...prevRecords, newRecord]);
      return;
    }
  };

  const getGameRecord = (gameSeedId: string): GameRecord | undefined => {
    const loadedRecord = records.find(
      (record) => record.gameSeedId === gameSeedId
    );
    return loadedRecord;
  };

  const getTop3Results = useCallback((): GameResult[] => {
    const top3Records = records
      .sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        }
        return a.latestTimestamp - b.latestTimestamp;
      })
      .slice(0, 3);
    const top3Results = top3Records.map((record): GameResult => {
      return {
        score: record.score,
        name: record.latestName,
        gameSeedId: record.gameSeedId,
        latestTimestamp: record.latestTimestamp,
      };
    });
    return top3Results;
  }, [records]);

  return { saveGameRecord, getGameRecord, getTop3Results };
};

function delay(seconds: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
}
