import connectDB from "@/lib/connect-db";
import { GameRecordMongo } from "@/lib/model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { gameSeedId: string } }
) {
  await connectDB();

  const { gameSeedId } = params;

  try {
    const gameRecord = await GameRecordMongo.findOne({ gameSeedId }).lean();

    if (!gameRecord) {
      return NextResponse.json(
        { message: "Game record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gameRecord, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { gameSeedId: string } }
) {
  await connectDB();

  const { gameSeedId } = params;
  const { score, agentRecord } = await request.json();

  try {
    let gameRecord = await GameRecordMongo.findOne({ gameSeedId });

    if (gameRecord) {
      if (score <= gameRecord.score) {
        return NextResponse.json(
          { message: "Score is lower than existing record" },
          { status: 200 }
        );
      }

      gameRecord.agentRecords.push(agentRecord);
      gameRecord.score = score;
      gameRecord.latestName = agentRecord.name;
    } else {
      gameRecord = new GameRecordMongo({
        score,
        gameSeedId,
        agentRecords: agentRecord,
        latestName: agentRecord.name,
        latestTimestamp: new Date().getTime(),
      });
    }

    await gameRecord.save();
    return NextResponse.json(gameRecord, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
