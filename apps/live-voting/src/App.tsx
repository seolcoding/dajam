import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CreatePoll } from './components/CreatePoll';
import { VoteView } from './components/VoteView';
import { HostView } from './components/HostView';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/vote/:pollId" element={<VoteView />} />
        <Route path="/host/:pollId" element={<HostView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
