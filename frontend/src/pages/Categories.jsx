import React from 'react';
import {
    Music,
    Coffee,
    PartyPopper,
    Wrench,
    BookOpen,
    Plus,
    MoreVertical
} from 'lucide-react';

const Categories = () => {
    const categories = [
        { name: 'Worship equipment', items: 124, icon: Music, color: '#3498db' },
        { name: 'Kitchen supplies', items: 86, icon: Coffee, color: '#e67e22' },
        { name: 'Event materials', items: 450, icon: PartyPopper, color: '#9b59b6' },
        { name: 'Maintenance tools', items: 32, icon: Wrench, color: '#7f8c8d' },
        { name: 'Education / Books', items: 592, icon: BookOpen, color: '#27ae60' },
    ];

    return (
        <div className="categories-page">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>Categories</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Organize your inventory with categories.</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} /> New Category
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {categories.map((cat, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: `${cat.color}15`,
                                color: cat.color,
                                padding: '0.75rem',
                                borderRadius: '12px'
                            }}>
                                <cat.icon size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{cat.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{cat.items} items</p>
                            </div>
                        </div>
                        <button style={{ color: 'var(--text-muted)' }}>
                            <MoreVertical size={18} />
                        </button>
                    </div>
                ))}

                <button className="card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderStyle: 'dashed',
                    color: 'var(--text-muted)',
                    padding: '2rem'
                }}>
                    <div style={{
                        border: '1px solid var(--border)',
                        padding: '0.5rem',
                        borderRadius: '50%'
                    }}>
                        <Plus size={20} />
                    </div>
                    <span>Add New Category</span>
                </button>
            </div>
        </div>
    );
};

export default Categories;
