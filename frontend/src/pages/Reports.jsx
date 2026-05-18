import React, { useEffect, useState } from 'react';
import {
    Download, AlertTriangle, Package, Tags as TagsIcon, Layers,
    TrendingUp, TrendingDown, FileSpreadsheet,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePreferences } from '../context/PreferencesContext';

const PHP = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const todayStamp = () => new Date().toISOString().slice(0, 10);
const startOfMonthISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const toCSV = (rows) =>
    rows.map(r => r.map(v => {
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')).join('\n');

const downloadCSV = (filename, rows) => {
    const blob = new Blob(['﻿' + toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const Reports = () => {
    const { preferences } = usePreferences();
    const threshold = preferences.low_stock_threshold;
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        const [itemsRes, catRes, txRes] = await Promise.all([
            supabase.from('items').select('id, name, quantity, condition, location, created_at, categories(name)').order('name'),
            supabase.from('categories').select('id, name, color'),
            supabase.from('transactions').select('*').order('occurred_on', { ascending: false }),
        ]);
        setItems(itemsRes.data || []);
        setCategories(catRes.data || []);
        setTransactions(txRes.data || []);
        setLoading(false);
    };

    // ── Inventory metrics ─────────────────────────────────────────
    const totalItems = items.length;
    const totalUnits = items.reduce((s, i) => s + (i.quantity || 0), 0);
    const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= threshold);
    const outOfStock = items.filter(i => i.quantity === 0);
    const attention = [...outOfStock, ...lowStock];

    const byCategory = categories.map(c => {
        const inCat = items.filter(i => i.categories?.name === c.name);
        return {
            name: c.name,
            count: inCat.length,
            units: inCat.reduce((s, i) => s + (i.quantity || 0), 0),
            color: c.color || '#266048',
        };
    });
    const uncategorized = items.filter(i => !i.categories?.name);
    if (uncategorized.length > 0) {
        byCategory.push({
            name: 'Uncategorized',
            count: uncategorized.length,
            units: uncategorized.reduce((s, i) => s + (i.quantity || 0), 0),
            color: '#8b939c',
        });
    }
    const sortedByCat = [...byCategory].filter(c => c.count > 0).sort((a, b) => b.count - a.count);
    const maxCatCount = Math.max(1, ...sortedByCat.map(c => c.count));

    const byCondition = ['New', 'Good', 'Fair', 'Poor'].map(cond => ({
        name: cond,
        count: items.filter(i => i.condition === cond).length,
    })).filter(c => c.count > 0);
    const maxCondCount = Math.max(1, ...byCondition.map(c => c.count));
    const condColor = {
        New:  '#2f9460',
        Good: '#266048',
        Fair: '#c2792a',
        Poor: '#c25450',
    };

    // ── Financial metrics ─────────────────────────────────────────
    const monthStart = startOfMonthISO();
    const monthly = transactions.filter(t => t.occurred_on >= monthStart);
    const balance = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const monthIncome = monthly.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
    const monthExpense = monthly.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const monthNet = monthIncome - monthExpense;

    // Top expense categories (debits) all-time
    const expenseByCat = {};
    transactions.filter(t => t.type === 'debit').forEach(t => {
        const key = (t.category || 'Uncategorized').trim() || 'Uncategorized';
        expenseByCat[key] = (expenseByCat[key] || 0) + Math.abs(Number(t.amount));
    });
    const topExpenses = Object.entries(expenseByCat)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    const topExpenseTotal = topExpenses.reduce((s, e) => s + e.value, 0) || 1;

    // ── Summary cells ────────────────────────────────────────────
    const summary = [
        { label: 'Total items',      value: totalItems,         hint: 'distinct catalog entries' },
        { label: 'Total units',      value: totalUnits,         hint: 'sum of quantities' },
        { label: 'Categories',       value: categories.length,  hint: 'defined' },
        { label: 'Need attention',   value: attention.length,   hint: 'low or out of stock', alert: attention.length > 0 },
    ];

    // ── Exports ───────────────────────────────────────────────────
    const exportInventory = () => {
        const rows = [
            ['Name', 'Category', 'Quantity', 'Condition', 'Location', 'Created'],
            ...items.map(i => [
                i.name,
                i.categories?.name || '',
                i.quantity ?? 0,
                i.condition || '',
                i.location || '',
                i.created_at ? new Date(i.created_at).toISOString().slice(0, 10) : '',
            ]),
        ];
        downloadCSV(`inventory-${todayStamp()}.csv`, rows);
    };

    const exportTransactions = () => {
        const rows = [
            ['Date', 'Description', 'Category', 'Type', 'Amount'],
            ...transactions.map(t => [
                t.occurred_on,
                t.description,
                t.category || '',
                t.type,
                t.amount,
            ]),
        ];
        downloadCSV(`transactions-${todayStamp()}.csv`, rows);
    };

    return (
        <div className="reports-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Reports</h1>
                    <p className="dash-subtitle">Inventory health and financial activity at a glance.</p>
                </div>
                <div className="report-actions">
                    <button className="btn-ghost" onClick={exportInventory} disabled={loading || items.length === 0}>
                        <FileSpreadsheet size={14} /> Export inventory
                    </button>
                    <button className="btn-ghost" onClick={exportTransactions} disabled={loading || transactions.length === 0}>
                        <Download size={14} /> Export transactions
                    </button>
                </div>
            </header>

            {loading ? (
                <p className="muted-center">Loading reports…</p>
            ) : (
                <>
                    <section className="summary-strip" aria-label="Inventory totals">
                        {summary.map((s, i) => (
                            <div key={i} className={`summary-cell${s.alert ? ' is-alert' : ''}`}>
                                <p className="summary-label">{s.label}</p>
                                <p className="summary-value">{s.value}</p>
                                <p className="summary-hint">{s.hint}</p>
                            </div>
                        ))}
                    </section>

                    <div className="dash-grid">
                        <section className="panel">
                            <div className="panel-head">
                                <h2 className="panel-title"><Layers size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />Inventory by category</h2>
                            </div>
                            {sortedByCat.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon"><Package size={18} /></div>
                                    <p className="empty-title">No items yet</p>
                                    <p className="empty-hint">Add items to see category breakdowns.</p>
                                </div>
                            ) : (
                                <ul className="bar-list">
                                    {sortedByCat.map((c, i) => {
                                        const pct = Math.round((c.count / maxCatCount) * 100);
                                        return (
                                            <li key={i}>
                                                <div className="bar-head">
                                                    <span className="bar-name">
                                                        <span className="bar-swatch" style={{ background: c.color }} />
                                                        {c.name}
                                                    </span>
                                                    <span className="bar-pct">{c.count} {c.count === 1 ? 'item' : 'items'}</span>
                                                </div>
                                                <div className="bar-track">
                                                    <div className="bar-fill" style={{ width: `${pct}%`, background: c.color }} />
                                                </div>
                                                <p className="bar-value">{c.units} total unit{c.units === 1 ? '' : 's'}</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>

                        <section className="panel">
                            <div className="panel-head">
                                <h2 className="panel-title"><TagsIcon size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />Inventory by condition</h2>
                            </div>
                            {byCondition.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon"><Package size={18} /></div>
                                    <p className="empty-title">No condition data</p>
                                    <p className="empty-hint">Conditions appear once items are added.</p>
                                </div>
                            ) : (
                                <ul className="bar-list">
                                    {byCondition.map((c, i) => {
                                        const pct = Math.round((c.count / maxCondCount) * 100);
                                        return (
                                            <li key={i}>
                                                <div className="bar-head">
                                                    <span className="bar-name">
                                                        <span className="bar-swatch" style={{ background: condColor[c.name] }} />
                                                        {c.name}
                                                    </span>
                                                    <span className="bar-pct">{c.count} {c.count === 1 ? 'item' : 'items'}</span>
                                                </div>
                                                <div className="bar-track">
                                                    <div className="bar-fill" style={{ width: `${pct}%`, background: condColor[c.name] }} />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </div>

                    <div className="dash-grid" style={{ marginTop: '1.25rem' }}>
                        <section className="panel">
                            <div className="panel-head">
                                <h2 className="panel-title">Financial summary</h2>
                                <span className="panel-subnote">This month</span>
                            </div>
                            {transactions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon"><TrendingUp size={18} /></div>
                                    <p className="empty-title">No transactions yet</p>
                                    <p className="empty-hint">Add transactions on the Accounting page to see reports.</p>
                                </div>
                            ) : (
                                <ul className="kpi-list">
                                    <li>
                                        <span className="kpi-label">Total balance (all-time)</span>
                                        <span className={`kpi-value ${balance < 0 ? 'tone-down' : ''}`}>{PHP.format(balance)}</span>
                                    </li>
                                    <li>
                                        <span className="kpi-label">Income this month</span>
                                        <span className="kpi-value tone-up">{PHP.format(monthIncome)}</span>
                                    </li>
                                    <li>
                                        <span className="kpi-label">Expenses this month</span>
                                        <span className="kpi-value tone-down">{PHP.format(monthExpense)}</span>
                                    </li>
                                    <li className="kpi-divider">
                                        <span className="kpi-label">Net this month</span>
                                        <span className={`kpi-value strong ${monthNet < 0 ? 'tone-down' : 'tone-up'}`}>
                                            {monthNet >= 0 ? '+' : ''}{PHP.format(monthNet)}
                                        </span>
                                    </li>
                                </ul>
                            )}
                        </section>

                        <section className="panel">
                            <div className="panel-head">
                                <h2 className="panel-title">Top expense categories</h2>
                                <span className="panel-subnote">All-time</span>
                            </div>
                            {topExpenses.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon"><TrendingDown size={18} /></div>
                                    <p className="empty-title">No expenses yet</p>
                                    <p className="empty-hint">Recorded expenses will be ranked here.</p>
                                </div>
                            ) : (
                                <ul className="bar-list">
                                    {topExpenses.map((e, i) => {
                                        const pct = Math.round((e.value / topExpenseTotal) * 100);
                                        return (
                                            <li key={i}>
                                                <div className="bar-head">
                                                    <span className="bar-name">{e.name}</span>
                                                    <span className="bar-pct">{pct}%</span>
                                                </div>
                                                <div className="bar-track">
                                                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                <p className="bar-value">{PHP.format(e.value)}</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </div>

                    <section className="panel" style={{ marginTop: '1.25rem' }}>
                        <div className="panel-head">
                            <h2 className="panel-title">
                                <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: '-2px', color: '#c2792a' }} />
                                Items needing attention
                            </h2>
                            <span className="panel-subnote">{attention.length} item{attention.length === 1 ? '' : 's'}</span>
                        </div>
                        {attention.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><Package size={18} /></div>
                                <p className="empty-title">Inventory looks healthy</p>
                                <p className="empty-hint">No items are low or out of stock right now.</p>
                            </div>
                        ) : (
                            <div className="data-table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Location</th>
                                            <th className="right">Quantity</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attention.map(item => {
                                            const isOut = item.quantity === 0;
                                            return (
                                                <tr key={item.id}>
                                                    <td className="strong">{item.name}</td>
                                                    <td>{item.categories?.name
                                                        ? <span className="chip">{item.categories.name}</span>
                                                        : <span className="muted">—</span>}</td>
                                                    <td className="muted">{item.location || '—'}</td>
                                                    <td className="right strong">{item.quantity}</td>
                                                    <td>
                                                        <span className={`status-pill ${isOut ? 'danger' : 'warn'}`}>
                                                            {isOut ? 'Out of stock' : 'Low stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default Reports;
