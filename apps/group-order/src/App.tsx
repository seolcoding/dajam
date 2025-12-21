import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CreateSessionPage } from './pages/CreateSessionPage';
import { HostDashboardPage } from './pages/HostDashboardPage';
import { JoinSessionPage } from './pages/JoinSessionPage';
import { SummaryPage } from './pages/SummaryPage';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateSessionPage />} />
        <Route path="/host/:sessionId" element={<HostDashboardPage />} />
        <Route path="/join/:sessionId" element={<JoinSessionPage />} />
        <Route path="/summary/:sessionId" element={<SummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
