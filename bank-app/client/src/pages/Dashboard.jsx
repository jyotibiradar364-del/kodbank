import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [balance, setBalance] = useState(null);
    const [transferData, setTransferData] = useState({ receiverEmail: '', amount: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            const response = await axios.get('http://localhost:5000/api/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(response.data.balance);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/transfer', transferData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ text: response.data.message, type: 'success' });
            setBalance(response.data.newBalance);
            setTransferData({ receiverEmail: '', amount: '' });
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Transfer failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (balance === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading secure dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg">
                    <h1 className="text-2xl font-bold text-white tracking-wide">kodbank app</h1>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-500/80 hover:bg-red-500 active:bg-red-600 border border-red-400 text-white rounded-xl font-medium transition-all"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Balance Card Section */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8 flex flex-col justify-center items-center h-full">
                        <h2 className="text-white/80 text-lg font-medium mb-2">Available Balance</h2>
                        <div className="text-5xl font-extrabold text-white tracking-tight">
                            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Transfer Card Section */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Transfer Money</h2>

                        {message.text && (
                            <div className={`p-4 mb-6 rounded-xl border text-sm ${message.type === 'success'
                                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                : 'bg-red-500/20 border-red-500/50 text-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2 pr-2">Receiver Email</label>
                                <input
                                    type="email"
                                    placeholder="friend@example.com"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/50 transition-all !py-2.5"
                                    required
                                    value={transferData.receiverEmail}
                                    onChange={(e) => setTransferData({ ...transferData, receiverEmail: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2 pr-2">Amount to Transfer ($)</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/50 transition-all !py-2.5"
                                    required
                                    value={transferData.amount}
                                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-3 bg-white/20 hover:bg-white/30 active:bg-white/10 border border-white/20 rounded-xl font-semibold transition-all shadow-lg mt-6">
                                {loading ? 'Processing...' : 'Send Money'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
