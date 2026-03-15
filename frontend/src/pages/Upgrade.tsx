import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const UpgradePage: React.FC = () => {
    const { upgrade, user } = useAuth();
    const navigate = useNavigate();

    const handleUpgrade = async () => {
        try {
            await upgrade();
            alert("Upgrade successful! You can now save templates.");
            navigate('/');
        } catch (error) {
            console.error(error);
            alert("Upgrade failed to process.");
        }
    };

    if (user?.is_paid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-green-600 mb-4">You are already a Pro!</h1>
                    <button onClick={() => navigate('/')} className="text-[#CA8A04] underline">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <Logo size={128} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-4">
                        Upgrade to Pro
                    </h1>
                    <p className="text-lg text-[#6B7280]">
                        Unlock unlimited Document Retention and Template Saving.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                    {/* Free Plan */}
                    <div className="card-highlight bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-[#111827] mb-2">Free</h2>
                        <p className="text-4xl font-extrabold text-[#111827] mb-1">$0</p>
                        <p className="text-sm text-[#6B7280] mb-6">Forever free</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-[#CA8A04] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#374151]">Basic highlight editing</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-[#CA8A04] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#374151]">Up to 3 documents</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-[#CA8A04] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#374151]">No template saving</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 px-6 rounded-xl font-semibold bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#FFE033] transition-colors"
                        >
                            Continue with Free
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="card-highlight bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-[#111827] mb-2">Pro</h2>
                        <p className="text-4xl font-extrabold text-[#111827] mb-1">$9.99</p>
                        <p className="text-sm text-[#6B7280] mb-6">per month · Cancel anytime</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-[#CA8A04] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#374151]">Unlimited document retention</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-[#CA8A04] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#374151]">Save unlimited templates</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-[#CA8A04] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#374151]">Reuse templates instantly</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-[#CA8A04] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#374151]">Priority support</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleUpgrade}
                            className="w-full py-3 px-6 rounded-xl font-semibold bg-[#FFE033] hover:bg-[#F5D800] text-[#1A1A1A] transition-colors shadow-sm"
                        >
                            Upgrade Now
                        </button>
                    </div>

                </div>

                {/* Secondary action */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[#6B7280] hover:text-[#374151] text-sm transition-colors"
                    >
                        No thanks, maybe later
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UpgradePage;
