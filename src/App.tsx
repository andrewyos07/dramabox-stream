import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import Home from './pages/Home';
import SeriesDetail from './pages/SeriesDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="md:hidden">
        <MobileNavbar />
      </div>
      <div className="hidden md:block">
        <Navbar />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
