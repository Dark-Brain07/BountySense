import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { readContract, makeWalletClient, writeContract } from '../lib/genlayer';
import { usePrivy, useWallets } from '@privy-io/react-auth';

export default function BountyDetail() {
  const { id } = useParams();
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [bounty, setBounty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBounty() {
      try {
        const result = await readContract('get_bounty', [id]);
        setBounty(result);
      } catch (err) {
        console.error(err);
        setError('Bounty not found or error loading.');
      } finally {
        setLoading(false);
      }
    }
    fetchBounty();
    const interval = setInterval(fetchBounty, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated || !wallets.length) {
      login();
      return;
    }
    
    if (!url) return;
    setSubmitting(true);
    
    try {
      const activeWallet = wallets[0];
      const provider = await activeWallet.getEthereumProvider();
      const client = makeWalletClient(provider, activeWallet.address as `0x${string}`);
      
      await writeContract(client, 'submit_proof', [id, url]);
      alert("Submission transaction sent! Waiting for confirmation...");
      setUrl('');
      
      // Auto-evaluate for demo purposes (anyone can trigger evaluate in this contract)
      setTimeout(async () => {
         try {
           await writeContract(client, 'evaluate_submission', [id]);
         } catch(e) {
           console.log("Evaluate skipped or failed", e);
         }
      }, 5000);

    } catch (err: any) {
      console.error(err);
      alert("Failed to submit proof: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>;
  if (error || !bounty) return <div style={{ textAlign: 'center', color: '#ff4d4d', padding: '4rem' }}>{error}</div>;

  return (
    <div className="animate-fade-in bounty-details">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <h1 style={{ wordBreak: 'break-all' }}>{bounty.bid}</h1>
          <span className={`badge badge-${bounty.status.toLowerCase()}`}>{bounty.status}</span>
        </div>

        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Project Scope & Code
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {bounty.description}
          </p>
        </div>

        <div className="glass-card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Semantic History
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            {bounty.status === 'COMPLETED' ? (
               <CheckCircle2 size={20} color="var(--primary)" style={{ marginTop: '0.1rem' }} />
            ) : bounty.status === 'CLOSED' ? (
               <CheckCircle2 size={20} color="var(--text-muted)" style={{ marginTop: '0.1rem' }} />
            ) : (
               <AlertCircle size={20} color="var(--secondary)" style={{ marginTop: '0.1rem' }} />
            )}
            <div>
              <p style={{ margin: 0 }}>{bounty.last_summary}</p>
              <small style={{ color: 'var(--text-muted)' }}>Latest consensus output</small>
            </div>
          </div>
          
          {bounty.submission_url && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>CURRENT SUBMISSION</h4>
              <a href={bounty.submission_url} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', wordBreak: 'break-all' }}>
                {bounty.submission_url}
              </a>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="glass-card" style={{ position: 'sticky', top: '2rem' }}>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>
             {(Number(bounty.bounty_atto) / 1e18).toFixed(4)} GEN
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Bounty Reward</p>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Creator: {bounty.creator.substring(0,6)}...{bounty.creator.substring(38)}
          </p>

          {bounty.status === 'OPEN' ? (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Bug Report / Exploit Proof URL</label>
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="e.g. https://gist.github.com/hunter/report (Must be plain-text or JSON)" 
                  required
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {submitting ? 'Submitting...' : (!authenticated ? 'Connect Wallet' : 'Submit Proof')}
              </button>
            </form>
          ) : bounty.status === 'EVALUATING' ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Loader2 size={48} className="animate-spin" color="var(--secondary)" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ marginBottom: '1rem' }}>The AI is evaluating the submission.</p>
              <button 
                onClick={async () => {
                  try {
                    const activeWallet = wallets[0];
                    if (!activeWallet) return login();
                    const provider = await activeWallet.getEthereumProvider();
                    const client = makeWalletClient(provider, activeWallet.address as `0x${string}`);
                    await writeContract(client, 'evaluate_submission', [id]);
                    alert("Evaluation triggered! Wait for the network to process it.");
                  } catch (e: any) {
                    alert("Error triggering evaluation: " + e.message);
                  }
                }}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Trigger AI Consensus Manually
              </button>
            </div>
          ) : bounty.status === 'COMPLETED' ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ marginBottom: '1rem' }}>Task accepted! Escrow is ready to be claimed.</p>
              <button 
                onClick={async () => {
                  try {
                    const activeWallet = wallets[0];
                    if (!activeWallet) return login();
                    const provider = await activeWallet.getEthereumProvider();
                    const client = makeWalletClient(provider, activeWallet.address as `0x${string}`);
                    setSubmitting(true);
                    await writeContract(client, 'claim_bounty', [id]);
                    alert("Bounty claimed successfully!");
                  } catch (e: any) {
                    alert("Error claiming bounty: " + e.message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={submitting}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {submitting ? 'Claiming...' : 'Claim Bounty'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <p>This bounty is currently {bounty.status.toLowerCase()}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
