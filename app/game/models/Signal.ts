import p5Types from "p5";

export class Signal {
  private p: p5Types;
  private x: number;
  private y: number;
  private size: number;
  private isRed: boolean;
  private isYellow: boolean;
  private timeLimit: number;
  private static readonly YELLOW_DURATION = 3; // 信号が黄色になる時間（秒）

  constructor(
    p: p5Types,
    x: number,
    y: number,
    size: number,
    timeLimit: number
  ) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = size;
    this.isRed = false;
    this.isYellow = false;
    this.timeLimit = timeLimit;
  }

  public getIsRed() {
    return this.isRed;
  }

  public update(currentTime: number) {
    this.isRed = currentTime >= this.timeLimit;
    this.isYellow =
      !this.isRed && currentTime > this.timeLimit - Signal.YELLOW_DURATION;
  }

  public display(currentTime: number) {
    this.p.fill(128);
    this.p.rect(this.x, this.y - this.size - 5, this.size, this.size * 3 + 10);

    if (this.isRed) {
      this.p.fill(255, 0, 0);
    } else {
      this.p.fill(128);
    }
    this.p.ellipse(
      this.x + this.size / 2,
      this.y - this.size,
      this.size,
      this.size
    );

    if (this.isYellow) {
      this.p.fill(255, 255, 0);
    } else {
      this.p.fill(128);
    }
    this.p.ellipse(this.x + this.size / 2, this.y, this.size, this.size);

    if (!this.isRed && !this.isYellow) {
      this.p.fill(0, 255, 0);
    } else {
      this.p.fill(128);
    }
    this.p.ellipse(
      this.x + this.size / 2,
      this.y + this.size,
      this.size,
      this.size
    );
    // 時間表示
    this.p.fill(255);
    this.p.textSize(20);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text(
      `${(this.timeLimit - currentTime).toFixed(0)}`,
      this.x + this.size / 2,
      this.y + 3 * this.size
    );
  }
}
