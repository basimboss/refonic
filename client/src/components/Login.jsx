import { useState } from 'react';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (isChangePassword) {
            // Handle Password Change
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
            // Handle Login
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Refonic</h1>
                <p className="text-center text-gray-400 mb-8 text-sm">Mobile Inventory System</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                            {isChangePassword ? 'Current Password' : 'Password'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {isChangePassword && (
                        <div className="animate-fade-in">
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {message && <p className="text-green-400 text-sm text-center">{message}</p>}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
                    >
                        {isChangePassword ? 'Save Changes' : 'Login'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsChangePassword(!isChangePassword);
                                setError('');
                                setMessage('');
                                setPassword('');
                                setNewPassword('');
                            }}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            {isChangePassword ? 'Back to Login' : 'Forgot Password?'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
