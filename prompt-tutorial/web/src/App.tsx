import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Chapter } from '@/pages/Chapter';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { IntroModal } from '@/components/IntroModal';

function App() {
  return (
    <HashRouter>
      <IntroModal />
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 lg:ml-64 pb-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chapter/:chapterId" element={<Chapter />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
