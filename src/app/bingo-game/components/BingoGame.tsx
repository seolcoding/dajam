'use client';

import { useBingoStore } from '../stores/useBingoStore';
import { MenuScreen } from './MenuScreen';
import { GameSetupScreen } from './GameSetupScreen';
import { JoinGameScreen } from './JoinGameScreen';
import { HostScreen } from './HostScreen';
import { PlayerScreen } from './PlayerScreen';

export function BingoGame() {
  const gameMode = useBingoStore((state) => state.gameMode);

  return (
    <div className="min-h-screen">
      {gameMode === 'menu' && <MenuScreen />}
      {gameMode === 'setup' && <GameSetupScreen />}
      {gameMode === 'join' && <JoinGameScreen />}
      {gameMode === 'host' && <HostScreen />}
      {gameMode === 'player' && <PlayerScreen />}
    </div>
  );
}
