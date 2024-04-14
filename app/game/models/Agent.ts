import { Rect, STAMINA_BAR_HEIGHT } from "@/app/game/components/Sketch";
import * as p5 from "p5";

export const AGENT_SIZE = 10;

export interface AgentMovement {
  time: number;
  position: p5.Vector;
}

export class Agent {
  p: p5;
  position: p5.Vector;
  velocity: p5.Vector;
  isRunning: boolean;
  isExhausted: boolean;
  stamina: number;
  movements: AgentMovement[] = [];
  private isControlled: boolean;
  private isActive: boolean; // スタートしててゴールしていない
  private movingArea: Rect;
  static readonly Vmax: number = 1;
  static readonly k: number = 0.01;
  static readonly dt: number = 1;
  static readonly Trun: number = 3;
  static readonly staminaDecreaseRate: number = 0.01;
  static readonly staminaRecoveryRate: number = 0.005;

  lastRecordedTime: number; // 最後に記録された時間
  static readonly recordInterval: number = 0.05; // 記録間隔（ミリ秒）

  constructor(
    p: p5,
    x: number,
    y: number,
    movingArea: Rect,
    isControlled?: boolean,
    movements?: AgentMovement[]
  ) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p.createVector(0, 0);
    this.movingArea = movingArea;
    this.isControlled = isControlled ? true : false;

    if (movements) {
      this.movements = movements;
    }

    this.isRunning = false;
    this.isExhausted = false;
    this.stamina = 1;
    this.isActive = true;
    this.lastRecordedTime = -1;
  }

  update() {
    this.updateStamina();
    this.updateVelocity();
    this.position.add(this.velocity.copy().mult(Agent.dt));
    this.constrainPosition();
  }

  display() {
    if (!this.getIsActive()) return;

    // 操作中のエージェントは特別な色で表示
    if (this.isControlled) {
      this.p.fill(150, 150, 250); // 例: 赤色
    } else {
      this.p.fill(255); // 通常色
    }

    this.p.ellipse(this.position.x, this.position.y, 10, 10);
  }

  updateStamina() {
    if (this.isRunning) {
      this.stamina = Math.max(this.stamina - Agent.staminaDecreaseRate, 0);
      if (this.stamina <= 0) {
        this.stamina = 0;
        this.isRunning = false;
        this.isExhausted = true;
      }
    } else {
      this.stamina = Math.min(1, this.stamina + Agent.staminaRecoveryRate);
      if (this.stamina === 1) {
        this.isExhausted = false;
      }
    }
  }

  updateVelocity() {
    const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY);
    const desiredVelocity = p5.Vector.sub(mouse, this.position).mult(Agent.k);
    if (this.isRunning) {
      desiredVelocity.setMag(Agent.Vmax * 2);
    } else if (desiredVelocity.mag() > Agent.Vmax) {
      desiredVelocity.setMag(Agent.Vmax);
    }
    this.velocity.lerp(desiredVelocity, 0.2);
  }

  constrainPosition() {
    this.position.x = this.p.constrain(
      this.position.x,
      0,
      this.movingArea.width
    );
    this.position.y = this.p.constrain(
      this.position.y,
      STAMINA_BAR_HEIGHT,
      this.movingArea.height
    );
  }

  run() {
    if (!this.isExhausted) {
      this.isRunning = true;
    }
  }

  walk() {
    this.isRunning = false;
  }

  setIsActive(isActive: boolean) {
    this.isActive = isActive;
  }
  getIsActive() {
    return this.isActive;
  }
  setIsControlled(isControlled: boolean) {
    this.isControlled = isControlled;
  }

  // 記録・再生
  // エージェントの動きを記録するメソッド
  recordMovement(time: number) {
    // スロットリング
    if (time - this.lastRecordedTime > Agent.recordInterval) {
      this.movements.push({
        time: time,
        position: this.position.copy(),
      });
    }
  }
  // 特定の時間におけるエージェントの位置を再現するメソッド
  replayMovements(time: number) {
    if (this.movements.length === 0) return; // 動きが記録されていない場合は何もしない

    const lastMovement = this.movements[this.movements.length - 1];
    const firstMovement = this.movements[0];
    // 移動記録がない時間については表示しない
    if (time < firstMovement.time || time >= lastMovement.time) {
      this.setIsActive(false);
      return;
    } else {
      this.setIsActive(true);
    }
    const relevantMovement = this.movements.reduce((prev, current) => {
      return Math.abs(current.time - time) < Math.abs(prev.time - time)
        ? current
        : prev;
    });

    if (relevantMovement) {
      this.position = relevantMovement.position;
      this.isActive = true;
    }
  }
}
