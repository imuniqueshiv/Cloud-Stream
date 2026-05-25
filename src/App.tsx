import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';

import Home from './pages/Home';
import Player from './pages/Player';
import Search from './pages/Search';
import Library from './pages/Library';
import Settings from './pages/Settings';
import Details from './pages/Details';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />

          {/* Details Page */}
          <Route
            path="/title/:type/:id"
            element={<Details />}
          />

          {/* Player */}
          <Route
            path="/player/:id"
            element={<Player />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;