import p5Types, * as p5 from "p5"; //Import this for typechecking and intellisense

export class SafeZone {
  private p: p5Types;
  private position: p5.Vector;
  private size: number;
  private color: p5.Color;
  private defaultColor: p5.Color;
  private hoverColor: p5.Color;
  private isSelectable: boolean;
  private id: string;

  constructor(p: p5Types, x: number, y: number, size: number, id: string) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.size = size;
    this.defaultColor = p.color(200);
    this.hoverColor = p.color(150);
    this.color = this.defaultColor;
    this.isSelectable = true;
    this.id = id;
  }

  display(): void {
    if (this.isSelectable) {
      this.p.stroke(150); // 緑色の枠
    } else {
      this.p.noStroke();
    }
    this.p.fill(this.color);
    this.p.rect(this.position.x, this.position.y, this.size, this.size);
    this.p.noStroke();
  }

  public contains(point: p5.Vector): boolean {
    return (
      point.x >= this.position.x &&
      point.x <= this.position.x + this.size &&
      point.y >= this.position.y &&
      point.y <= this.position.y + this.size
    );
  }

  getId() {
    return this.id;
  }

  setIsSelectable(isSelectable: boolean) {
    this.isSelectable = isSelectable;
  }

  getCenter(): p5.Vector {
    return this.p.createVector(
      this.position.x + this.size / 2,
      this.position.y + this.size / 2
    );
  }
  onClick(callback: () => void) {
    if (
      this.p.mouseIsPressed &&
      this.contains(this.p.createVector(this.p.mouseX, this.p.mouseY))
    ) {
      callback();
    }
  }

  setHover(isHover: boolean): void {
    this.color = isHover ? this.hoverColor : this.defaultColor;
  }
}
