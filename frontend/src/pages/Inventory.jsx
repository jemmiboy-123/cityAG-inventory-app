import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    Plus,
    ArrowUpDown,
    Download,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';

const Inventory = () => {
    const [viewMode, setViewMode] = useState('table');
    const [items] = useState([
        { id: 1, name: 'Projector - Epson 4K', category: 'Worship equipment', quantity: 2, location: 'Storage Room A', status: 'Available' },
        { id: 2, name: 'Sound Mixer - Behringer', category: 'Worship equipment', quantity: 1, location: 'Sanctuary', status: 'In Use' },
        { id: 3, name: 'Folding Chairs', category: 'Event materials', quantity: 120, location: 'Hall Basement', status: 'Available' },
        { id: 4, name: 'Coffee Maker', category: 'Kitchen supplies', quantity: 2, location: 'Kitchen', status: 'Available' },
        { id: 5, name: 'Wireless Mics (Set of 4)', category: 'Worship equipment', quantity: 1, location: 'Sanctuary', status: 'Borrowed' },
        { id: 6, name: 'Paper Plates (Bulk)', category: 'Kitchen supplies', quantity: 5, location: 'Kitchen Pantry', status: 'Low Stock' },
    ]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Available': return { bg: '#eefdf3', text: '#2ecc71', glow: 'rgba(46, 204, 113, 0.2)' };
            case 'In Use':
            case 'Borrowed': return { bg: '#ebf5ff', text: '#3498db', glow: 'rgba(52, 152, 219, 0.2)' };
            case 'Low Stock': return { bg: '#fff8eb', text: '#e67e22', glow: 'rgba(230, 126, 34, 0.2)' };
            default: return { bg: '#f4f6f8', text: '#636e72', glow: 'rgba(0,0,0,0.05)' };
        }
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
                    <button className="glass" style={{ padding: '0.8rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--text-muted)' }}>
                        <Download size={18} /> Export List
                    </button>
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
                        />
                    </div>

                    <div className="glass" style={{ display: 'flex', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: viewMode === 'table' ? 'var(--surface)' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'table' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: viewMode === 'grid' ? 'var(--surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.25rem', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', fontWeight: '600' }}>
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
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
                                const status = getStatusStyles(item.status);
                                return (
                                    <tr key={item.id} className="table-row-hover" style={{ transition: 'var(--transition)' }}>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '600', fontSize: '1rem' }}>{item.name}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.quantity}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item.location}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                backgroundColor: status.bg,
                                                color: status.text,
                                                padding: '6px 12px',
                                                borderRadius: '30px',
                                                boxShadow: `0 2px 8px ${status.glow}`
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.text }} />
                                                {item.status}
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
                </div>

                <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        Displaying <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>6</span> of 1,284 church assets
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button disabled className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', opacity: 0.5, fontWeight: '600' }}>Previous</button>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700', boxShadow: '0 4px 10px var(--primary-glow)' }}>1</button>
                            <button style={{ width: '40px', height: '40px', borderRadius: '10px', fontWeight: '600' }}>2</button>
                            <button style={{ width: '40px', height: '40px', borderRadius: '10px', fontWeight: '600' }}>3</button>
                        </div>
                        <button className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: '600' }}>Next</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Inventory;
