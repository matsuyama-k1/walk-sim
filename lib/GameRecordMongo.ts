import { AgentRecord, GameRecord } from "@/app/game/hooks/useGameRecords";
import { AgentMovement } from "@/app/game/models/Agent";
import { model, models, Schema } from "mongoose";

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

export default models.GameRecordMongo ||
  model<GameRecord>("GameRecordMongo", gameRecordSchema);
