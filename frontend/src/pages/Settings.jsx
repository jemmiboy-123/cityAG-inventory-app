import React, { useEffect, useState } from 'react';
import {
    Save, KeyRound, User, Building, Mail, Sun, Moon, Check, ShieldCheck,
    AlertTriangle, Bell,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const Settings = () => {
    const { user } = useAuth();
    const { preferences, updatePreferences } = usePreferences();

    // Profile
    const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
    const [lastName,  setLastName]  = useState(user?.user_metadata?.last_name  || '');
    const [ministry,  setMinistry]  = useState(user?.user_metadata?.ministry   || '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    // Password
    const [newPwd,     setNewPwd]     = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdSaving,  setPwdSaving]  = useState(false);
    const [pwdMsg,     setPwdMsg]     = useState(null);

    // Preferences (sync local state from context whenever it loads)
    const [threshold,   setThreshold]   = useState(preferences.low_stock_threshold);
    const [emailAlerts, setEmailAlerts] = useState(preferences.email_alerts);
    const [prefSaving,  setPrefSaving]  = useState(false);
    const [prefMsg,     setPrefMsg]     = useState(null);

    useEffect(() => {
        setThreshold(preferences.low_stock_threshold);
        setEmailAlerts(preferences.email_alerts);
    }, [preferences.low_stock_threshold, preferences.email_alerts]);

    // Theme — read once from localStorage; broadcast a custom event on change
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    const applyTheme = (t) => {
        setTheme(t);
        if (t === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
        window.dispatchEvent(new Event('theme-changed'));
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setProfileMsg(null);
        setProfileSaving(true);
        const { error } = await supabase.auth.updateUser({
            data: {
                first_name: firstName.trim(),
                last_name:  lastName.trim(),
                ministry:   ministry.trim(),
            },
        });
        setProfileSaving(false);
        if (error) setProfileMsg({ type: 'error', text: error.message });
        else       setProfileMsg({ type: 'success', text: 'Profile updated.' });
    };

    const savePreferences = async (e) => {
        e.preventDefault();
        setPrefMsg(null);
        const n = parseInt(threshold, 10);
        if (isNaN(n) || n < 0) { setPrefMsg({ type: 'error', text: 'Threshold must be 0 or higher.' }); return; }
        setPrefSaving(true);
        const { error } = await updatePreferences({
            low_stock_threshold: n,
            email_alerts: emailAlerts,
        });
        setPrefSaving(false);
        if (error) setPrefMsg({ type: 'error', text: error.message });
        else       setPrefMsg({ type: 'success', text: 'Preferences saved.' });
    };

    const savePassword = async (e) => {
        e.preventDefault();
        setPwdMsg(null);
        if (newPwd.length < 6) { setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
        if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
        setPwdSaving(true);
        const { error } = await supabase.auth.updateUser({ password: newPwd });
        setPwdSaving(false);
        if (error) { setPwdMsg({ type: 'error', text: error.message }); return; }
        setPwdMsg({ type: 'success', text: 'Password updated.' });
        setNewPwd('');
        setConfirmPwd('');
    };

    return (
        <div className="settings-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Settings</h1>
                    <p className="dash-subtitle">Profile, security, and preferences.</p>
                </div>
            </header>

            {/* Profile */}
            <section className="panel settings-section">
                <div className="settings-section-head">
                    <h2 className="settings-section-title">Profile</h2>
                    <p className="settings-section-hint">Your name and ministry assignment. Shown in the sidebar and on receipts.</p>
                </div>
                <form onSubmit={saveProfile} className="stacked-form">
                    {profileMsg && (
                        <div className={profileMsg.type === 'error' ? 'form-error' : 'form-success'}>
                            {profileMsg.text}
                        </div>
                    )}
                    <div className="form-grid-2">
                        <div className="form-field">
                            <label htmlFor="first">First name</label>
                            <div className="input-with-icon">
                                <User size={15} className="input-icon" />
                                <input id="first" type="text" className="input-field"
                                    value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-field">
                            <label htmlFor="last">Last name</label>
                            <input id="last" type="text" className="input-field"
                                value={lastName} onChange={e => setLastName(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <Mail size={15} className="input-icon" />
                            <input id="email" type="email" className="input-field"
                                value={user?.email || ''} disabled />
                        </div>
                        <p className="form-hint">Contact an administrator to change your email address.</p>
                    </div>
                    <div className="form-field">
                        <label htmlFor="ministry">Ministry or department</label>
                        <div className="input-with-icon">
                            <Building size={15} className="input-icon" />
                            <input id="ministry" type="text" className="input-field"
                                placeholder="e.g. Worship, Media, Youth"
                                value={ministry} onChange={e => setMinistry(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary btn-primary--compact" disabled={profileSaving}>
                            <Save size={15} strokeWidth={2.2} /> {profileSaving ? 'Saving…' : 'Save profile'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Password */}
            <section className="panel settings-section">
                <div className="settings-section-head">
                    <h2 className="settings-section-title">Password</h2>
                    <p className="settings-section-hint">Update the password used to sign in. At least 6 characters.</p>
                </div>
                <form onSubmit={savePassword} className="stacked-form">
                    {pwdMsg && (
                        <div className={pwdMsg.type === 'error' ? 'form-error' : 'form-success'}>
                            {pwdMsg.text}
                        </div>
                    )}
                    <div className="form-grid-2">
                        <div className="form-field">
                            <label htmlFor="newpwd">New password</label>
                            <div className="input-with-icon">
                                <KeyRound size={15} className="input-icon" />
                                <input id="newpwd" type="password" className="input-field"
                                    placeholder="At least 6 characters"
                                    value={newPwd} onChange={e => setNewPwd(e.target.value)}
                                    minLength={6} autoComplete="new-password" />
                            </div>
                        </div>
                        <div className="form-field">
                            <label htmlFor="confirmpwd">Confirm password</label>
                            <input id="confirmpwd" type="password" className="input-field"
                                value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                                minLength={6} autoComplete="new-password" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary btn-primary--compact"
                            disabled={pwdSaving || !newPwd}>
                            <KeyRound size={15} strokeWidth={2.2} /> {pwdSaving ? 'Updating…' : 'Update password'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Preferences */}
            <section className="panel settings-section">
                <div className="settings-section-head">
                    <h2 className="settings-section-title">Preferences</h2>
                    <p className="settings-section-hint">Personal defaults for how the app surfaces inventory alerts.</p>
                </div>
                <form onSubmit={savePreferences} className="stacked-form">
                    {prefMsg && (
                        <div className={prefMsg.type === 'error' ? 'form-error' : 'form-success'}>
                            {prefMsg.text}
                        </div>
                    )}
                    <div className="form-field" style={{ maxWidth: 280 }}>
                        <label htmlFor="threshold">Low-stock threshold</label>
                        <div className="input-with-icon">
                            <AlertTriangle size={15} className="input-icon" />
                            <input id="threshold" type="number" min="0" max="999" className="input-field"
                                value={threshold} onChange={e => setThreshold(e.target.value)} />
                        </div>
                        <p className="form-hint">Items with quantity at or below this number show as "low stock" on the dashboard and inventory pages.</p>
                    </div>

                    <label className="toggle-row">
                        <Bell size={15} />
                        <div className="toggle-body">
                            <p className="toggle-title">Email alerts for low stock</p>
                            <p className="toggle-hint">Get a daily summary when items hit the threshold. (Coming soon — flag is saved but emails aren&rsquo;t sent yet.)</p>
                        </div>
                        <input type="checkbox" className="toggle-input"
                            checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} />
                        <span className="toggle-switch" aria-hidden="true" />
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary btn-primary--compact" disabled={prefSaving}>
                            <Save size={15} strokeWidth={2.2} /> {prefSaving ? 'Saving…' : 'Save preferences'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Appearance */}
            <section className="panel settings-section">
                <div className="settings-section-head">
                    <h2 className="settings-section-title">Appearance</h2>
                    <p className="settings-section-hint">Choose a light or dark color scheme. Affects this device only.</p>
                </div>
                <div className="theme-options">
                    <button type="button"
                        className={`theme-option${theme === 'light' ? ' is-active' : ''}`}
                        onClick={() => applyTheme('light')}>
                        <Sun size={16} />
                        <span>Light</span>
                        {theme === 'light' && <Check size={14} className="theme-check" />}
                    </button>
                    <button type="button"
                        className={`theme-option${theme === 'dark' ? ' is-active' : ''}`}
                        onClick={() => applyTheme('dark')}>
                        <Moon size={16} />
                        <span>Dark</span>
                        {theme === 'dark' && <Check size={14} className="theme-check" />}
                    </button>
                </div>
            </section>

            {/* About */}
            <section className="panel settings-section">
                <div className="settings-section-head">
                    <h2 className="settings-section-title">About</h2>
                </div>
                <ul className="kpi-list">
                    <li>
                        <span className="kpi-label">Application</span>
                        <span className="kpi-value">City Assembly of God · Inventory</span>
                    </li>
                    <li>
                        <span className="kpi-label">Version</span>
                        <span className="kpi-value">1.0.0</span>
                    </li>
                    <li>
                        <span className="kpi-label">Backend</span>
                        <span className="kpi-value">Supabase</span>
                    </li>
                    <li>
                        <span className="kpi-label"><ShieldCheck size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />Signed in as</span>
                        <span className="kpi-value">{user?.email}</span>
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default Settings;
