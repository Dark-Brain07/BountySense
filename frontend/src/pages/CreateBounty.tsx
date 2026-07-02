import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { makeWalletClient, writeContract } from '../lib/genlayer';
import { usePrivy, useWallets } from '@privy-io/react-auth';

export default function CreateBounty() {
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bid: '',
    description: '',
    amount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated || !wallets.length) {
      login();
      return;
    }
    
    if (!formData.bid || !formData.description || !formData.amount) return;
    
    setLoading(true);
    try {
      const activeWallet = wallets[0];
      const provider = await activeWallet.getEthereumProvider();
      const client = makeWalletClient(provider, activeWallet.address);
      
      const amountAtto = BigInt(Math.floor(parseFloat(formData.amount) * 1e18));
      
      await writeContract(client, 'create_bounty', [formData.bid, formData.description], amountAtto);
      
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert("Error creating bounty: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Create New Bounty</h1>
      
      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Bounty ID</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. tutorial-react-genlayer" 
              required
              value={formData.bid}
              onChange={e => setFormData({...formData, bid: e.target.value})}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
              Must be unique. No spaces.
            </small>
          </div>

          <div className="input-group">
            <label className="input-label">Task Description</label>
            <textarea 
              className="input-field" 
              placeholder="Describe what needs to be done. The AI will evaluate submissions against this exact description." 
              rows={5}
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Bounty Amount (GEN)</label>
            <input 
              type="number" 
              step="0.0001"
              className="input-field" 
              placeholder="0.00" 
              required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
            {loading ? 'Locking Funds...' : (!authenticated ? 'Connect Wallet to Create' : 'Create Bounty & Lock Funds')}
          </button>
        </form>
      </div>
    </div>
  );
}
