import React, { useState, useEffect } from 'react';
import { Music, Coffee, PartyPopper, Wrench, BookOpen, Plus, MoreVertical, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const iconMap = [Music, Coffee, PartyPopper, Wrench, BookOpen, Tag];
const colorMap = ['#3498db', '#e67e22', '#9b59b6', '#7f8c8d', '#27ae60', '#e74c3c'];

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

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
        if (!newName.trim()) return;
        setSaving(true);
        const colorIndex = categories.length % colorMap.length;
        await supabase.from('categories').insert({ name: newName.trim(), color: colorMap[colorIndex] });
        setNewName('');
        setShowForm(false);
        setSaving(false);
        fetchCategories();
    };

    return (
        <div className="categories-page">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>Categories</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Organize your inventory with categories.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> New Category
                </button>
            </header>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Category name"
                            className="input-field"
                            style={{ flex: 1 }}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Add'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {categories.map((cat, idx) => {
                        const Icon = iconMap[idx % iconMap.length];
                        const color = cat.color || colorMap[idx % colorMap.length];
                        const count = cat.items?.[0]?.count ?? 0;
                        return (
                            <div key={cat.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ backgroundColor: `${color}15`, color, padding: '0.75rem', borderRadius: '12px' }}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{cat.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{count} items</p>
                                    </div>
                                </div>
                                <button style={{ color: 'var(--text-muted)' }}>
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        );
                    })}

                    <button
                        className="card"
                        onClick={() => setShowForm(true)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderStyle: 'dashed', color: 'var(--text-muted)', padding: '2rem' }}>
                        <div style={{ border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '50%' }}>
                            <Plus size={20} />
                        </div>
                        <span>Add New Category</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Categories;
