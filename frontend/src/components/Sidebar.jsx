import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, Tags, BarChart3,
    Settings, Moon, Sun, LogOut, Wallet,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const navGroups = [
    {
        label: 'Overview',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
            { icon: Package,         label: 'Inventory', path: '/inventory' },
        ],
    },
    {
        label: 'Management',
        items: [
            { icon: Wallet,    label: 'Accounting', path: '/accounting' },
            { icon: Tags,      label: 'Categories', path: '/categories' },
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
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const initials = (
        (user?.user_metadata?.first_name?.[0] || user?.email?.[0] || '?') +
        (user?.user_metadata?.last_name?.[0] || '')
    ).toUpperCase();

    const displayName = user?.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
        : user?.email || 'Guest';

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <Logo size="small" />
            </div>

            <nav className="sidebar-nav">
                {navGroups.map(group => (
                    <div key={group.label} className="sidebar-group">
                        <p className="sidebar-section-label">{group.label}</p>
                        <ul>
                            {group.items.map(item => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        end={item.path === '/'}
                                        className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
                                    >
                                        <item.icon size={18} strokeWidth={2} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-foot">
                <div className="sidebar-user">
                    <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
                    <div className="sidebar-user-meta">
                        <p className="sidebar-user-name">{displayName}</p>
                        {user?.email && <p className="sidebar-user-email">{user.email}</p>}
                    </div>
                </div>

                <button className="sidebar-action" onClick={toggleDarkMode}>
                    {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                    <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
                </button>

                <button className="sidebar-action sidebar-action--danger" onClick={handleSignOut}>
                    <LogOut size={17} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
