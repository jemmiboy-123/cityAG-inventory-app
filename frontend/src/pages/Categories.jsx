import React, { useState, useEffect } from 'react';
import { Plus, X, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

const swatchPalette = ['#4a7c59', '#2a72b5', '#c2792a', '#7b4fa6', '#38a169', '#c25450'];

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(swatchPalette[0]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('categories')
            .select('*, items(count)')
            .order('name');
        setCategories(data || []);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        const name = newName.trim();
        if (!name) { setError('Name is required.'); return; }
        setSaving(true);
        const { error: insertErr } = await supabase
            .from('categories')
            .insert({ name, color: newColor });
        setSaving(false);
        if (insertErr) { setError(insertErr.message); return; }
        setNewName('');
        setNewColor(swatchPalette[(categories.length + 1) % swatchPalette.length]);
        setShowForm(false);
        fetchCategories();
    };

    const totalItems = categories.reduce((s, c) => s + (c.items?.[0]?.count ?? 0), 0);

    return (
        <div className="categories-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Categories</h1>
                    <p className="dash-subtitle">Organize your inventory by ministry or purpose.</p>
                </div>
                <button className="btn-primary btn-primary--compact" onClick={() => setShowForm(s => !s)}>
                    {showForm
                        ? <><X size={15} strokeWidth={2.2} /> Close</>
                        : <><Plus size={15} strokeWidth={2.2} /> New Category</>}
                </button>
            </header>

            {showForm && (
                <div className="panel" style={{ marginBottom: '1.25rem' }}>
                    {error && <div className="form-error">{error}</div>}
                    <form onSubmit={handleAdd} className="cat-form">
                        <div className="form-field form-field--wide">
                            <label>Name</label>
                            <input type="text" className="input-field" placeholder="e.g. Audio &amp; Sound"
                                value={newName} onChange={e => setNewName(e.target.value)}
                                autoFocus required />
                        </div>
                        <div className="form-field">
                            <label>Color</label>
                            <div className="swatch-row">
                                {swatchPalette.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        aria-label={`Use color ${c}`}
                                        className={`swatch${newColor === c ? ' is-active' : ''}`}
                                        style={{ background: c }}
                                        onClick={() => setNewColor(c)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="cat-form-actions">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                            <button type="submit" className="btn-primary btn-primary--compact" disabled={saving}>
                                {saving ? 'Saving…' : 'Add category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <section className="summary-strip" aria-label="Categories summary" style={{ marginBottom: '1.25rem' }}>
                <div className="summary-cell">
                    <p className="summary-label">Categories</p>
                    <p className="summary-value">{categories.length}</p>
                    <p className="summary-hint">defined</p>
                </div>
                <div className="summary-cell">
                    <p className="summary-label">Items categorized</p>
                    <p className="summary-value">{totalItems}</p>
                    <p className="summary-hint">across all categories</p>
                </div>
            </section>

            {loading ? (
                <p className="muted-center">Loading…</p>
            ) : categories.length === 0 && !showForm ? (
                <div className="panel">
                    <div className="empty-state">
                        <div className="empty-icon"><Plus size={18} /></div>
                        <p className="empty-title">No categories yet</p>
                        <p className="empty-hint">Add one to start organizing your inventory.</p>
                    </div>
                </div>
            ) : (
                <div className="tile-grid">
                    {categories.map(cat => {
                        const count = cat.items?.[0]?.count ?? 0;
                        return (
                            <div key={cat.id} className="tile">
                                <span className="tile-dot" style={{ background: cat.color || '#4a7c59' }} />
                                <div className="tile-body">
                                    <p className="tile-name">{cat.name}</p>
                                    <p className="tile-meta">{count} {count === 1 ? 'item' : 'items'}</p>
                                </div>
                                <button className="icon-btn" aria-label={`More actions for ${cat.name}`}>
                                    <MoreVertical size={15} />
                                </button>
                            </div>
                        );
                    })}
                    <button type="button" className="tile tile--add" onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        <span>New category</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Categories;
