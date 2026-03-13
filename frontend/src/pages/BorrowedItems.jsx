import React from 'react';
import {
    ArrowUpRight,
    User,
    Calendar,
    Search,
    CheckCircle2,
    Clock
} from 'lucide-react';

const BorrowedItems = () => {
    const borrowedItems = [
        { id: 1, item: 'Yamaha Keyboard', borrower: 'Worship Team', date: '2024-03-10', expectedReturn: '2024-03-15', status: 'In Use' },
        { id: 2, item: 'Projector - Epson', borrower: 'Admin Office', date: '2024-03-12', expectedReturn: '2024-03-13', status: 'Due Today' },
        { id: 3, item: 'Sound Mixer', borrower: 'Tech Ministry', date: '2024-03-05', expectedReturn: '2024-03-07', status: 'Overdue' },
    ];

    return (
        <div className="borrowed-items-page">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>Borrowed Items</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track items currently being used by ministries.</p>
                </div>
            </header>

            <section className="card">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by item or borrower..."
                            className="input-field"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {borrowedItems.map((record) => (
                        <div key={record.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{
                                    backgroundColor: record.status === 'Overdue' ? '#fff5f5' : record.status === 'Due Today' ? '#fffaf0' : '#f0f9ff',
                                    color: record.status === 'Overdue' ? '#e53e3e' : record.status === 'Due Today' ? '#dd6b20' : '#3182ce',
                                    padding: '0.75rem',
                                    borderRadius: '12px'
                                }}>
                                    <ArrowUpRight size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{record.item}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={14} /> {record.borrower}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {record.date}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Expected Return</p>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: record.status === 'Overdue' ? '#e53e3e' : 'var(--text-main)'
                                    }}>
                                        {record.expectedReturn}
                                    </p>
                                </div>
                                <button style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '10px',
                                    backgroundColor: 'var(--bg-color)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--primary)',
                                    fontWeight: '500'
                                }}>
                                    <CheckCircle2 size={16} /> Return
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BorrowedItems;
