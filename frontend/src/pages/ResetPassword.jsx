import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const [recoveryReady, setRecoveryReady] = useState(false);
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    // When the user clicks the email link, Supabase parses the recovery token
    // from the URL and establishes a session (firing PASSWORD_RECOVERY). Only
    // then should the form be usable.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) setRecoveryReady(true);
        });
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setRecoveryReady(true);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNotice('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        const { error: updErr } = await updatePassword(password);
        if (updErr) {
            setError(updErr.message);
            setLoading(false);
        } else {
            setNotice('Password updated successfully. Redirecting to your dashboard…');
            setTimeout(() => navigate('/'), 1400);
        }
    };

    return (
        <div className="auth-layout">
            <aside className="auth-marketing">
                <div className="auth-marketing-top">
                    <Logo size="small" />
                </div>

                <div className="auth-marketing-body">
                    <p className="auth-eyebrow">Church inventory</p>
                    <h1 className="auth-headline">
                        Set a new password.
                    </h1>
                    <p className="auth-lede">
                        Choose a strong password to keep your City Assembly of God inventory secure.
                    </p>
                </div>

                <div className="auth-marketing-foot">
                    <p>
                        &ldquo;Each of you should use whatever gift you have received to serve others,
                        as faithful stewards of God&rsquo;s grace in its various forms.&rdquo;
                    </p>
                    <p className="auth-citation">— 1 Peter 4:10</p>
                </div>
            </aside>

            <main className="auth-form">
                <div className="auth-form-inner">
                    <header className="auth-form-head">
                        <h2>Reset password</h2>
                        <p>Enter and confirm your new password below.</p>
                    </header>

                    {error && <div className="form-error">{error}</div>}
                    {notice && <div className="form-success">{notice}</div>}

                    {!recoveryReady && !notice ? (
                        <div className="empty-state">
                            <div className="empty-icon"><KeyRound size={18} strokeWidth={1.6} /></div>
                            <p className="empty-title">Waiting for a valid reset link</p>
                            <p className="empty-hint">
                                Open this page from the password reset link in your email. If the link
                                has expired, request a new one from the login page.
                            </p>
                            <Link to="/login" className="back-link" style={{ marginTop: '0.75rem' }}>
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="stacked-form">
                            <div className="form-field">
                                <label htmlFor="password">New password</label>
                                <div className="input-with-icon">
                                    <Lock size={15} className="input-icon" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="input-field"
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        disabled={!recoveryReady || loading}
                                    />
                                    <button
                                        type="button"
                                        className="input-trailing"
                                        onClick={() => setShowPassword(s => !s)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="confirm">Confirm new password</label>
                                <div className="input-with-icon">
                                    <ShieldCheck size={15} className="input-icon" />
                                    <input
                                        id="confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        className="input-field"
                                        placeholder="Re-enter your password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        disabled={!recoveryReady || loading}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary auth-submit" disabled={loading || !recoveryReady}>
                                {loading ? 'Updating…' : <>Update password <ArrowRight size={15} strokeWidth={2.2} /></>}
                            </button>
                        </form>
                    )}

                    <div className="auth-divider"><span>Remember it?</span></div>

                    <Link to="/login" className="btn-ghost auth-secondary">
                        Back to login
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default ResetPassword;
