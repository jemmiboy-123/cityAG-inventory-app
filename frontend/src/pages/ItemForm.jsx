import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];
const STATUSES = ['In use', 'In storage', 'Under repair', 'Retired', 'Lost'];

const ItemForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const isEdit = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        category_id: '',
        quantity: 1,
        location: '',
        description: '',
        condition: 'Good',
        status: 'In use',
        serial_number: '',
        brand: '',
        model: '',
        track_stock: false,
    });

    useEffect(() => {
        supabase.from('categories').select('id, name').order('name')
            .then(({ data }) => setCategories(data || []));
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;
        (async () => {
            const { data, error: fetchErr } = await supabase
                .from('items')
                .select('*')
                .eq('id', id)
                .is('deleted_at', null)
                .maybeSingle();
            if (cancelled) return;
            if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }
            if (!data) { setError('Item not found.'); setLoading(false); return; }
            setForm({
                name: data.name ?? '',
                category_id: data.category_id ?? '',
                quantity: data.quantity ?? 0,
                location: data.location ?? '',
                description: data.description ?? '',
                condition: data.condition ?? 'Good',
                status: data.status ?? 'In use',
                serial_number: data.serial_number ?? '',
                brand: data.brand ?? '',
                model: data.model ?? '',
                track_stock: data.track_stock ?? false,
            });
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [id, isEdit]);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) { setError('Item name is required.'); return; }
        setSaving(true);

        const payload = {
            name: form.name.trim(),
            category_id: form.category_id || null,
            quantity: parseInt(form.quantity, 10) || 0,
            location: form.location.trim() || null,
            description: form.description.trim() || null,
            condition: form.condition,
            status: form.status,
            serial_number: form.serial_number.trim() || null,
            brand: form.brand.trim() || null,
            model: form.model.trim() || null,
            track_stock: form.track_stock,
        };

        const { error: writeErr } = isEdit
            ? await supabase.from('items')
                .update({ ...payload, updated_by: user?.id ?? null })
                .eq('id', id)
            : await supabase.from('items').insert({
                ...payload,
                created_by: user?.id ?? null,
                created_by_email: user?.email ?? null,
            });

        setSaving(false);
        if (writeErr) { setError(writeErr.message); return; }
        navigate('/inventory');
    };

    return (
        <div className="item-form-page animate-in">
            <header className="dash-header">
                <div>
                    <Link to="/inventory" className="back-link">
                        <ArrowLeft size={14} /> Back to inventory
                    </Link>
                    <h1 className="dash-title">{isEdit ? 'Edit item' : 'Add new item'}</h1>
                    <p className="dash-subtitle">
                        {isEdit ? 'Update item details.' : 'Catalog a new asset or piece of equipment.'}
                    </p>
                </div>
            </header>

            <div className="panel" style={{ maxWidth: '760px' }}>
                {error && <div className="form-error">{error}</div>}

                {loading ? (
                    <p className="muted-center">Loading…</p>
                ) : (
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
                            <label>Status</label>
                            <select className="input-field" value={form.status} onChange={set('status')}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Serial number</label>
                            <input type="text" className="input-field"
                                placeholder="e.g. YPSR373-12345"
                                value={form.serial_number} onChange={set('serial_number')} />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label>Brand</label>
                            <input type="text" className="input-field"
                                placeholder="e.g. Yamaha"
                                value={form.brand} onChange={set('brand')} />
                        </div>
                        <div className="form-field">
                            <label>Model</label>
                            <input type="text" className="input-field"
                                placeholder="e.g. PSR-E373"
                                value={form.model} onChange={set('model')} />
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
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={form.track_stock}
                                onChange={(e) => setForm({ ...form, track_stock: e.target.checked })}
                                style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: 16, height: 16 }}
                            />
                            <span>Track stock levels</span>
                            <span
                                className="hint-tooltip"
                                data-tooltip="Turn on for perishables and consumables that should trigger low-stock and out-of-stock alerts. Leave off for equipment like instruments and furniture."
                                aria-label="What is stock tracking?"
                            >
                                <HelpCircle size={14} />
                            </span>
                        </label>
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
                            <Save size={15} strokeWidth={2.2} />
                            {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Save item')}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default ItemForm;
