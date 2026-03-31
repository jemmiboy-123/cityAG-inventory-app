import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Filter, MoreVertical, Plus, ArrowUpDown, Download, LayoutGrid, List as ListIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const getStatusStyles = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', bg: '#fff5f5', text: '#e53e3e', glow: 'rgba(229,83,83,0.2)' };
    if (quantity <= 2)  return { label: 'Low Stock',    bg: '#fff8eb', text: '#e67e22', glow: 'rgba(230,126,34,0.2)' };
    return { label: 'Available', bg: '#eefdf3', text: '#2ecc71', glow: 'rgba(46,204,113,0.2)' };
};

const Inventory = () => {
    const [viewMode, setViewMode] = useState('table');
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, [search]);

    const fetchItems = async () => {
        setLoading(true);
        let query = supabase
            .from('items')
            .select('*, categories(name)')
            .order('created_at', { ascending: false });

        if (search) query = query.ilike('name', `%${search}%`);

        const { data } = await query;
        setItems(data || []);
        setLoading(false);
    };

    return (
        <div className="inventory-page animate-in">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient">Sacred Assets</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Curating and managing the resources of City Assembly of God.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/items/new" className="btn-primary">
                        <Plus size={18} /> Add New Item
                    </Link>
                </div>
            </header>

            <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.6 }} />
                        <input
                            type="text"
                            placeholder="Find equipment, supplies, or furniture..."
                            className="input-field"
                            style={{ paddingLeft: '3.2rem', backgroundColor: 'var(--bg-color)', border: 'none' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="glass" style={{ display: 'flex', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: viewMode === 'table' ? 'var(--surface)' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)' }}>
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: viewMode === 'grid' ? 'var(--surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)' }}>
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                    ) : items.length === 0 ? (
                        <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No items found. <Link to="/items/new" style={{ color: 'var(--primary)' }}>Add your first item.</Link>
                        </p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgba(0,0,0,0.01)' }}>
                                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Asset Name <ArrowUpDown size={14} /></div>
                                    </th>
                                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</th>
                                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Qty</th>
                                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</th>
                                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const status = getStatusStyles(item.quantity);
                                    return (
                                        <tr key={item.id} className="table-row-hover" style={{ transition: 'var(--transition)' }}>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '600', fontSize: '1rem' }}>{item.name}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                                                    {item.categories?.name || '—'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.quantity}</td>
                                            <td style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item.location || '—'}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                    fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                    backgroundColor: status.bg, color: status.text,
                                                    padding: '6px 12px', borderRadius: '30px',
                                                    boxShadow: `0 2px 8px ${status.glow}`
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.text }} />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                <button className="glass" style={{ padding: '8px', borderRadius: '10px' }}>
                                                    <MoreVertical size={20} color="var(--text-muted)" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        Showing <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{items.length}</span> items
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Inventory;
