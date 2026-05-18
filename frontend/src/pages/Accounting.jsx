import React, { useEffect, useState } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Plus, Search, X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PHP = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const todayISO = () => new Date().toISOString().slice(0, 10);
const startOfMonthISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const blankForm = () => ({
    occurred_on: todayISO(),
    description: '',
    category: '',
    amount: '',
    type: 'credit',
});

const Accounting = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(blankForm());

    useEffect(() => { fetchTransactions(); }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error: fetchErr } = await supabase
            .from('transactions')
            .select('*')
            .order('occurred_on', { ascending: false })
            .order('created_at', { ascending: false });
        if (fetchErr) console.error('transactions fetch:', fetchErr.message);
        setTransactions(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const amt = parseFloat(form.amount);
        if (!form.description.trim() || isNaN(amt) || amt <= 0) {
            setError('Description and a positive amount are required.');
            return;
        }
        setSaving(true);
        const signed = form.type === 'credit' ? amt : -amt;
        const { error: insertErr } = await supabase.from('transactions').insert({
            occurred_on: form.occurred_on,
            description: form.description.trim(),
            category: form.category.trim() || null,
            amount: signed,
            type: form.type,
            created_by: user?.id ?? null,
        });
        setSaving(false);
        if (insertErr) { setError(insertErr.message); return; }
        setForm(blankForm());
        setShowForm(false);
        fetchTransactions();
    };

    // Derived stats
    const monthStart = startOfMonthISO();
    const monthly = transactions.filter(t => t.occurred_on >= monthStart);
    const balance = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const monthIncome = monthly
        .filter(t => t.type === 'credit')
        .reduce((s, t) => s + Number(t.amount), 0);
    const monthExpense = monthly
        .filter(t => t.type === 'debit')
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    // Category breakdown — by absolute value, top 5
    const byCategory = {};
    transactions.forEach(t => {
        const key = (t.category || 'Uncategorized').trim() || 'Uncategorized';
        byCategory[key] = (byCategory[key] || 0) + Math.abs(Number(t.amount));
    });
    const totalByCat = Object.values(byCategory).reduce((s, n) => s + n, 0) || 1;
    const breakdown = Object.entries(byCategory)
        .map(([name, value]) => ({ name, value, percent: Math.round((value / totalByCat) * 100) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const summary = [
        { label: 'Total balance',       value: PHP.format(balance),      hint: 'across all transactions', tone: balance < 0 ? 'down' : null },
        { label: 'Income this month',   value: PHP.format(monthIncome),  hint: 'credits this month',      tone: 'up' },
        { label: 'Expenses this month', value: PHP.format(monthExpense), hint: 'debits this month',       tone: 'down' },
    ];

    const filtered = transactions.filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return t.description.toLowerCase().includes(q)
            || (t.category && t.category.toLowerCase().includes(q));
    });

    return (
        <div className="accounting-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Accounting</h1>
                    <p className="dash-subtitle">Church income, expenses, and financial health.</p>
                </div>
                <button className="btn-primary btn-primary--compact" onClick={() => setShowForm(s => !s)}>
                    {showForm
                        ? <><X size={15} strokeWidth={2.2} /> Close</>
                        : <><Plus size={15} strokeWidth={2.2} /> Add Transaction</>}
                </button>
            </header>

            {showForm && (
                <div className="panel txn-form-panel">
                    {error && <div className="form-error">{error}</div>}
                    <form onSubmit={handleSubmit} className="txn-form">
                        <div className="form-field">
                            <label>Date</label>
                            <input type="date" className="input-field" value={form.occurred_on}
                                onChange={e => setForm({ ...form, occurred_on: e.target.value })} />
                        </div>
                        <div className="form-field form-field--wide">
                            <label>Description</label>
                            <input type="text" className="input-field" placeholder="e.g. Sunday tithes &amp; offerings"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} required />
                        </div>
                        <div className="form-field">
                            <label>Category</label>
                            <input type="text" className="input-field" placeholder="Income, Utilities, Missions…"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })} />
                        </div>
                        <div className="form-field">
                            <label>Type</label>
                            <select className="input-field" value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="credit">Credit (income)</option>
                                <option value="debit">Debit (expense)</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Amount</label>
                            <input type="number" step="0.01" min="0.01" className="input-field" placeholder="0.00"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })} required />
                        </div>
                        <div className="txn-form-actions">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                            <button type="submit" className="btn-primary btn-primary--compact" disabled={saving}>
                                {saving ? 'Saving…' : 'Save transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <section className="summary-strip" aria-label="Accounting summary">
                {summary.map((s, i) => (
                    <div key={i} className="summary-cell">
                        <p className="summary-label">{s.label}</p>
                        <p className={`summary-value${s.tone === 'up' ? ' tone-up' : ''}${s.tone === 'down' ? ' tone-down' : ''}`}>
                            {s.value}
                        </p>
                        <p className="summary-hint">{s.hint}</p>
                    </div>
                ))}
            </section>

            <div className="dash-grid dash-grid--wide">
                <section className="panel">
                    <div className="panel-head">
                        <h2 className="panel-title">Recent transactions</h2>
                        <div className="search-inline">
                            <Search size={13} />
                            <input type="text" placeholder="Search…" value={search}
                                onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {loading ? (
                        <p className="muted-center">Loading…</p>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Wallet size={18} /></div>
                            <p className="empty-title">{search ? 'No matches' : 'No transactions yet'}</p>
                            <p className="empty-hint">
                                {search ? 'Try a different search.' : 'Add the first transaction to get started.'}
                            </p>
                        </div>
                    ) : (
                        <div className="data-table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th className="right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(t => (
                                        <tr key={t.id}>
                                            <td className="muted">
                                                {new Date(t.occurred_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="strong">{t.description}</td>
                                            <td>{t.category ? <span className="chip">{t.category}</span> : <span className="muted">—</span>}</td>
                                            <td className={`right strong ${t.type === 'credit' ? 'tone-up' : 'tone-down'}`}>
                                                {t.type === 'credit' ? '+' : ''}{PHP.format(Number(t.amount))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="panel">
                    <div className="panel-head">
                        <h2 className="panel-title">By category</h2>
                    </div>
                    {breakdown.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><TrendingUp size={18} /></div>
                            <p className="empty-title">No data yet</p>
                            <p className="empty-hint">Category breakdown will appear once you log transactions.</p>
                        </div>
                    ) : (
                        <ul className="bar-list">
                            {breakdown.map((b, i) => (
                                <li key={i}>
                                    <div className="bar-head">
                                        <span className="bar-name">{b.name}</span>
                                        <span className="bar-pct">{b.percent}%</span>
                                    </div>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: `${b.percent}%` }} />
                                    </div>
                                    <p className="bar-value">{PHP.format(b.value)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Accounting;
