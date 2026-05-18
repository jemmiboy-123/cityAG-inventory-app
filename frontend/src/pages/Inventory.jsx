import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePreferences } from '../context/PreferencesContext';

const Inventory = () => {
    const { preferences } = usePreferences();
    const threshold = preferences.low_stock_threshold;

    const getStatus = (qty) => {
        if (qty === 0)         return { label: 'Out of stock', tone: 'danger' };
        if (qty <= threshold)  return { label: 'Low stock',    tone: 'warn' };
        return                   { label: 'Available',         tone: 'ok' };
    };

    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchItems(); }, [search]);

    const fetchItems = async () => {
        setLoading(true);
        let query = supabase
            .from('items')
            .select('*, categories(name, color)')
            .order('created_at', { ascending: false });
        if (search) query = query.ilike('name', `%${search}%`);
        const { data } = await query;
        setItems(data || []);
        setLoading(false);
    };

    const total      = items.length;
    const available  = items.filter(i => i.quantity > threshold).length;
    const lowStock   = items.filter(i => i.quantity > 0 && i.quantity <= threshold).length;
    const outOfStock = items.filter(i => i.quantity === 0).length;

    const summary = [
        { label: 'Total items',  value: total,      hint: 'in catalog' },
        { label: 'Available',    value: available,  hint: `quantity above ${threshold}`,    tone: 'up' },
        { label: 'Low stock',    value: lowStock,   hint: `at or below ${threshold}`,       alert: lowStock > 0 },
        { label: 'Out of stock', value: outOfStock, hint: 'needs restock',                  alert: outOfStock > 0 },
    ];

    return (
        <div className="inventory-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Inventory</h1>
                    <p className="dash-subtitle">Equipment, supplies, and assets for City Assembly of God.</p>
                </div>
                <Link to="/items/new" className="btn-primary btn-primary--compact">
                    <Plus size={15} strokeWidth={2.2} /> Add Item
                </Link>
            </header>

            <section className="summary-strip" aria-label="Inventory summary">
                {summary.map((s, i) => (
                    <div key={i} className={`summary-cell${s.alert ? ' is-alert' : ''}`}>
                        <p className="summary-label">{s.label}</p>
                        <p className={`summary-value${s.tone === 'up' ? ' tone-up' : ''}`}>{s.value}</p>
                        <p className="summary-hint">{s.hint}</p>
                    </div>
                ))}
            </section>

            <section className="panel">
                <div className="panel-head">
                    <h2 className="panel-title">All items</h2>
                    <div className="search-inline">
                        <Search size={13} />
                        <input type="text" placeholder="Search by name…"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <p className="muted-center">Loading…</p>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Plus size={18} /></div>
                        <p className="empty-title">{search ? 'No matches' : 'No items yet'}</p>
                        <p className="empty-hint">
                            {search ? 'Try a different search.' : (
                                <>Catalog your first asset to get started. <Link to="/items/new" style={{ color: 'var(--primary)', fontWeight: 600 }}>Add item</Link>.</>
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th className="right">Qty</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const status = getStatus(item.quantity);
                                    return (
                                        <tr key={item.id}>
                                            <td className="strong">{item.name}</td>
                                            <td>
                                                {item.categories?.name
                                                    ? <span className="chip">{item.categories.name}</span>
                                                    : <span className="muted">—</span>}
                                            </td>
                                            <td className="right strong">{item.quantity}</td>
                                            <td className="muted">{item.location || '—'}</td>
                                            <td><span className={`status-pill ${status.tone}`}>{status.label}</span></td>
                                            <td className="right">
                                                <button className="icon-btn" aria-label="More actions">
                                                    <MoreVertical size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Inventory;
