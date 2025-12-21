import type { Question } from '../types';

export interface ResultImageOptions {
  question: Question;
  myChoice: 'A' | 'B';
  stats: { A: number; B: number };
  percentageA: number;
  percentageB: number;
}

// Polyfill for roundRect if not available
function ensureRoundRect() {
  if (typeof (CanvasRenderingContext2D.prototype as any).roundRect !== 'function') {
    (CanvasRenderingContext2D.prototype as any).roundRect = function (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) {
      let radius = r;
      if (w < 2 * radius) radius = w / 2;
      if (h < 2 * radius) radius = h / 2;
      this.beginPath();
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }
}

export const generateResultImage = async (
  options: ResultImageOptions
): Promise<Blob> => {
  const { question, myChoice, stats, percentageA, percentageB } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Ensure roundRect is available
    ensureRoundRect();

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('밸런스 게임 결과', 600, 60);

    // Question title
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(question.title, 600, 130);

    // Option A box
    const boxAX = 100;
    const boxAY = 200;
    const boxWidth = 450;
    const boxHeight = 350;

    ctx.fillStyle = myChoice === 'A' ? '#0088FE' : '#4B5563';
    (ctx as any).roundRect(boxAX, boxAY, boxWidth, boxHeight, 20);
    ctx.fill();

    // Option A text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(question.optionA, boxAX + boxWidth / 2, boxAY + 100);

    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(`${percentageA.toFixed(1)}%`, boxAX + boxWidth / 2, boxAY + 200);

    ctx.font = '24px sans-serif';
    ctx.fillText(`${stats.A.toLocaleString()}명`, boxAX + boxWidth / 2, boxAY + 250);

    if (myChoice === 'A') {
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('✓ 나의 선택', boxAX + boxWidth / 2, boxAY + 300);
    }

    // Option B box
    const boxBX = 650;
    const boxBY = 200;

    ctx.fillStyle = myChoice === 'B' ? '#FF8042' : '#4B5563';
    (ctx as any).roundRect(boxBX, boxBY, boxWidth, boxHeight, 20);
    ctx.fill();

    // Option B text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(question.optionB, boxBX + boxWidth / 2, boxBY + 100);

    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(`${percentageB.toFixed(1)}%`, boxBX + boxWidth / 2, boxBY + 200);

    ctx.font = '24px sans-serif';
    ctx.fillText(`${stats.B.toLocaleString()}명`, boxBX + boxWidth / 2, boxBY + 250);

    if (myChoice === 'B') {
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('✓ 나의 선택', boxBX + boxWidth / 2, boxBY + 300);
    }

    // Bottom branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('seolcoding.com/mini-apps/balance-game', 600, 600);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/png');
  });
};

export const downloadImage = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const copyImageToClipboard = async (blob: Blob): Promise<void> => {
  if (!navigator.clipboard || !ClipboardItem) {
    throw new Error('Clipboard API not supported');
  }

  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
};
