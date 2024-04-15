import {
  addLeaderboardEntry,
  getTopLeaderboardEntries,
} from "@/lib/LeaderBoard";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const topEntries = await getTopLeaderboardEntries();
    return NextResponse.json(topEntries);
  } catch (error) {
    console.error("Failed to fetch leaderboard entries:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { score, gameSeedId, playerName } = await request.json();
    await addLeaderboardEntry(score, gameSeedId, playerName);
    return NextResponse.json({
      message: "Leaderboard entry added successfully",
    });
  } catch (error) {
    console.error("Failed to add leaderboard entry:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
