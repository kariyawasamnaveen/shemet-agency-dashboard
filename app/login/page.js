'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please contact administrator.');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                <source src="/videos/race_bg_loop.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Dark Gradient Overlay for Readability */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10 backdrop-blur-[2px]"></div>

            {/* Login Card - Glassmorphism */}
            <div className="relative z-20 w-full max-w-md px-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10 transform transition-all duration-500 hover:scale-[1.01]">

                    {/* Header Section */}
                    <div className="text-center mb-10">
                        {/* Circular Logo with Glow */}
                        <div className="inline-flex items-center justify-center w-28 h-28 mb-6 animate-pulse hover:animate-none transition-all duration-300 transform hover:scale-105">
                            <div className="rounded-full p-1 bg-gradient-to-tr from-pink-500 to-violet-600 shadow-[0_0_30px_rgba(236,72,153,0.5)] w-full h-full flex items-center justify-center">
                                <img
                                    src="/images/logo.png"
                                    alt="Shemet Logo"
                                    className="w-full h-full object-cover rounded-full border-4 border-white/90 drop-shadow-xl filter brightness-105"
                                />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Agency Portal</h1>
                        <p className="text-pink-200 text-sm font-medium tracking-wide uppercase">Shemet • Official Access</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/80 backdrop-blur-sm border border-red-500/50 text-white text-sm py-3 px-4 rounded-xl text-center shadow-lg animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-pink-100 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition duration-300 backdrop-blur-sm"
                                    placeholder="Enter your agency email"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block text-pink-100 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition duration-300 backdrop-blur-sm"
                                    placeholder="Enter your secure password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-400 text-pink-600 focus:ring-pink-500 bg-transparent transition" />
                                <span className="text-sm text-pink-100/80 group-hover:text-white transition">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-pink-300 hover:text-white transition font-medium">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-600 to-violet-700 hover:from-pink-500 hover:to-violet-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : (
                                "Access Dashboard"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center text-white/40 text-xs">
                        <p>© 2026 Shemet. Secure Admin Environment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
