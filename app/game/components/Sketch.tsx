"use client";
import p5Types, * as p5 from "p5"; //Import this for typechecking and intellisense

import RankingBattle from "@/app/game/components/RankingBattle";
import ScoreRelay from "@/app/game/components/ScoreRelay";
import { useRankingBattle } from "@/app/game/hooks/useRankingBattle";
import { useScoreRelay } from "@/app/game/hooks/useScoreRelay";
import {
  Box,
  Flex,
  Heading,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useState } from "react";
import Sketch from "react-p5";
import { AgentRecord, GameRecord, GameResult } from "../hooks/useScoreRelay_";
import { Agent, AGENT_SIZE } from "../models/Agent";
import { SafeZone } from "../models/SafeZone";
import { Signal } from "../models/Signal";

type GameMode = "scoreRelay" | "rankingBattle";

export type SafeZoneName = "tl" | "tr" | "bl" | "br";
export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface WalkSimProps {
  // Your component props
}

const TIME_LIMIT = 11;

// 信号機と疲労度バーのエリア
export const SIGNAL_AREA_WIDTH = 50; // 信号機領域の幅
export const STAMINA_BAR_HEIGHT = 10;
// 実際の描画領域の寸法（信号機と疲労度バーのエリアを除く）
const movingArea: Rect = {
  x: 0,
  y: STAMINA_BAR_HEIGHT,
  width: 500,
  height: 500,
};
// キャンバスの基本寸法
const CANVAS_WIDTH = movingArea.width + SIGNAL_AREA_WIDTH;
const CANVAS_HEIGHT = movingArea.height + STAMINA_BAR_HEIGHT;

const GAMEOVER_LIMIT = 4;

let controllingAgent: Agent | null;
const SAFE_ZONE_SIZE: number = 80;
let safeZones: SafeZone[] = [];
let startingSafeZone: SafeZone | null = null;
let signal: Signal;

export const WalkSim: React.FC<WalkSimProps> = (props: WalkSimProps) => {
  const [isNewTurn, setIsNewTurn] = useState(true);
  const [isNewGame, setIsNewGame] = useState(true);
  const [isMissed, setIsMissed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentGameSeedId, setCurrentGameSeedId] = useState<string | null>(
    null
  );
  const [inheritedRecord, setInheritedRecord] = useState<GameRecord | null>(
    null
  );
  const [pastAgents, setPastAgents] = useState<Agent[]>([]);
  const [top3Results, setTop3Results] = useState<GameResult[]>([]);
  const [isWaitingAsync, setIsWaitingAsync] = useState<boolean>(false);
  const [gameOverCount, setGameOverCount] = useState<number>(0);

  const [name, setName] = useState<string>("ななし");

  const { saveGameRecord, getGameRecord, getTop3Results } = useScoreRelay();
  const { addLeaderboardEntry, getTopLeaderboardEntries } = useRankingBattle();
  const [leaderboardResult, setLeaderboardResult] = useState<GameResult[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("rankingBattle");

  useEffect(() => {
    const fetchResults = async () => {
      // スコアリレー
      const top3Results = await getTop3Results();
      setTop3Results(top3Results);
      // ランキングバトル
      const newLeaderboard = await getTopLeaderboardEntries();
      setLeaderboardResult(newLeaderboard);
    };
    fetchResults();
  }, [getTop3Results, getTopLeaderboardEntries]);

  // 初回の読み込み
  const onStartNewScoreRelay = useCallback(
    async (gameSeedId?: string) => {
      setGameMode("scoreRelay");
      setInheritedRecord(() => null);
      let newGameSeedId: string | null = null;
      if (gameSeedId) {
        const gameRecord = await getGameRecord(gameSeedId);
        if (gameRecord) {
          setInheritedRecord(gameRecord);
          newGameSeedId = gameSeedId;
        }
      }
      setIsNewGame(() => true);

      setCurrentGameSeedId(() => {
        return newGameSeedId ? newGameSeedId : nanoid();
      });
    },
    [getGameRecord]
  );

  const onStartNewRankingBattle = () => {
    setGameMode("rankingBattle");
    setIsNewGame(() => true);
  };

  const startNewGame = useCallback(
    (p: p5) => {
      setCurrentGameSeedId(nanoid());
      pastAgents.splice(0, pastAgents.length);
      // 設定を初期化
      setInheritedRecord(null);
    },
    [pastAgents]
  );
  const startInheritedGame = useCallback(
    (p: p5) => {
      if (!inheritedRecord) return;
      // 要素を空にして、新しい記録を入れる
      pastAgents.splice(
        0,
        pastAgents.length,
        ...inheritedRecord.agentRecords.map((agentRecord) => {
          const agent = new Agent(
            p,
            0,
            0,
            movingArea,
            false,
            agentRecord.movements
          );
          return agent;
        })
      );
    },
    [inheritedRecord, pastAgents]
  );

  const startGame = useCallback(
    (p: p5) => {
      if (!isNewGame) return;
      if (gameMode === "scoreRelay" && inheritedRecord) {
        startInheritedGame(p);
      } else {
        startNewGame(p);
      }
      controllingAgent = null;
      startingSafeZone = null;

      setGameOverCount(0);
      // まずは始まりの歩道を選ぶ
      setIsNewTurn(true);
      setIsNewGame(false);
    },
    [gameMode, inheritedRecord, isNewGame, startInheritedGame, startNewGame]
  );

  // 新しいターンの処理
  async function processNewTurn(p: p5) {
    // TODO: 最新のresultを取得
    if (!isNewTurn) return;
    // 新しいターンの場合
    // まずは歩道を選ぶ
    for (const safeZone of safeZones) {
      // 始める歩道を選択した時
      safeZone.onClick(async () => {
        // 時間を0に
        setCurrentTime(() => 0);
        setElapsedTime(() => {
          return p.millis() / 1000;
        });
        // ターンを開始
        setIsNewTurn(false);
        setIsWaitingAsync(() => true);
        startingSafeZone = safeZone;

        // 歩道を選んだ時、歩道の中央にコントロールするAgentを配置
        const startPosition = p.createVector(
          safeZone.getCenter().x,
          safeZone.getCenter().y
        );
        controllingAgent = new Agent(
          p,
          startPosition.x,
          startPosition.y,
          movingArea,
          true
        );
        // 過去のエージェントを取得
        if (currentGameSeedId && gameMode === "scoreRelay") {
          setIsWaitingAsync(() => true);
          const newGameRecord = await getGameRecord(currentGameSeedId);
          setIsWaitingAsync(() => false);
          if (newGameRecord) {
            const newPastAgents = newGameRecord.agentRecords.map(
              (agentRecord) => {
                return new Agent(
                  p,
                  0,
                  0,
                  movingArea,
                  false,
                  agentRecord.movements
                );
              }
            );
            setPastAgents(() => newPastAgents);
          }
        }
      });
      // 歩道の選択可能状態を解除
      for (const safeZone of safeZones) {
        safeZone.setIsSelectable(false);
        safeZone.setHover(false);
      }
      setIsWaitingAsync(() => false);
    }
  }

  // ターンが終了したかを判定し、処理
  async function checkTurnEndAndProcess(p: p5) {
    if (!isNewTurn && controllingAgent) {
      // Agentがいる歩道を探す
      const currentSafeZone = safeZones.find(
        (safeZone) =>
          controllingAgent && safeZone.contains(controllingAgent.position)
      );
      let turnEnded = false;
      // エージェントが最初のセーフゾーンとは異なるセーフゾーンにいる場合 => ターンクリア
      const success =
        currentSafeZone && currentSafeZone.getId() != startingSafeZone?.getId();

      // ターン成功
      if (success) {
        setIsNewTurn(true);
        startingSafeZone = null; // 開始時のセーフゾーンをリセット
        const record: AgentRecord = {
          movements: controllingAgent.movements,
          name: name,
        };

        if (gameMode === "rankingBattle") {
          if (controllingAgent !== null) {
            controllingAgent.setIsControlled(false);
            const copiedControllingAgent = controllingAgent.copyAgent();
            setPastAgents((prev) => {
              const newPastAgents = prev;
              if (!copiedControllingAgent) return prev;
              newPastAgents.push(copiedControllingAgent);
              return newPastAgents;
            });
          }
        }
        controllingAgent = null;
        turnEnded = true;

        if (currentGameSeedId && gameMode === "scoreRelay") {
          setIsWaitingAsync(() => true);
          await saveGameRecord(
            pastAgents.length + 1,
            currentGameSeedId,
            record
          );
          setIsWaitingAsync(() => false);
        }
      } else {
        // 衝突した場合
        const failedByCollision =
          !currentSafeZone && checkCollision(p, controllingAgent, pastAgents);
        // 信号が赤になる前にエージェントがセーフゾーンに到達できなかった場合
        const failedByTimeOver = TIME_LIMIT < currentTime;
        if (failedByCollision || failedByTimeOver) {
          setGameOverCount((prev) => prev + 1);
          controllingAgent = null;
          startingSafeZone = null;
          setIsMissed(true);
          turnEnded = true;
        }
      }
      if (turnEnded) {
        // ランキングを更新
        if (gameMode === "scoreRelay") {
          setIsWaitingAsync(() => true);
          const top3Results = await getTop3Results();
          setIsWaitingAsync(() => false);
          setTop3Results(top3Results);
        }
        if (gameMode === "rankingBattle") {
          let score;
          setIsWaitingAsync(() => true);
          const newLeaderboard = await getTopLeaderboardEntries();
          setIsWaitingAsync(() => false);
          setLeaderboardResult(newLeaderboard);

          if (GAMEOVER_LIMIT <= gameOverCount) {
            setIsNewGame(true);
            setGameOverCount(0);
          } else {
            if (currentGameSeedId) {
              setIsWaitingAsync(() => true);
              await addLeaderboardEntry(
                pastAgents.length + 1,
                currentGameSeedId,
                name
              );
              setIsWaitingAsync(() => false);
            }
          }
        }
      }
    }
  }

  function drawDefaultView(p: p5) {
    p.background(220);
    // 歩道を描画
    initializeSafeZones(p);
    // キャンバスの右端部分の背景色を変更
    p.fill(100);
    p.noStroke();
    p.rect(movingArea.width, 0, SIGNAL_AREA_WIDTH, CANVAS_HEIGHT);

    p.fill(250);
    p.rect(0, 0, CANVAS_WIDTH, STAMINA_BAR_HEIGHT);
    //歩道を描画
    for (const safeZone of safeZones) {
      safeZone.display();
    }

    p.color(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.text(
      `${pastAgents.length.toFixed(0)}`,
      movingArea.width + SIGNAL_AREA_WIDTH / 2,
      STAMINA_BAR_HEIGHT + 20
    );
    p.textSize(20);
    p.text(
      `pt`,
      movingArea.width + SIGNAL_AREA_WIDTH / 2,
      STAMINA_BAR_HEIGHT + 40
    );

    p.text(
      `🚶`,
      movingArea.width + SIGNAL_AREA_WIDTH / 2,
      STAMINA_BAR_HEIGHT + movingArea.height - 45
    );
    p.text(
      `x ${GAMEOVER_LIMIT - gameOverCount}`,
      movingArea.width + SIGNAL_AREA_WIDTH / 2,
      STAMINA_BAR_HEIGHT + movingArea.height - 20
    );
  }

  // マウス操作
  function mousePressed() {
    if (isMissed) {
      // ミスで終了した時
      setIsNewTurn(true);
      setIsMissed(false);
    } else if (controllingAgent) {
      // agentを操作中の時
      controllingAgent.run();
    }
  }
  function mouseReleased() {
    if (controllingAgent) controllingAgent.walk();
  }

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).parent(canvasParentRef);

    // 信号機を描画
    const signalSize = 30;
    const signalX = p5.width - SIGNAL_AREA_WIDTH / 2 - signalSize / 2;
    const signalY = p5.height / 2;
    signal = new Signal(p5, signalX, signalY, signalSize, TIME_LIMIT);
  };

  const draw = async (p5: p5Types) => {
    if (isWaitingAsync) return;
    // ゲームを開始
    if (isNewGame) {
      startGame(p5);
    }

    if (isNewTurn) {
      processNewTurn(p5);
    }

    if (!isNewTurn && !isMissed) {
      setCurrentTime(() => {
        return p5.millis() / 1000 - elapsedTime;
      });
    }

    drawDefaultView(p5);

    if (controllingAgent) {
      if (!isMissed && !isNewTurn) {
        controllingAgent.recordMovement(currentTime);
      }

      controllingAgent.update();
      controllingAgent.display();
      setIsWaitingAsync(() => true);
      await checkTurnEndAndProcess(p5);
      setIsWaitingAsync(() => false);
    }

    // 過去のターンの動きを再生
    for (const pastAgent of pastAgents) {
      pastAgent.replayMovements(currentTime);
      pastAgent.display();
    }

    // 信号機を更新・描画
    signal.update(currentTime);
    signal.display(currentTime);

    displayStaminaBar(p5);

    if (isMissed) {
      // ゲームオーバーメッセージの表示
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(32);
      p5.text("Retry", p5.width / 2, p5.height / 2);
    }
  };
  return (
    <Box p={5} bg="gray.50">
      <VStack spacing={5}>
        <Heading>🚶‍♀️ 渋谷スクランブル交差点シミュレータ 🚶‍♂️</Heading>
        <Text>誰にもぶつからず、赤になる前に、歩道から歩道へ移動する</Text>
        <Tabs isFitted variant="enclosed" colorScheme="blue" defaultIndex={1}>
          <Flex direction={{ base: "column", lg: "row" }}>
            <Sketch
              setup={setup}
              draw={draw}
              mousePressed={mousePressed}
              mouseReleased={mouseReleased}
            />
            <VStack w="450px">
              <Flex alignItems="center">
                <Text fontSize="lg" w="5rem">
                  名前:
                </Text>
                <Input
                  placeholder="名前を入力"
                  size="md"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </Flex>
              <TabList mb={1} w="100%">
                <Tab isDisabled>
                  協力プレイ (工事中) {gameMode === "scoreRelay" && "✔️"}
                </Tab>
                <Tab>
                  ランキングバトル {gameMode === "rankingBattle" && "✔️"}
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Text fontSize="md" h="2rem">
                    Top3の続きからもプレイできるモードです。
                  </Text>
                </TabPanel>
                <TabPanel>
                  <Text fontSize="md" h="2rem">
                    他の人と競い、ハイスコアを目指すモード。接触・時間切れは５回以内。
                  </Text>
                </TabPanel>
              </TabPanels>
              <TabPanels>
                <TabPanel>
                  <ScoreRelay
                    results={top3Results}
                    onStartNewGame={onStartNewScoreRelay}
                    currentGameSeedId={currentGameSeedId}
                  />
                </TabPanel>
                <TabPanel>
                  <RankingBattle
                    results={leaderboardResult}
                    onStartNewGame={onStartNewRankingBattle}
                  />
                </TabPanel>
              </TabPanels>
            </VStack>
          </Flex>
        </Tabs>
      </VStack>
    </Box>
  );
};

function displayStaminaBar(p: p5) {
  if (controllingAgent) {
    if (controllingAgent.isExhausted) {
      p.fill(255, 165, 0);
    } else {
      p.fill(100);
    }
    const fatigueBarLength = controllingAgent.stamina * p.width;
    p.rect(0, 0, fatigueBarLength, STAMINA_BAR_HEIGHT);
  }
}

function isInSafeZone(position: p5.Vector): boolean {
  for (const safeZone of safeZones) {
    if (safeZone.contains(position)) {
      return true;
    }
  }
  return false;
}

function checkCollision(p: p5, agent: Agent, pastAgents: Agent[]): boolean {
  if (isInSafeZone(agent.position)) {
    return false;
  }
  // 他のエージェントとの衝突判定
  for (const otherAgent of pastAgents) {
    if (
      otherAgent !== agent &&
      otherAgent.getIsActive() &&
      p5.Vector.dist(
        p.createVector(agent.position.x, agent.position.y),
        p.createVector(otherAgent.position.x, otherAgent.position.y)
      ) < AGENT_SIZE
    ) {
      return true;
    }
  }
  return false;
}

// セーフゾーンの初期化
function initializeSafeZones(p: p5) {
  safeZones = [
    new SafeZone(p, 0, movingArea.y, SAFE_ZONE_SIZE, "lt"),
    new SafeZone(
      p,
      movingArea.width - SAFE_ZONE_SIZE,
      STAMINA_BAR_HEIGHT,
      SAFE_ZONE_SIZE,
      "rt"
    ),
    new SafeZone(
      p,
      0,
      movingArea.y + movingArea.height - SAFE_ZONE_SIZE,
      SAFE_ZONE_SIZE,
      "lb"
    ),
    new SafeZone(
      p,
      movingArea.width - SAFE_ZONE_SIZE,
      movingArea.y + movingArea.height - SAFE_ZONE_SIZE,
      SAFE_ZONE_SIZE,
      "rb"
    ),
  ];
}
