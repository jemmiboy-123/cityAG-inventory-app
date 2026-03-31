import React, { useState, useEffect } from 'react';
import { ArrowUpRight, User, Calendar, Search, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const getStatus = (dueDate) => {
    if (!dueDate) return { label: 'In Use', bg: '#f0f9ff', color: '#3182ce' };
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today)  return { label: 'Overdue',   bg: '#fff5f5', color: '#e53e3e' };
    if (dueDate === today) return { label: 'Due Today', bg: '#fffaf0', color: '#dd6b20' };
    return { label: 'In Use', bg: '#f0f9ff', color: '#3182ce' };
};

const BorrowedItems = () => {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBorrowed();
    }, []);

    const fetchBorrowed = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('borrowed_items')
            .select('*, items(name)')
            .is('returned_at', null)
            .order('created_at', { ascending: false });
        setRecords(data || []);
        setLoading(false);
    };

    const handleReturn = async (id) => {
        await supabase
            .from('borrowed_items')
            .update({ returned_at: new Date().toISOString() })
            .eq('id', id);
        fetchBorrowed();
    };

    const filtered = records.filter((r) =>
        r.items?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.borrower_name?.toLowerCase().includes(search.toLowerCase())
    );

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
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No active borrows found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filtered.map((record) => {
                            const status = getStatus(record.due_date);
                            return (
                                <div key={record.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ backgroundColor: status.bg, color: status.color, padding: '0.75rem', borderRadius: '12px' }}>
                                            <ArrowUpRight size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{record.items?.name}</h3>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <User size={14} /> {record.borrower_name}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} /> {record.borrow_date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Expected Return</p>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: status.color }}>
                                                {record.due_date || '—'}
                                            </p>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: status.color }}>{status.label}</span>
                                        </div>
                                        <button
                                            onClick={() => handleReturn(record.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', borderRadius: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border)', color: 'var(--primary)', fontWeight: '500', cursor: 'pointer' }}>
                                            <CheckCircle2 size={16} /> Return
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default BorrowedItems;
