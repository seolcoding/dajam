import type { WheelItem } from "@/types";

/**
 * Canvas 기반 룰렛 휠 렌더러
 */
export class WheelRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private centerX: number = 0;
  private centerY: number = 0;
  private radius: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Cannot get 2D context");
    }
    this.ctx = ctx;
    this.resize();
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;

    const size = Math.min(container.clientWidth, container.clientHeight);
    this.canvas.width = size * window.devicePixelRatio;
    this.canvas.height = size * window.devicePixelRatio;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size * 0.45; // 90% of container
  }

  drawWheel(items: WheelItem[], rotation: number) {
    if (items.length === 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const anglePerItem = (Math.PI * 2) / items.length;

    items.forEach((item, index) => {
      const startAngle = rotation * (Math.PI / 180) + index * anglePerItem;
      const endAngle = startAngle + anglePerItem;

      // Draw sector
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = item.color;
      this.ctx.fill();

      // Draw border
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw label
      this.drawLabel(item.label, startAngle, endAngle);
    });

    this.drawPointer();
    this.drawCenterButton();
  }

  private drawLabel(text: string, startAngle: number, endAngle: number) {
    const middleAngle = (startAngle + endAngle) / 2;
    const textRadius = this.radius * 0.7;

    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(middleAngle);
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 16px sans-serif";

    // Text shadow for better readability
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    this.ctx.shadowBlur = 3;
    this.ctx.fillText(text, textRadius - 10, 0);
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
  }

  private drawPointer() {
    const pointerSize = 35;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, 0);
    this.ctx.lineTo(this.centerX - pointerSize / 2, pointerSize);
    this.ctx.lineTo(this.centerX + pointerSize / 2, pointerSize);
    this.ctx.closePath();
    this.ctx.fillStyle = "#9333ea"; // purple-600
    this.ctx.fill();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  private drawCenterButton() {
    const buttonRadius = 55;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, buttonRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#9333ea"; // purple-600
    this.ctx.fill();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    // "SPIN" text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 20px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("SPIN", this.centerX, this.centerY);
  }
}
