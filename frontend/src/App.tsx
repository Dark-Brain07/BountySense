import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Hexagon, Plus, LogOut, Wallet } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import Home from './pages/Home';
import CreateBounty from './pages/CreateBounty';
import BountyDetail from './pages/BountyDetail';
import './index.css';

function App() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  return (
    <Router>
      <div className="container">
        <header className="header animate-fade-in">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Hexagon size={20} color="white" fill="white" />
            </div>
            <span className="gradient-text">BountySense</span>
          </Link>
          
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/create" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} />
              Create Bounty
            </Link>
            
            {ready && authenticated ? (
              <button onClick={logout} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={18} />
                {user?.wallet?.address.substring(0, 6)}...
              </button>
            ) : (
              <button onClick={login} disabled={!ready} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={18} />
                Connect
              </button>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateBounty />} />
            <Route path="/bounty/:id" element={<BountyDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
