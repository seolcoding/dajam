import type { SoundEffect } from '@/types/bingo.types';

/**
 * Simple beep sound generator using Web Audio API
 */
class SoundManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Play a simple beep sound
   */
  playBeep(frequency: number, duration: number, volume: number = 0.3): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Play predefined sound effects
   */
  play(effect: SoundEffect): void {
    switch (effect) {
      case 'mark':
        this.playBeep(800, 0.1, 0.2);
        break;
      case 'call':
        this.playBeep(600, 0.15, 0.25);
        break;
      case 'bingo':
        // 상승 멜로디
        this.playBeep(523, 0.15, 0.3); // C
        setTimeout(() => this.playBeep(659, 0.15, 0.3), 150); // E
        setTimeout(() => this.playBeep(784, 0.3, 0.3), 300); // G
        break;
      case 'win':
        // 승리 팡파르
        this.playBeep(523, 0.15, 0.3);
        setTimeout(() => this.playBeep(659, 0.15, 0.3), 100);
        setTimeout(() => this.playBeep(784, 0.15, 0.3), 200);
        setTimeout(() => this.playBeep(1047, 0.4, 0.3), 300);
        break;
    }
  }
}

export const soundManager = new SoundManager();

/**
 * Play sound effect with store check
 */
export function playSoundEffect(effect: SoundEffect): void {
  soundManager.play(effect);
}
