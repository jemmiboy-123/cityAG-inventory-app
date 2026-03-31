import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    ChevronRight,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const navGroups = [
    {
        label: 'Overview',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard',     path: '/' },
            { icon: Package,         label: 'Inventory',     path: '/inventory' },
            { icon: HandHelping,     label: 'Borrowed Items', path: '/borrowed' },
        ],
    },
    {
        label: 'Management',
        items: [
            { icon: Wallet,   label: 'Accounting',  path: '/accounting' },
            { icon: Tags,     label: 'Categories',  path: '/categories' },
            { icon: BarChart3, label: 'Reports',    path: '/reports' },
        ],
    },
    {
        label: 'System',
        items: [
            { icon: Settings, label: 'Settings', path: '/settings' },
        ],
    },
];

const Sidebar = ({ darkMode, toggleDarkMode }) => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <aside className="sidebar glass">
            <div style={{ marginBottom: '2.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Logo size="small" />
            </div>

            <nav style={{ flex: 1 }}>
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="sidebar-section-label">{group.label}</p>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                            {group.items.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        end={item.path === '/'}
                                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                        style={({ isActive }) => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.7rem 1.1rem',
                                            borderRadius: '10px',
                                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                            backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                                            fontWeight: isActive ? '700' : '500',
                                            fontSize: '0.9rem',
                                            transition: 'var(--transition)',
                                        })}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                                    <span>{item.label}</span>
                                                </div>
                                                {isActive && <ChevronRight size={13} />}
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button className="theme-toggle" onClick={toggleDarkMode}>
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.7rem 1.1rem',
                        color: '#e55353',
                        fontWeight: '600',
                        fontSize: '0.88rem',
                        borderRadius: '10px',
                        transition: 'var(--transition)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
