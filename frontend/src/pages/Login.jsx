import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Package, ShieldCheck, BarChart3 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const features = [
    { icon: Package,     text: 'Track every item across all ministries' },
    { icon: ShieldCheck, text: 'Role-based access for trusted stewards' },
    { icon: BarChart3,   text: 'Real-time reports and analytics' },
];

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNotice('');
        setLoading(true);
        const { error: signInErr } = await signIn(email, password);
        if (signInErr) { setError(signInErr.message); setLoading(false); }
        else navigate('/');
    };

    const handleForgotPassword = async () => {
        setError('');
        setNotice('');
        if (!email) {
            setError('Enter your email above, then click “Forgot password?” to get a reset link.');
            return;
        }
        const { error: resetErr } = await resetPassword(email);
        if (resetErr) setError(resetErr.message);
        else setNotice(`Password reset link sent to ${email}. Check your inbox.`);
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
                        Every asset, accounted for.
                    </h1>
                    <p className="auth-lede">
                        A quiet, dependable inventory system built for City Assembly of God.
                    </p>

                    <ul className="auth-features">
                        {features.map(({ icon: Icon, text }, i) => (
                            <li key={i}>
                                <Icon size={15} strokeWidth={1.8} />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
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
                        <h2>Welcome back</h2>
                        <p>Sign in to continue managing inventory.</p>
                    </header>

                    {error && <div className="form-error">{error}</div>}
                    {notice && <div className="form-success">{notice}</div>}

                    <form onSubmit={handleSubmit} className="stacked-form">
                        <div className="form-field">
                            <label htmlFor="email">Email</label>
                            <div className="input-with-icon">
                                <Mail size={15} className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    className="input-field"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <div className="field-label-row">
                                <label htmlFor="password">Password</label>
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="input-with-icon">
                                <Lock size={15} className="input-icon" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
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

                        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                            {loading ? 'Signing in…' : <>Sign in <ArrowRight size={15} strokeWidth={2.2} /></>}
                        </button>
                    </form>

                    <div className="auth-divider"><span>New here?</span></div>

                    <Link to="/register" className="btn-ghost auth-secondary">
                        Create an account
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Login;
