import React, { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ItemForm = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '', category_id: '', quantity: 1, location: '', description: '', condition: 'Good',
    });

    useEffect(() => {
        supabase.from('categories').select('id, name').order('name').then(({ data }) => setCategories(data || []));
    }, []);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const { error } = await supabase.from('items').insert({
            name: form.name,
            category_id: form.category_id || null,
            quantity: parseInt(form.quantity),
            location: form.location,
            description: form.description,
            condition: form.condition,
        });

        if (error) {
            setError(error.message);
            setSaving(false);
        } else {
            navigate('/inventory');
        }
    };

    return (
        <div className="item-form-page">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Add New Item</h1>
                <p style={{ color: 'var(--text-muted)' }}>Enter the details of the new inventory item.</p>
            </header>

            <div className="card" style={{ maxWidth: '800px' }}>
                {error && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Item Name *</label>
                            <input type="text" placeholder="e.g. Yamaha PSR-E373" className="input-field" value={form.name} onChange={set('name')} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                            <select className="input-field" value={form.category_id} onChange={set('category_id')}>
                                <option value="">Select Category</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity</label>
                                <input type="number" min="0" className="input-field" value={form.quantity} onChange={set('quantity')} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Condition</label>
                                <select className="input-field" value={form.condition} onChange={set('condition')}>
                                    <option>Good</option>
                                    <option>Fair</option>
                                    <option>Poor</option>
                                    <option>New</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Storage Location</label>
                            <input type="text" placeholder="e.g. Storage Room A, Shelf 2" className="input-field" value={form.location} onChange={set('location')} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                            <textarea placeholder="Add any specific details, serial numbers, or notes..." className="input-field" style={{ height: '120px', resize: 'none' }} value={form.description} onChange={set('description')}></textarea>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upload Photo</label>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                <Camera size={24} />
                                <span style={{ fontSize: '0.9rem' }}>Click to upload or drag & drop</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => navigate('/inventory')} style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;
