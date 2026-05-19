import React, { useEffect, useState } from 'react';
import {
    Save, KeyRound, User, Building, Mail, Sun, Moon, Check, ShieldCheck,
    AlertTriangle, Bell, Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const Settings = () => {
    const { user, isAdmin } = useAuth();
    const { preferences, updatePreferences } = usePreferences();

    // Profile
    const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
    const [lastName,  setLastName]  = useState(user?.user_metadata?.last_name  || '');
    const [email,     setEmail]     = useState(user?.email || '');
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

    // Team (admin only)
    const [teamUsers, setTeamUsers] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [teamMsg, setTeamMsg] = useState(null);
    const [savingRoleId, setSavingRoleId] = useState(null);

    useEffect(() => {
        if (!isAdmin) return;
        fetchTeam();
    }, [isAdmin]);

    const fetchTeam = async () => {
        setTeamLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, role, created_at')
            .order('created_at', { ascending: true });
        setTeamUsers(data || []);
        setTeamLoading(false);
    };

    const handleRoleChange = async (targetUser, newRole) => {
        setTeamMsg(null);
        // Guard against demoting the last admin
        if (newRole === 'user') {
            const otherAdmins = teamUsers.filter(u => u.role === 'admin' && u.id !== targetUser.id);
            if (otherAdmins.length === 0) {
                setTeamMsg({ type: 'error', text: 'There must be at least one admin. Promote someone else first.' });
                return;
            }
        }
        setSavingRoleId(targetUser.id);
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUser.id);
        setSavingRoleId(null);
        if (error) { setTeamMsg({ type: 'error', text: error.message }); return; }
        setTeamMsg({ type: 'success', text: `${targetUser.email} is now ${newRole}.` });
        fetchTeam();
    };

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

        const trimmedFirst    = firstName.trim();
        const trimmedLast     = lastName.trim();
        const trimmedEmail    = email.trim();
        const trimmedMinistry = ministry.trim();
        const emailChanged    = trimmedEmail && trimmedEmail !== user?.email;

        // 1. Update auth.users (metadata always; email only if changed)
        const authPayload = {
            data: {
                first_name: trimmedFirst,
                last_name:  trimmedLast,
                ministry:   trimmedMinistry,
            },
        };
        if (emailChanged) authPayload.email = trimmedEmail;

        const { error: authErr } = await supabase.auth.updateUser(authPayload);
        if (authErr) {
            setProfileSaving(false);
            setProfileMsg({ type: 'error', text: authErr.message });
            return;
        }

        // 2. Sync the public.profiles row — the handle_new_user trigger only
        //    fires on INSERT, so updates from the UI need a manual sync.
        const profilePayload = {
            first_name: trimmedFirst || null,
            last_name:  trimmedLast  || null,
        };
        if (emailChanged) profilePayload.email = trimmedEmail;

        const { error: profErr } = await supabase
            .from('profiles')
            .update(profilePayload)
            .eq('id', user.id);

        setProfileSaving(false);
        if (profErr) {
            setProfileMsg({ type: 'error', text: `Saved to auth but profile sync failed: ${profErr.message}` });
            return;
        }

        setProfileMsg({
            type: 'success',
            text: emailChanged
                ? 'Profile saved. If email confirmation is enabled in Supabase, check the new address to confirm the change.'
                : 'Profile updated.',
        });
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
                                value={email} onChange={e => setEmail(e.target.value)}
                                autoComplete="email" />
                        </div>
                        <p className="form-hint">
                            Used to sign in. If Supabase email confirmation is on, you'll need to confirm any change from the new address.
                        </p>
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

            {/* Team — admin only */}
            {isAdmin && (
                <section className="panel settings-section">
                    <div className="settings-section-head">
                        <h2 className="settings-section-title">
                            <Users size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                            Team
                        </h2>
                        <p className="settings-section-hint">Manage who can delete items and edit categories. Admins can promote or demote users.</p>
                    </div>

                    {teamMsg && (
                        <div className={teamMsg.type === 'error' ? 'form-error' : 'form-success'} style={{ marginBottom: 12 }}>
                            {teamMsg.text}
                        </div>
                    )}

                    {teamLoading ? (
                        <p className="muted-center">Loading team…</p>
                    ) : (
                        <div className="data-table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamUsers.map(u => {
                                        const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || '—';
                                        const isSelf = u.id === user?.id;
                                        return (
                                            <tr key={u.id}>
                                                <td className="strong">
                                                    {name}{isSelf && <span className="muted" style={{ marginLeft: 6, fontSize: '0.78rem' }}>(you)</span>}
                                                </td>
                                                <td className="muted">{u.email}</td>
                                                <td>
                                                    <select
                                                        className="input-field"
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u, e.target.value)}
                                                        disabled={savingRoleId === u.id}
                                                        style={{ maxWidth: 140, padding: '4px 8px' }}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

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
