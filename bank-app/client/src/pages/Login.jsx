import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/login', formData);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] max-w-md w-full p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-white pb-4">Welcome Back</h2>

                {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/50 transition-all"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/50 transition-all"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" disabled={loading} className="w-full py-3 bg-white/20 hover:bg-white/30 active:bg-white/10 border border-white/20 rounded-xl font-semibold transition-all shadow-lg mt-4">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-white/70 text-sm mt-4">
                    Don't have an account? <Link to="/signup" className="text-white hover:underline font-medium">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
