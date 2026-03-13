import React from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    AlertTriangle,
    PlusCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Clock,
    User,
    ChevronRight,
    Zap
} from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { label: 'Total Items', value: '1,284', icon: Package, color: 'var(--primary)', trend: '+12% this month' },
        { label: 'Low Stock', value: '12', icon: AlertTriangle, color: '#e67e22', trend: '2 items added today' },
        { label: 'Borrowed', value: '45', icon: ArrowUpRight, color: '#3182ce', trend: '5 due this week' },
        { label: 'Recently Added', value: '28', icon: PlusCircle, color: '#9b59b6', trend: '+4 this week' },
    ];

    const recentActivities = [
        { id: 1, action: 'Borrowed', item: 'Yamaha Keyboard', user: 'Worship Team', date: '2 hours ago', type: 'borrow' },
        { id: 2, action: 'Returned', item: 'Sound Mixer', user: 'Tech Ministry', date: '5 hours ago', type: 'return' },
        { id: 3, action: 'Added', item: '10x Folding Chairs', user: 'Admin', date: 'Yesterday', type: 'add' },
    ];

    return (
        <div className="dashboard-page animate-in">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient">Peace be with you, Grace</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Your church inventory is looking healthy today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="glass" style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 'var(--text-muted)'
                    }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <Link to="/items/new" className="btn-primary">
                        <PlusCircle size={18} /> Add Item
                    </Link>
                </div>
            </header>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{
                                backgroundColor: idx === 0 ? 'var(--primary-glow)' : `${stat.color}15`,
                                color: idx === 0 ? 'var(--primary)' : stat.color,
                                padding: '1.25rem',
                                borderRadius: '18px',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                            }}>
                                <stat.icon size={32} strokeWidth={2.2} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2ecc71', backgroundColor: '#eefdf3', padding: '4px 10px', borderRadius: '20px' }}>
                                LIVE
                            </span>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{stat.value}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.8 }}>{stat.trend}</p>
                        </div>
                    </div>
                ))}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem' }}>
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Zap size={22} color="var(--primary)" /> Quick Actions
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <Link to="/items/new" className="card" style={{
                            textAlign: 'center',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '2px dashed var(--border)',
                            backgroundColor: 'transparent'
                        }}>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '50%' }}>
                                <PlusCircle size={32} />
                            </div>
                            <span style={{ fontWeight: '600' }}>New Inventory</span>
                        </Link>
                        <Link to="/borrow/new" className="card" style={{
                            textAlign: 'center',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '2px dashed var(--border)',
                            backgroundColor: 'transparent'
                        }}>
                            <div style={{ padding: '1rem', backgroundColor: '#ebf5ff', color: '#3182ce', borderRadius: '50%' }}>
                                <ArrowUpRight size={32} />
                            </div>
                            <span style={{ fontWeight: '600' }}>Borrow Asset</span>
                        </Link>
                        <button className="card" style={{
                            textAlign: 'center',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '2px dashed var(--border)',
                            backgroundColor: 'transparent'
                        }}>
                            <div style={{ padding: '1rem', backgroundColor: '#eefdf3', color: '#2ecc71', borderRadius: '50%' }}>
                                <ArrowDownLeft size={32} />
                            </div>
                            <span style={{ fontWeight: '600' }}>Return Asset</span>
                        </button>
                    </div>
                </section>

                <section className="card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.3rem' }}>Recent Pulse</h2>
                        <button style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>All History</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {recentActivities.map(activity => (
                            <div key={activity.id} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{
                                    backgroundColor: activity.type === 'borrow' ? '#ebf5ff' : activity.type === 'return' ? '#eefdf3' : '#f3e8ff',
                                    color: activity.type === 'borrow' ? '#3182ce' : activity.type === 'return' ? '#38a169' : '#805ad5',
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    height: 'fit-content'
                                }}>
                                    {activity.type === 'borrow' ? <ArrowUpRight size={20} /> : activity.type === 'return' ? <ArrowDownLeft size={20} /> : <PlusCircle size={20} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-main)' }}>{activity.item}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                        <User size={14} color="var(--text-muted)" />
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activity.user}</p>
                                        <span style={{ color: 'var(--border)' }}>•</span>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activity.date}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--border)" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
