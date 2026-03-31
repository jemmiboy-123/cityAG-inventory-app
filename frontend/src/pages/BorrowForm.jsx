import React, { useState, useEffect } from 'react';
import { User, Calendar, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const BorrowForm = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        item_id: '', borrower_name: '', ministry: '', borrow_date: new Date().toISOString().split('T')[0], due_date: '',
    });

    useEffect(() => {
        supabase.from('items').select('id, name').gt('quantity', 0).order('name').then(({ data }) => setItems(data || []));
    }, []);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.item_id) { setError('Please select an item.'); return; }
        setError('');
        setSaving(true);

        const { error } = await supabase.from('borrowed_items').insert({
            item_id: form.item_id,
            borrower_name: form.borrower_name,
            ministry: form.ministry,
            borrow_date: form.borrow_date,
            due_date: form.due_date || null,
        });

        if (error) {
            setError(error.message);
            setSaving(false);
        } else {
            navigate('/borrowed');
        }
    };

    return (
        <div className="borrow-form-page">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Borrow Item</h1>
                <p style={{ color: 'var(--text-muted)' }}>Record an item being taken for use.</p>
            </header>

            <div className="card" style={{ maxWidth: '600px' }}>
                {error && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Item *</label>
                        <select className="input-field" value={form.item_id} onChange={set('item_id')} required>
                            <option value="">Select an item from inventory...</option>
                            {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Borrower Name *</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Full Name" className="input-field" style={{ paddingLeft: '2.5rem' }} value={form.borrower_name} onChange={set('borrower_name')} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ministry / Group</label>
                        <input type="text" placeholder="e.g. Worship Team, Youth Ministry" className="input-field" value={form.ministry} onChange={set('ministry')} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Borrow Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="date" className="input-field" style={{ paddingLeft: '2.5rem' }} value={form.borrow_date} onChange={set('borrow_date')} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Expected Return Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="date" className="input-field" style={{ paddingLeft: '2.5rem' }} value={form.due_date} onChange={set('due_date')} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => navigate('/borrowed')} style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            <ClipboardCheck size={18} /> {saving ? 'Saving...' : 'Confirm Borrowing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BorrowForm;
