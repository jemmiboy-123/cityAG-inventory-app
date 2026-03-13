import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    HandHelping,
    Tags,
    BarChart3,
    Settings,
    Moon,
    Sun,
    LogOut,
    Wallet,
    ChevronRight
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ darkMode, toggleDarkMode }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: HandHelping, label: 'Borrowed Items', path: '/borrowed' },
        { icon: Wallet, label: 'Accounting', path: '/accounting' },
        { icon: Tags, label: 'Categories', path: '/categories' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="sidebar glass">
            <div className="sidebar-logo-wrapper" style={{ marginBottom: '3.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Logo size="small" />
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.85rem 1.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                    backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                                    fontWeight: isActive ? '700' : '500',
                                    transition: 'var(--transition)',
                                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                                })}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                            <span>{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight size={14} />}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={toggleDarkMode}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0.85rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--border)',
                        fontWeight: '600'
                    }}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                </button>

                <NavLink
                    to="/login"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0.85rem 1.25rem',
                        color: '#ff4757',
                        fontWeight: '700',
                        fontSize: '0.95rem'
                    }}
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
