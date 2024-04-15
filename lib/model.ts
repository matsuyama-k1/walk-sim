import {
  AgentRecord,
  GameRecord,
  GameResult,
} from "@/app/game/hooks/useScoreRelay_";
import { AgentMovement } from "@/app/game/models/Agent";
import { model, models, Schema } from "mongoose";

const LeaderboardEntrySchema: Schema = new Schema({
  score: { type: Number, required: true },
  gameSeedId: { type: String, required: true },
  name: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const agentMovementSchema = new Schema<AgentMovement>({
  time: { type: Number, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
  },
});

const agentRecordSchema = new Schema<AgentRecord>({
  movements: [agentMovementSchema],
  name: String,
});

const gameRecordSchema = new Schema<GameRecord>({
  score: { type: Number, required: true },
  agentRecords: [agentRecordSchema],
  gameSeedId: { type: String, required: true, unique: true },
  latestName: String,
  latestTimestamp: { type: Number, required: true },
});

// モデルのエクスポート
const LeaderboardEntry =
  models.LeaderboardEntryMongo ||
  model<GameResult>("LeaderboardEntryMongo", LeaderboardEntrySchema);
const GameRecordMongo =
  models.GameRecordMongo ||
  model<GameRecord>("GameRecordMongo", gameRecordSchema);

export { GameRecordMongo, LeaderboardEntry };
