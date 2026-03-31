import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, AlertTriangle, PlusCircle, ArrowUpRight, ArrowDownLeft,
    ChevronRight, TrendingUp, TrendingDown, Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, lowStock: 0, onLoan: 0, recentlyAdded: 0 });
    const [activity, setActivity] = useState([]);
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Friend';

    useEffect(() => {
        fetchStats();
        fetchActivity();
    }, []);

    const fetchStats = async () => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [{ count: total }, { count: lowStock }, { count: onLoan }, { count: recentlyAdded }] = await Promise.all([
            supabase.from('items').select('*', { count: 'exact', head: true }),
            supabase.from('items').select('*', { count: 'exact', head: true }).lte('quantity', 2).gt('quantity', 0),
            supabase.from('borrowed_items').select('*', { count: 'exact', head: true }).is('returned_at', null),
            supabase.from('items').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        ]);

        setStats({ total: total || 0, lowStock: lowStock || 0, onLoan: onLoan || 0, recentlyAdded: recentlyAdded || 0 });
    };

    const fetchActivity = async () => {
        const { data } = await supabase
            .from('borrowed_items')
            .select('id, borrower_name, ministry, created_at, returned_at, items(name)')
            .order('created_at', { ascending: false })
            .limit(5);
        setActivity(data || []);
    };

    const handleReturn = async (id) => {
        await supabase.from('borrowed_items').update({ returned_at: new Date().toISOString() }).eq('id', id);
        fetchActivity();
        fetchStats();
    };

    const statCards = [
        { label: 'Total Items',      value: stats.total,         icon: Package,       accent: '#4a7c59', lightBg: '#f0f7f1', trendUp: true },
        { label: 'Low Stock',        value: stats.lowStock,      icon: AlertTriangle, accent: '#c2792a', lightBg: '#fdf3e7', trendUp: false },
        { label: 'On Loan',          value: stats.onLoan,        icon: ArrowUpRight,  accent: '#2a72b5', lightBg: '#e8f0fa', trendUp: false },
        { label: 'Added This Week',  value: stats.recentlyAdded, icon: PlusCircle,    accent: '#7b4fa6', lightBg: '#f3edf9', trendUp: true },
    ];

    const activityConfig = {
        borrow: { label: 'Out', color: '#2a72b5', bg: '#e8f0fa', Icon: ArrowUpRight },
        return: { label: 'In',  color: '#38a169', bg: '#eafaf3', Icon: ArrowDownLeft },
    };

    return (
        <div className="dashboard-page animate-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.4rem', opacity: 0.8 }}>
                        {dayName} · City Assembly of God
                    </p>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', lineHeight: 1.15, color: 'var(--text-main)' }}>
                        Peace be with you, <span className="text-gradient">{firstName}</span>
                    </h1>
                    {stats.lowStock > 0 && (
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.45rem', fontSize: '0.95rem' }}>
                            {stats.lowStock} low-stock item{stats.lowStock > 1 ? 's' : ''} need your attention today.
                        </p>
                    )}
                </div>
                <Link to="/items/new" className="btn-primary">
                    <PlusCircle size={17} /> Add Item
                </Link>
            </header>

            {/* Stat Cards */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
                {statCards.map((stat, idx) => (
                    <div key={idx} className="stat-simple" style={{ borderLeft: `4px solid ${stat.accent}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                            <div style={{ background: stat.lightBg, color: stat.accent, padding: '0.55rem', borderRadius: '10px' }}>
                                <stat.icon size={18} strokeWidth={2.2} />
                            </div>
                            {stat.trendUp ? <TrendingUp size={14} color="#4a7c59" /> : <TrendingDown size={14} color="#c2792a" />}
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-1.5px', color: 'var(--text-main)', lineHeight: 1 }}>
                            {stat.value}
                        </p>
                        <p style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>
                            {stat.label}
                        </p>
                    </div>
                ))}
            </section>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '1.25rem' }}>
                {/* Quick Actions */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={16} color="var(--primary)" fill="var(--primary)" /> Quick Actions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <Link to="/items/new" className="action-row green">
                            <div style={{ background: '#f0f7f1', color: '#4a7c59', padding: '0.55rem', borderRadius: '9px', flexShrink: 0 }}>
                                <PlusCircle size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>Add Inventory Item</p>
                                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '1px' }}>Record a new asset or equipment</p>
                            </div>
                            <ChevronRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        </Link>
                        <Link to="/borrow/new" className="action-row blue">
                            <div style={{ background: '#e8f0fa', color: '#2a72b5', padding: '0.55rem', borderRadius: '9px', flexShrink: 0 }}>
                                <ArrowUpRight size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>Record a Loan</p>
                                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '1px' }}>Log an item going out to a ministry</p>
                            </div>
                            <ChevronRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        </Link>
                        <Link to="/borrowed" className="action-row teal">
                            <div style={{ background: '#eafaf3', color: '#38a169', padding: '0.55rem', borderRadius: '9px', flexShrink: 0 }}>
                                <ArrowDownLeft size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>View Borrowed Items</p>
                                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '1px' }}>Mark borrowed items as returned</p>
                            </div>
                            <ChevronRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>Recent Loans</h2>
                        <Link to="/borrowed" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', background: 'var(--primary-glow)', padding: '3px 10px', borderRadius: '6px' }}>
                            View All
                        </Link>
                    </div>

                    {activity.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No loan activity yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', flex: 1 }}>
                            {activity.map((record, idx) => {
                                const type = record.returned_at ? 'return' : 'borrow';
                                const cfg = activityConfig[type];
                                const Icon = cfg.Icon;
                                const isLast = idx === activity.length - 1;
                                return (
                                    <div key={record.id} style={{ display: 'flex', gap: '0.85rem', paddingBottom: isLast ? 0 : '1rem', marginBottom: isLast ? 0 : '1rem', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                                        <div style={{ background: cfg.bg, color: cfg.color, padding: '0.5rem', borderRadius: '10px', height: 'fit-content', flexShrink: 0 }}>
                                            <Icon size={15} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                                                <p style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {record.items?.name}
                                                </p>
                                                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: cfg.color, background: cfg.bg, padding: '1px 7px', borderRadius: '20px', flexShrink: 0 }}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '500' }}>{record.borrower_name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
