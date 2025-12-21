import { useGameStore } from './store/gameStore';
import { GameSettings } from './pages/GameSettings';
import { GamePlay } from './pages/GamePlay';
import { GameResult } from './pages/GameResult';

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase);

  return (
    <>
      {gamePhase === 'settings' && <GameSettings />}
      {gamePhase === 'playing' && <GamePlay />}
      {gamePhase === 'result' && <GameResult />}
    </>
  );
}

export default App;
