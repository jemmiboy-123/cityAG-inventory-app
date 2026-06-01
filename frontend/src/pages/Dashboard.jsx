import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, AlertTriangle, PlusCircle, Tags, ArchiveX,
    ArrowRight, Inbox, Layers, Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const Dashboard = () => {
    const { user } = useAuth();
    const { preferences } = usePreferences();
    const threshold = preferences.low_stock_threshold;
    const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0, recentlyAdded: 0 });
    const [lowStockItems, setLowStockItems] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [recentItems, setRecentItems] = useState([]);

    const today = new Date();
    const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const hour = today.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Friend';

    useEffect(() => {
        fetchStats();
        fetchLowStock();
        fetchCategoryBreakdown();
        fetchRecentItems();
    }, [threshold]);

    const fetchStats = async () => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [
            { count: total },
            { count: lowStock },
            { count: outOfStock },
            { count: recentlyAdded },
        ] = await Promise.all([
            supabase.from('items').select('*', { count: 'exact', head: true }),
            supabase.from('items').select('*', { count: 'exact', head: true })
                .eq('track_stock', true).lte('quantity', threshold).gt('quantity', 0),
            supabase.from('items').select('*', { count: 'exact', head: true })
                .eq('track_stock', true).eq('quantity', 0),
            supabase.from('items').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        ]);
        setStats({
            total: total || 0,
            lowStock: lowStock || 0,
            outOfStock: outOfStock || 0,
            recentlyAdded: recentlyAdded || 0,
        });
    };

    const fetchLowStock = async () => {
        const { data } = await supabase
            .from('items')
            .select('id, name, quantity, location, categories(name)')
            .eq('track_stock', true)
            .lte('quantity', threshold)
            .order('quantity', { ascending: true })
            .limit(5);
        setLowStockItems(data || []);
    };

    const fetchCategoryBreakdown = async () => {
        const { data } = await supabase
            .from('items')
            .select('id, categories(name, color)');
        const map = new Map();
        (data || []).forEach(item => {
            const name = item.categories?.name || 'Uncategorized';
            const color = item.categories?.color || '#8b939c';
            const entry = map.get(name) || { name, color, count: 0 };
            entry.count += 1;
            map.set(name, entry);
        });
        const arr = [...map.values()].sort((a, b) => b.count - a.count);
        setCategoryBreakdown(arr);
    };

    const fetchRecentItems = async () => {
        const { data } = await supabase
            .from('items')
            .select('id, name, created_at, categories(name)')
            .order('created_at', { ascending: false })
            .limit(5);
        setRecentItems(data || []);
    };

    const summary = [
        { label: 'Total inventory', value: stats.total,         hint: 'items in catalog' },
        { label: 'Low stock',       value: stats.lowStock,      hint: `at or below ${threshold}`, alert: stats.lowStock > 0 },
        { label: 'Out of stock',    value: stats.outOfStock,    hint: 'needs restock',   alert: stats.outOfStock > 0 },
        { label: 'Added this week', value: stats.recentlyAdded, hint: 'past 7 days' },
    ];

    const actions = [
        { to: '/items/new',  icon: PlusCircle, label: 'Add inventory item', hint: 'Catalog a new asset or piece of equipment' },
        { to: '/inventory',  icon: Package,    label: 'View all inventory', hint: 'Browse and search every catalogued item' },
        { to: '/categories', icon: Tags,       label: 'Manage categories',  hint: 'Organize inventory by ministry or purpose' },
    ];

    return (
        <div className="dashboard-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Good {timeOfDay}, {firstName}.</h1>
                    <p className="dash-subtitle">{dateLabel} &middot; City Assembly of God inventory</p>
                </div>
                <Link to="/items/new" className="btn-primary btn-primary--compact">
                    <PlusCircle size={15} strokeWidth={2.2} /> Add Item
                </Link>
            </header>

            {(stats.lowStock > 0 || stats.outOfStock > 0) && (
                <div className="dash-banner" role="status">
                    <AlertTriangle size={15} strokeWidth={2.2} />
                    <span>
                        {stats.outOfStock > 0 && (
                            <><strong>{stats.outOfStock}</strong> item{stats.outOfStock > 1 ? 's are' : ' is'} out of stock. </>
                        )}
                        {stats.lowStock > 0 && (
                            <><strong>{stats.lowStock}</strong> running low.{' '}</>
                        )}
                        <Link to="/inventory" className="dash-banner-link">Review stock</Link>
                    </span>
                </div>
            )}

            <section className="summary-strip" aria-label="Inventory summary">
                {summary.map((s, i) => (
                    <div key={i} className={`summary-cell${s.alert ? ' is-alert' : ''}`}>
                        <p className="summary-label">{s.label}</p>
                        <p className="summary-value">{s.value}</p>
                        <p className="summary-hint">{s.hint}</p>
                    </div>
                ))}
            </section>

            <div className="dash-grid">
                <section className="panel">
                    <div className="panel-head">
                        <h2 className="panel-title">Quick actions</h2>
                    </div>
                    <ul className="action-list">
                        {actions.map((a, i) => {
                            const Icon = a.icon;
                            return (
                                <li key={i}>
                                    <Link to={a.to} className="action-item">
                                        <Icon size={16} strokeWidth={2} className="action-icon" />
                                        <div className="action-body">
                                            <p className="action-label">{a.label}</p>
                                            <p className="action-hint">{a.hint}</p>
                                        </div>
                                        <ArrowRight size={14} className="action-arrow" />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section className="panel">
                    <div className="panel-head">
                        <h2 className="panel-title">Low stock</h2>
                        <Link to="/inventory" className="panel-link">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Inbox size={18} strokeWidth={1.6} /></div>
                            <p className="empty-title">Inventory looks healthy</p>
                            <p className="empty-hint">Items running low will appear here for restocking.</p>
                        </div>
                    ) : (
                        <ul className="activity-list">
                            {lowStockItems.map(item => {
                                const isOut = item.quantity === 0;
                                return (
                                    <li key={item.id} className="activity-row">
                                        <span className={`activity-dot ${isOut ? 'danger' : 'warn'}`} aria-hidden="true" />
                                        <div className="activity-body">
                                            <p className="activity-item-name">{item.name}</p>
                                            <p className="activity-meta">
                                                {item.categories?.name || 'Uncategorized'}
                                                {item.location ? ` · ${item.location}` : ''}
                                            </p>
                                        </div>
                                        <div className="activity-right">
                                            <span className={`activity-status ${isOut ? 'danger' : 'warn'}`}>
                                                {isOut ? 'Out' : `${item.quantity} left`}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            <div className="dash-grid" style={{ marginTop: '1.25rem' }}>
                <section className="panel">
                    <div className="panel-head">
                        <h2 className="panel-title">Inventory by category</h2>
                        <Link to="/categories" className="panel-link">
                            Manage <ArrowRight size={12} />
                        </Link>
                    </div>

                    {categoryBreakdown.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Layers size={18} strokeWidth={1.6} /></div>
                            <p className="empty-title">No items yet</p>
                            <p className="empty-hint">Add inventory to see how it breaks down by category.</p>
                        </div>
                    ) : (
                        <ul className="bar-list">
                            {categoryBreakdown.map((c, i) => {
                                const pct = stats.total ? Math.round((c.count / stats.total) * 100) : 0;
                                return (
                                    <li key={i}>
                                        <div className="bar-head">
                                            <span className="bar-name">
                                                <span className="bar-swatch" style={{ background: c.color }} />
                                                {c.name}
                                            </span>
                                            <span className="bar-pct">{pct}%</span>
                                        </div>
                                        <div className="bar-track">
                                            <div className="bar-fill" style={{ width: `${pct}%`, background: c.color }} />
                                        </div>
                                        <p className="bar-value">{c.count} item{c.count !== 1 ? 's' : ''}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className="panel">
                    <div className="panel-head">
                        <h2 className="panel-title">Recently added</h2>
                        <Link to="/inventory" className="panel-link">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {recentItems.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Clock size={18} strokeWidth={1.6} /></div>
                            <p className="empty-title">Nothing added yet</p>
                            <p className="empty-hint">Newly catalogued items will show up here.</p>
                        </div>
                    ) : (
                        <ul className="activity-list">
                            {recentItems.map(item => (
                                <li key={item.id} className="activity-row">
                                    <span className="activity-dot in" aria-hidden="true" />
                                    <div className="activity-body">
                                        <p className="activity-item-name">{item.name}</p>
                                        <p className="activity-meta">{item.categories?.name || 'Uncategorized'}</p>
                                    </div>
                                    <div className="activity-right">
                                        <span className="activity-time">
                                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
