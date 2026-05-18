import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];

const ItemForm = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        category_id: '',
        quantity: 1,
        location: '',
        description: '',
        condition: 'Good',
    });

    useEffect(() => {
        supabase.from('categories').select('id, name').order('name')
            .then(({ data }) => setCategories(data || []));
    }, []);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) { setError('Item name is required.'); return; }
        setSaving(true);

        const { error: insertErr } = await supabase.from('items').insert({
            name: form.name.trim(),
            category_id: form.category_id || null,
            quantity: parseInt(form.quantity, 10) || 0,
            location: form.location.trim() || null,
            description: form.description.trim() || null,
            condition: form.condition,
        });

        setSaving(false);
        if (insertErr) { setError(insertErr.message); return; }
        navigate('/inventory');
    };

    return (
        <div className="item-form-page animate-in">
            <header className="dash-header">
                <div>
                    <Link to="/inventory" className="back-link">
                        <ArrowLeft size={14} /> Back to inventory
                    </Link>
                    <h1 className="dash-title">Add new item</h1>
                    <p className="dash-subtitle">Catalog a new asset or piece of equipment.</p>
                </div>
            </header>

            <div className="panel" style={{ maxWidth: '760px' }}>
                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="stacked-form">
                    <div className="form-field">
                        <label>Item name *</label>
                        <input type="text" className="input-field"
                            placeholder="e.g. Yamaha PSR-E373 keyboard"
                            value={form.name} onChange={set('name')} required />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label>Category</label>
                            <select className="input-field" value={form.category_id} onChange={set('category_id')}>
                                <option value="">No category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Condition</label>
                            <select className="input-field" value={form.condition} onChange={set('condition')}>
                                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label>Quantity</label>
                            <input type="number" min="0" className="input-field"
                                value={form.quantity} onChange={set('quantity')} />
                        </div>
                        <div className="form-field">
                            <label>Storage location</label>
                            <input type="text" className="input-field"
                                placeholder="e.g. Storage Room A, Shelf 2"
                                value={form.location} onChange={set('location')} />
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Description</label>
                        <textarea className="input-field textarea"
                            placeholder="Serial numbers, accessories, condition notes…"
                            value={form.description} onChange={set('description')} />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/inventory')} className="btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary btn-primary--compact" disabled={saving}>
                            <Save size={15} strokeWidth={2.2} /> {saving ? 'Saving…' : 'Save item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;
