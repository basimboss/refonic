import { useState } from 'react';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (isChangePassword) {
            try {
                const res = await fetch('/api/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword: password, newPassword })
                });
                const data = await res.json();
                if (res.ok) {
                    setMessage('Password changed successfully! Please login.');
                    setIsChangePassword(false);
                    setPassword('');
                    setNewPassword('');
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Failed to change password');
            }
        } else {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await res.json();
                if (res.ok) {
                    onLogin(data.token);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Login failed');
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-[var(--bg-primary)] relative overflow-hidden flex items-center justify-center font-[family-name:var(--font-family-poppins)]">
            {/* Background Blur Effect */}
            <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] pointer-events-none animate-pulse">
                <svg viewBox="0 0 535 470" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-60">
                    <g filter="url(#filter0_f_2_73)">
                        <path d="M384.5 235C384.5 281.944 346.444 320 299.5 320C252.556 320 150 243.444 150 196.5C150 149.556 252.556 150 299.5 150C346.444 150 384.5 188.056 384.5 235Z" fill="#16397E" />
                    </g>
                    <defs>
                        <filter id="filter0_f_2_73" x="0" y="0" width="534.5" height="470" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="75" result="effect1_foregroundBlur_2_73" />
                        </filter>
                    </defs>
                </svg>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-[420px] bg-[var(--bg-card)]/80 backdrop-blur-2xl border border-white/5 rounded-[24px] p-8 shadow-2xl transform transition-all duration-300 hover:scale-[1.01]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isChangePassword ? 'Reset Password' : 'Sign in'}
                    </h1>
                    <p className="text-[var(--text-rgb-117-117-117)] text-sm">
                        {isChangePassword
                            ? 'Enter your current and new password'
                            : 'Kindly enter your details below in order to sign in to your account'}
                    </p>
                </div>

                <div className="w-full h-[1px] bg-[#2C3C58]/70 mb-8"></div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-rgb-219-219-219)]">
                            {isChangePassword ? 'Current Password' : 'Password'}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-rgb-117-117-117)] group-focus-within:text-[var(--text-rgb-25-81-255)] transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:border-[var(--text-rgb-25-81-255)] focus:ring-1 focus:ring-[var(--text-rgb-25-81-255)] transition-all outline-none"
                                placeholder="******************"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-rgb-117-117-117)] hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {isChangePassword && (
                        <div className="space-y-2 animate-fade-in-up">
                            <label className="text-sm font-medium text-[var(--text-rgb-219-219-219)]">
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-rgb-117-117-117)] group-focus-within:text-[var(--text-rgb-25-81-255)] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:border-[var(--text-rgb-25-81-255)] focus:ring-1 focus:ring-[var(--text-rgb-25-81-255)] transition-all outline-none"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                            {message}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setIsChangePassword(!isChangePassword);
                                setError('');
                                setMessage('');
                                setPassword('');
                                setNewPassword('');
                            }}
                            className="text-sm text-[var(--text-rgb-25-81-255)] hover:text-white transition-colors font-medium"
                        >
                            {isChangePassword ? 'Back to Login' : 'Forgot Password?'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[var(--text-rgb-25-81-255)] hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-900/20"
                    >
                        {isChangePassword ? 'Reset Password' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
