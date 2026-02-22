import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] max-w-md w-full p-8 text-center space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
                        kodbank app
                    </h1>
                    <p className="text-white/80 font-medium">Secure Banking for the Future</p>
                </div>

                <div className="space-y-4 pt-4">
                    <Link to="/signup" className="block">
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 active:bg-white/10 border border-white/20 rounded-xl font-semibold transition-all shadow-lg">Sign Up</button>
                    </Link>
                    <Link to="/login" className="block">
                        <button className="w-full py-3 bg-transparent border-white/40 hover:bg-white/10 active:bg-white/5 border rounded-xl font-semibold transition-all shadow-lg">
                            Sign In
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
