import connectDB from "@/lib/connect-db";
import GameRecordMongo from "@/lib/GameRecordMongo";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  try {
    const top3Results = await GameRecordMongo.aggregate([
      { $sort: { score: -1, latestTimestamp: -1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          score: 1,
          name: "$latestName",
          gameSeedId: 1,
          latestTimestamp: 1,
        },
      },
    ]);

    return NextResponse.json(top3Results, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
