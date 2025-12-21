import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import CreatePage from './pages/CreatePage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/create" element={<CreatePage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
