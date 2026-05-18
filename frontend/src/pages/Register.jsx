import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, UserPlus, ArrowLeft, Users, Heart, Music } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const features = [
    { icon: Users, text: 'For trusted stewards of City Assembly of God' },
    { icon: Heart, text: 'Built with care for ministry teams' },
    { icon: Music, text: 'Worship, media, youth — all in one place' },
];

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [ministry, setMinistry] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: signUpErr } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            ministry,
        });

        setLoading(false);
        if (signUpErr) { setError(signUpErr.message); return; }
        navigate('/');
    };

    return (
        <div className="auth-layout">
            <aside className="auth-marketing">
                <div className="auth-marketing-top">
                    <Logo size="small" />
                </div>

                <div className="auth-marketing-body">
                    <p className="auth-eyebrow">Join the team</p>
                    <h1 className="auth-headline">
                        Steward what the church has been given.
                    </h1>
                    <p className="auth-lede">
                        Create an account to catalog assets and keep every ministry stocked.
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
                    <p>&ldquo;Whatever you do, work at it with all your heart, as working for the Lord.&rdquo;</p>
                    <p className="auth-citation">— Colossians 3:23</p>
                </div>
            </aside>

            <main className="auth-form">
                <div className="auth-form-inner">
                    <header className="auth-form-head">
                        <h2>Create account</h2>
                        <p>Just a few details to get you started.</p>
                    </header>

                    {error && <div className="form-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="stacked-form">
                        <div className="form-grid-2">
                            <div className="form-field">
                                <label htmlFor="first-name">First name</label>
                                <div className="input-with-icon">
                                    <User size={15} className="input-icon" />
                                    <input id="first-name" type="text" className="input-field"
                                        placeholder="John" value={firstName}
                                        onChange={e => setFirstName(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-field">
                                <label htmlFor="last-name">Last name</label>
                                <input id="last-name" type="text" className="input-field"
                                    placeholder="Doe" value={lastName}
                                    onChange={e => setLastName(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="reg-email">Email</label>
                            <div className="input-with-icon">
                                <Mail size={15} className="input-icon" />
                                <input id="reg-email" type="email" className="input-field"
                                    placeholder="you@example.com" value={email}
                                    onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="ministry">Ministry or department</label>
                            <div className="input-with-icon">
                                <Building size={15} className="input-icon" />
                                <input id="ministry" type="text" className="input-field"
                                    placeholder="e.g. Worship, Media, Youth" value={ministry}
                                    onChange={e => setMinistry(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="reg-password">Password</label>
                            <div className="input-with-icon">
                                <Lock size={15} className="input-icon" />
                                <input id="reg-password" type="password" className="input-field"
                                    placeholder="At least 6 characters" value={password}
                                    onChange={e => setPassword(e.target.value)} required
                                    autoComplete="new-password" minLength={6} />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                            {loading
                                ? 'Creating account…'
                                : <><UserPlus size={15} strokeWidth={2.2} /> Create account</>}
                        </button>
                    </form>

                    <div className="auth-divider"><span>Already have an account?</span></div>

                    <Link to="/login" className="btn-ghost auth-secondary">
                        <ArrowLeft size={14} /> Back to sign in
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Register;
