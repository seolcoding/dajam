'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  bgColor?: string;
  fgColor?: string;
}

export function QRCodeSVG({
  value,
  size = 200,
  level = 'M',
  includeMargin = true,
  bgColor = '#ffffff',
  fgColor = '#000000',
}: QRCodeSVGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: includeMargin ? 4 : 0,
        errorCorrectionLevel: level,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
    }
  }, [value, size, level, includeMargin, bgColor, fgColor]);

  return <canvas ref={canvasRef} />;
}
