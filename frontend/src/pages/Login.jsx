import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Package, ShieldCheck, BarChart3 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const features = [
    { icon: Package,     text: 'Track every item across all ministries' },
    { icon: ShieldCheck, text: 'Secure role-based access control' },
    { icon: BarChart3,   text: 'Real-time reports and analytics' },
];

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await signIn(email, password);
        if (error) { setError(error.message); setLoading(false); }
        else navigate('/');
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
        }}>
            {/* ── Left Panel ── */}
            <div style={{
                position: 'relative',
                background: 'linear-gradient(145deg, #1a2e1a 0%, #2d4a2d 40%, #4a7c59 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '3rem',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '45%', left: '55%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

                {/* Logo */}
                <div>
                    <Logo size="small" />
                </div>

                {/* Main copy */}
                <div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        Church Management
                    </p>
                    <h1 style={{ color: '#ffffff', fontSize: '2.4rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '1.25rem' }}>
                        Everything your<br />church owns,<br />
                        <span style={{ color: '#9bb37d' }}>organized.</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '340px', marginBottom: '2.5rem' }}>
                        A simple, powerful inventory system built for City Assembly of God.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {features.map(({ icon: Icon, text }, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div style={{ background: 'rgba(155,179,125,0.18)', color: '#9bb37d', padding: '0.5rem', borderRadius: '10px', flexShrink: 0 }}>
                                    <Icon size={16} />
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '500' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer quote */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        "Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10
                    </p>
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div style={{
                background: 'var(--bg-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 4rem',
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    {/* Heading */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                            Welcome back
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '0.85rem 1rem',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '12px',
                            color: '#dc2626',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem 0.85rem 2.75rem',
                                        border: '1.5px solid var(--border)',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        background: 'var(--surface)',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-main)' }}>Password</label>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 3rem 0.85rem 2.75rem',
                                        border: '1.5px solid var(--border)',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        background: 'var(--surface)',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                width: '100%',
                                padding: '0.95rem',
                                background: loading ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary) 0%, #4a7c59 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontFamily: 'inherit',
                                boxShadow: loading ? 'none' : '0 4px 14px rgba(74,124,89,0.35)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={18} /></>}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>New here?</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>

                    {/* Register link */}
                    <Link
                        to="/register"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.9rem',
                            border: '1.5px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: 'var(--text-main)',
                            background: 'var(--surface)',
                            textDecoration: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
