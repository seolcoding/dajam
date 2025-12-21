/**
 * Ladder Game Type Definitions
 */

export interface Bridge {
  id: string;
  fromColumn: number;
  toColumn: number;
  row: number; // 0.0 ~ 1.0 (상대 좌표)
}

export interface LadderData {
  columnCount: number;
  bridges: Bridge[];
  rowHeight: number;
  minBridgeGap: number;
}

export interface PathPoint {
  x: number;
  y: number;
  direction: 'down' | 'right' | 'left';
}

export interface Participant {
  id: string;
  name: string;
  order: number;
}

export interface Result {
  id: string;
  label: string;
  order: number;
}

export type RevealMode = 'instant' | 'sequential' | 'simultaneous' | 'manual';
export type Theme = 'light' | 'dark' | 'colorful';

export interface LadderConfig {
  density: number; // 0.3 ~ 0.8
  theme: Theme;
  revealMode: RevealMode;
}

export interface CanvasConfig {
  width: number;
  height: number;
  padding: number;
  lineWidth: number;
  colors: {
    line: string;
    text: string;
    highlight: string;
    background: string;
  };
}

export interface TraceResult {
  endColumn: number;
  path: PathPoint[];
  bridgesCrossed: Bridge[];
}

export interface LadderState {
  participants: Participant[];
  results: Result[];
  ladder: LadderData | null;
  config: LadderConfig;
  isAnimating: boolean;
  currentAnimatingIndex: number;
  revealed: Map<string, string>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface InputConfig {
  participants: string[];
  results: string[];
}
