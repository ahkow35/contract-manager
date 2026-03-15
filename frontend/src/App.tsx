import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import TemplateEditor from './pages/TemplateEditor';
import AuthPage from './pages/Auth';
import UpgradePage from './pages/Upgrade';
import TemplatesList from './pages/TemplatesList';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import AdminPage from './pages/Admin';
import AnalyticsPage from './pages/Analytics';
import { useAuth } from './context/AuthContext';
import Logo from './components/Logo';

// Admin email for conditional navbar link
const ADMIN_EMAIL = 'nyanyk@gmail.com';

interface HeaderProps {
    onLogoClick: () => void;
}

function Header({ onLogoClick }: HeaderProps) {
    const { user, logout, isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                {/* Main Header Row */}
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={onLogoClick}
                        className="flex items-center gap-2 sm:gap-3 hover:opacity-85 transition-opacity"
                    >
                        <Logo size={44} />
                        <span className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                            Highlight<span className="text-[#CA8A04]">Edit</span>
                        </span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {user?.email === ADMIN_EMAIL && (
                                    <Link to="/admin" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                                        Admin
                                    </Link>
                                )}
                                {user?.email === ADMIN_EMAIL && (
                                    <Link to="/analytics" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                        Analytics
                                    </Link>
                                )}
                                <Link to="/templates" className="text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors">
                                    My Templates
                                </Link>
                                <span className="text-sm text-[#6B7280] truncate max-w-[150px]">
                                    {user?.email} {user?.is_paid && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">PRO</span>}
                                </span>
                                <button
                                    onClick={() => void logout()}
                                    className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                className="text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
                            >
                                Sign In
                            </Link>
                        )}

                        <button
                            onClick={onLogoClick}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] border border-[#1A1A1A] rounded-lg transition-colors"
                        >
                            Upload New File
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-3 pt-3 border-t border-[#E5E7EB] space-y-3">
                        {isAuthenticated ? (
                            <>
                                <div className="text-sm text-[#6B7280] truncate py-2">
                                    {user?.email} {user?.is_paid && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">PRO</span>}
                                </div>
                                {user?.email === ADMIN_EMAIL && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                                {user?.email === ADMIN_EMAIL && (
                                    <Link
                                        to="/analytics"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        Analytics
                                    </Link>
                                )}
                                <Link
                                    to="/templates"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
                                >
                                    My Templates
                                </Link>
                                <button
                                    onClick={() => { void logout(); setMobileMenuOpen(false); }}
                                    className="block w-full text-left py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
                            >
                                Sign In
                            </Link>
                        )}

                        <button
                            onClick={() => { onLogoClick(); setMobileMenuOpen(false); }}
                            className="w-full px-4 py-3 text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] rounded-lg transition-colors"
                        >
                            Upload New File
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
    const [editorKey, setEditorKey] = useState(0);
    const navigate = useNavigate();

    const handleLogoClick = useCallback(() => {
        setEditorKey(k => k + 1);
        navigate('/');
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <Header onLogoClick={handleLogoClick} />
            {/* Main Content */}
            <main className="py-8">
                <Routes>
                    <Route path="/" element={<ErrorBoundary><TemplateEditor key={editorKey} /></ErrorBoundary>} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/upgrade" element={<UpgradePage />} />
                    <Route path="/templates" element={<TemplatesList />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
