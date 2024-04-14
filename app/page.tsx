"use client";
import dynamic from "next/dynamic";

const WalkSim = dynamic(
  () => import("@/app/game/components/Sketch").then((mod) => mod.WalkSim),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <WalkSim />
    </>
  );
}
