import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { readContract } from '../lib/genlayer';

export default function Home() {
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBounties() {
      try {
        const result = await readContract('list_bounties');
        setBounties(result.bounties || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load bounties from GenLayer network.');
      } finally {
        setLoading(false);
      }
    }
    
    loadBounties();
    
    const interval = setInterval(loadBounties, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Evaluate Work with <span className="gradient-text">AI Consensus</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          BountySense uses GenLayer's Intelligent Contracts to automatically review and pay out subjective, natural-language tasks without a central judge.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Explore Bounties</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--primary)" />
        </div>
      </div>

      {loading && bounties.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : bounties.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>No active bounties found</h3>
          <p>Be the first to create a Bounty!</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Bounty</Link>
        </div>
      ) : (
        <div className="bounty-grid">
          {bounties.map(bounty => (
            <div key={bounty.bid} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge badge-${bounty.status.toLowerCase()}`}>
                  {bounty.status}
                </span>
                <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>
                  {(Number(bounty.bounty_atto) / 1e18).toFixed(2)} GEN
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0', flex: 1, wordBreak: 'break-word' }}>
                {bounty.bid}
              </h3>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                Creator: {bounty.creator.substring(0,6)}...{bounty.creator.substring(38)}
              </p>
              
              <Link to={`/bounty/${bounty.bid}`} className="btn btn-outline" style={{ marginTop: 'auto', width: '100%' }}>
                View Details <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
