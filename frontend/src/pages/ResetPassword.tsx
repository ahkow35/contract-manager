import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import Logo from '../components/Logo';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState(searchParams.get('token') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) setToken(urlToken);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await authApi.resetPassword(token, newPassword);
            setMessage("Password successfully reset! Redirecting to login...");
            setTimeout(() => {
                navigate('/auth');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to reset password");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-[#FAF9F6] p-8 rounded-lg shadow-sm border border-[#E5E7EB] card-highlight">
                <div className="flex justify-center mb-4">
                    <Logo size={64} />
                </div>
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[#111827]">
                        Set new password
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-50 text-green-700 p-3 rounded text-sm">
                            {message}
                        </div>
                    )}

                    {!token && (
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FFE033] focus:border-[#FFE033] sm:text-sm mb-4"
                                placeholder="Paste Reset Token Here"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <input
                            type="password"
                            required
                            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FFE033] focus:border-[#FFE033] sm:text-sm"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FFE033] focus:border-[#FFE033] sm:text-sm"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1A1A1A] hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFE033] disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <Link to="/auth" className="text-sm text-[#CA8A04] hover:text-[#A16207]">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
