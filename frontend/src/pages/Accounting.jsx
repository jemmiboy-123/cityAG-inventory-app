import React, { useState } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Download,
    PieChart
} from 'lucide-react';

const Accounting = () => {
    const [transactions] = useState([
        { id: 1, date: '2024-03-12', description: 'Sunday Tithes & Offerings', category: 'Income', amount: 4520.00, type: 'credit' },
        { id: 2, date: '2024-03-11', description: 'Electricity Bill - Sanctuary', category: 'Utilities', amount: -650.50, type: 'debit' },
        { id: 3, date: '2024-03-10', description: 'Worship Team Guitar Strings', category: 'Maintenance', amount: -45.00, type: 'debit' },
        { id: 4, date: '2024-03-08', description: 'Special Mission Donation', category: 'Missions', amount: 1200.00, type: 'credit' },
        { id: 5, date: '2024-03-05', description: 'Aircon Cleaning Service', category: 'Maintenance', amount: -120.00, type: 'debit' },
    ]);

    const stats = [
        { label: 'Total Balance', value: '₱124,500.45', icon: Wallet, color: '#556b2f' },
        { label: 'This Month Income', value: '₱45,200.00', icon: TrendingUp, color: '#2ecc71' },
        { label: 'This Month Expenses', value: '₱12,850.50', icon: TrendingDown, color: '#e74c3c' },
    ];

    return (
        <div className="accounting-page">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>Accounting & Finance</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track church income, expenses, and financial health.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        backgroundColor: 'var(--surface)'
                    }}>
                        <Download size={18} /> Export Report
                    </button>
                    <button className="btn-primary">
                        <Plus size={18} /> Add Transaction
                    </button>
                </div>
            </header>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            backgroundColor: `${stat.color}15`,
                            color: stat.color,
                            padding: '1rem',
                            borderRadius: '12px'
                        }}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem' }}>Recent Transactions</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" placeholder="Search..." className="input-field" style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', width: '200px', fontSize: '0.9rem' }} />
                            </div>
                            <button style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}><Filter size={18} /></button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Date</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Description</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Category</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', textAlign: 'right' }}>Amount</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{t.date}</td>
                                        <td style={{ padding: '1rem', fontWeight: '500', fontSize: '0.95rem' }}>{t.description}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ backgroundColor: '#f0f4f8', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>{t.category}</span>
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '700',
                                            color: t.type === 'credit' ? '#2ecc71' : '#e74c3c'
                                        }}>
                                            {t.type === 'credit' ? '+' : ''}{t.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="card">
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieChart size={20} color="var(--primary)" /> Budget Distribution
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { name: 'Tithes & Offerings', percent: 65, color: '#556b2f' },
                            { name: 'Missions', percent: 15, color: '#3498db' },
                            { name: 'Building Fund', percent: 10, color: '#f1c40f' },
                            { name: 'Youth Ministry', percent: 10, color: '#9b59b6' },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>{item.name}</span>
                                    <span style={{ fontWeight: '600' }}>{item.percent}%</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${item.percent}%`, backgroundColor: item.color, borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button style={{ width: '100%', padding: '0.75rem', marginTop: '2rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
                        Configure Budget Goals
                    </button>
                </section>
            </div>
        </div>
    );
};

export default Accounting;
