import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import Logo from '../components/Logo';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await authApi.forgotPassword(email);
            setMessage("If that email exists, a reset link has been sent.");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to request reset link");
        } finally {
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
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
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

                    <div>
                        <input
                            type="email"
                            required
                            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FFE033] focus:border-[#FFE033] sm:text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1A1A1A] hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFE033] disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
