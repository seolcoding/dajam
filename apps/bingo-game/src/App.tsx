import { useBingoStore } from './stores/useBingoStore';
import { MenuScreen } from './components/MenuScreen';
import { GameSetupScreen } from './components/GameSetupScreen';
import { JoinGameScreen } from './components/JoinGameScreen';
import { HostScreen } from './components/HostScreen';
import { PlayerScreen } from './components/PlayerScreen';

function App() {
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

export default App;
