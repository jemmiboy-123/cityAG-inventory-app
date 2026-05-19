import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, Pencil, Trash2, Columns3, Hand, Undo2, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';

const TOGGLEABLE_COLUMNS = [
    { key: 'category', label: 'Category' },
    { key: 'brand',    label: 'Brand',                          cellClass: 'muted' },
    { key: 'location', label: 'Location',                       cellClass: 'muted' },
    { key: 'quantity', label: 'Qty',      headerClass: 'right', cellClass: 'right strong' },
    { key: 'borrowed', label: 'Borrowed', headerClass: 'right', cellClass: 'right' },
    { key: 'stock',    label: 'Stock' },
    { key: 'status',   label: 'Status',                         cellClass: 'muted' },
    { key: 'added_by', label: 'Added by',                       cellClass: 'muted' },
];

const COLS_STORAGE_KEY = 'inventory.visibleCols.v4';
const DEFAULT_VISIBLE_COLS = {
    category: true, quantity: true, borrowed: true, location: true, stock: true,
    status: false, brand: false, added_by: false,
};

const Inventory = () => {
    const { preferences } = usePreferences();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const threshold = preferences.low_stock_threshold;

    const getStatus = (item) => {
        if (!item.track_stock) return null;
        if (item.quantity === 0) {
            return borrowedQtyFor(item.id) > 0
                ? { label: 'All on loan',  tone: 'warn'   }
                : { label: 'Out of stock', tone: 'danger' };
        }
        if (item.quantity <= threshold) return { label: 'Low stock', tone: 'warn' };
        return                            { label: 'Available',      tone: 'ok'   };
    };

    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [colsMenuOpen, setColsMenuOpen] = useState(false);
    const [visibleCols, setVisibleCols] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(COLS_STORAGE_KEY) || 'null');
            return stored && typeof stored === 'object'
                ? { ...DEFAULT_VISIBLE_COLS, ...stored }
                : DEFAULT_VISIBLE_COLS;
        } catch {
            return DEFAULT_VISIBLE_COLS;
        }
    });

    // Borrowings
    const [borrowings, setBorrowings] = useState([]);
    const [users, setUsers] = useState([]);
    const [borrowModal, setBorrowModal] = useState(null);
    const [returnModal, setReturnModal] = useState(null);
    const [borrowForm, setBorrowForm] = useState({ borrower_id: '', quantity: 1, due_at: '', notes: '' });
    const [borrowSubmitting, setBorrowSubmitting] = useState(false);
    const [borrowError, setBorrowError] = useState('');

    const menuRef = useRef(null);
    const colsMenuRef = useRef(null);

    useEffect(() => { fetchItems(); }, [search]);
    useEffect(() => { fetchBorrowings(); fetchUsers(); }, []);

    useEffect(() => {
        localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(visibleCols));
    }, [visibleCols]);

    useEffect(() => {
        if (openMenuId === null) return;
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [openMenuId]);

    useEffect(() => {
        if (!colsMenuOpen) return;
        const onClick = (e) => {
            if (colsMenuRef.current && !colsMenuRef.current.contains(e.target)) setColsMenuOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [colsMenuOpen]);

    const fetchItems = async () => {
        setLoading(true);
        let query = supabase
            .from('items')
            .select('*, categories(name, color)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (search) query = query.ilike('name', `%${search}%`);
        const { data } = await query;
        setItems(data || []);
        setLoading(false);
    };

    const fetchBorrowings = async () => {
        const { data } = await supabase
            .from('borrowings')
            .select('*')
            .is('returned_at', null)
            .order('borrowed_at', { ascending: false });
        setBorrowings(data || []);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .not('email', 'is', null)
            .order('first_name', { nullsLast: true });
        setUsers(data || []);
    };

    const userDisplayName = (u) => {
        if (!u) return null;
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
        return name || u.email;
    };

    const userById = (id) => users.find(u => u.id === id);

    const displayUser = (id, fallbackEmail) => {
        const u = userById(id);
        return userDisplayName(u) || fallbackEmail || '—';
    };

    const activeBorrowingsFor = (itemId) => borrowings.filter(b => b.item_id === itemId);
    const borrowedQtyFor = (itemId) => activeBorrowingsFor(itemId).reduce((s, b) => s + b.quantity, 0);

    const handleEdit = (item) => {
        setOpenMenuId(null);
        navigate(`/items/${item.id}/edit`);
    };

    const handleDeleteClick = (item) => {
        setOpenMenuId(null);
        setConfirmDelete(item);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        setDeleting(true);
        const { error } = await supabase
            .from('items')
            .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null })
            .eq('id', confirmDelete.id);
        setDeleting(false);
        if (error) { alert(`Could not delete: ${error.message}`); return; }
        setConfirmDelete(null);
        fetchItems();
    };

    const handleBorrowClick = (item) => {
        setOpenMenuId(null);
        setBorrowForm({ borrower_id: '', quantity: 1, due_at: '', notes: '' });
        setBorrowError('');
        setBorrowModal({ item });
    };

    const handleSubmitBorrow = async (e) => {
        e?.preventDefault();
        setBorrowError('');
        if (!borrowForm.borrower_id) { setBorrowError('Please pick a borrower.'); return; }
        const qty = parseInt(borrowForm.quantity, 10);
        if (!qty || qty < 1) { setBorrowError('Quantity must be at least 1.'); return; }
        if (qty > borrowModal.item.quantity) {
            setBorrowError(`Only ${borrowModal.item.quantity} available to lend.`);
            return;
        }
        if (borrowForm.due_at) {
            const today = new Date().toISOString().slice(0, 10);
            if (borrowForm.due_at < today) {
                setBorrowError(`Due date can't be earlier than today.`);
                return;
            }
        }
        const borrower = users.find(u => u.id === borrowForm.borrower_id);
        if (!borrower) { setBorrowError('Selected borrower not found.'); return; }

        setBorrowSubmitting(true);
        const { error } = await supabase.from('borrowings').insert({
            item_id: borrowModal.item.id,
            borrower_id: borrower.id,
            borrower_email: borrower.email,
            quantity: qty,
            due_at: borrowForm.due_at || null,
            notes: borrowForm.notes.trim() || null,
            created_by: user?.id ?? null,
        });
        setBorrowSubmitting(false);
        if (error) { setBorrowError(error.message); return; }
        setBorrowModal(null);
        fetchItems();
        fetchBorrowings();
    };

    const handleReturnClick = (item) => {
        setOpenMenuId(null);
        setReturnModal({ item });
    };

    const handleReturn = async (borrowing) => {
        // qty 1 → straight return. qty ≥ 2 → ask how many (allow partial).
        if (borrowing.quantity >= 2) {
            const raw = window.prompt(
                `${borrowing.quantity} units on this loan. How many returning? (1-${borrowing.quantity})`,
                String(borrowing.quantity),
            );
            if (raw === null) return; // cancelled
            const amount = parseInt(raw, 10);
            if (!amount || amount < 1 || amount > borrowing.quantity) {
                alert(`Please enter a number between 1 and ${borrowing.quantity}.`);
                return;
            }
            await returnBorrowing(borrowing, amount);
        } else {
            await returnBorrowing(borrowing, 1);
        }
    };

    const returnBorrowing = async (borrowing, amount) => {
        const nowIso = new Date().toISOString();

        if (amount >= borrowing.quantity) {
            const { error } = await supabase
                .from('borrowings')
                .update({ returned_at: nowIso, returned_by: user?.id ?? null })
                .eq('id', borrowing.id);
            if (error) { alert(`Could not mark returned: ${error.message}`); return; }
        } else {
            // Partial: insert returned-row + lower active-row qty.
            const { error: insertError } = await supabase
                .from('borrowings')
                .insert({
                    item_id:        borrowing.item_id,
                    borrower_id:    borrowing.borrower_id,
                    borrower_email: borrowing.borrower_email,
                    quantity:       amount,
                    borrowed_at:    borrowing.borrowed_at,
                    due_at:         borrowing.due_at,
                    returned_at:    nowIso,
                    returned_by:    user?.id ?? null,
                    is_partial:     true,
                    notes:          borrowing.notes,
                    created_by:     borrowing.created_by,
                });
            if (insertError) { alert(`Could not record partial return: ${insertError.message}`); return; }
            const { error: updateError } = await supabase
                .from('borrowings')
                .update({ quantity: borrowing.quantity - amount })
                .eq('id', borrowing.id);
            if (updateError) { alert(`Returned row recorded, but failed to lower active qty: ${updateError.message}`); }
        }

        const remaining = activeBorrowingsFor(returnModal.item.id)
            .filter(b => !(b.id === borrowing.id && amount >= borrowing.quantity));
        if (remaining.length === 0 && amount >= borrowing.quantity) setReturnModal(null);
        fetchItems();
        fetchBorrowings();
    };

    const renderCell = (key, item) => {
        switch (key) {
            case 'category':
                return item.categories?.name
                    ? <span className="chip">{item.categories.name}</span>
                    : <span className="muted">—</span>;
            case 'quantity': return item.quantity;
            case 'borrowed': {
                const borrowed = borrowedQtyFor(item.id);
                return borrowed > 0
                    ? <span className="borrowed-chip" title={`${borrowed} currently out on loan`}>{borrowed}</span>
                    : <span className="muted">—</span>;
            }
            case 'location': return item.location || '—';
            case 'stock': {
                const s = getStatus(item);
                if (!s) return <span className="muted">—</span>;
                return <span className={`status-pill ${s.tone}`}>{s.label}</span>;
            }
            case 'status': {
                if (item.quantity === 0 && borrowedQtyFor(item.id) > 0) return 'On loan';
                return item.status || '—';
            }
            case 'brand':    return item.brand || '—';
            case 'added_by': return displayUser(item.created_by, item.created_by_email);
            default: return null;
        }
    };

    const activeCols = TOGGLEABLE_COLUMNS.filter(c => visibleCols[c.key]);

    const toggleSort = (key) => {
        if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
        if (sortDir === 'asc')  { setSortDir('desc'); return; }
        setSortKey(null); setSortDir(null);
    };

    const sortValueFor = (item, key) => {
        switch (key) {
            case 'name':     return item.name?.toLowerCase() ?? '';
            case 'category': return item.categories?.name?.toLowerCase() ?? '';
            case 'brand':    return (item.brand || '').toLowerCase();
            case 'location': return (item.location || '').toLowerCase();
            case 'quantity': return item.quantity;
            case 'borrowed': return borrowedQtyFor(item.id);
            case 'stock':    return getStatus(item)?.label?.toLowerCase() ?? '';
            case 'status':   return (item.status || '').toLowerCase();
            case 'added_by': return (displayUser(item.created_by, item.created_by_email) || '').toLowerCase();
            default: return null;
        }
    };

    const sortedItems = (() => {
        if (!sortKey || !sortDir) return items;
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...items].sort((a, b) => {
            const av = sortValueFor(a, sortKey);
            const bv = sortValueFor(b, sortKey);
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            let cmp;
            if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
            else cmp = String(av).localeCompare(String(bv));
            return cmp * dir;
        });
    })();

    const tracked    = items.filter(i => i.track_stock);
    const total      = items.length;
    const available  = tracked.filter(i => i.quantity > threshold).length;
    const lowStock   = tracked.filter(i => i.quantity > 0 && i.quantity <= threshold).length;
    const outOfStock = tracked.filter(i => i.quantity === 0).length;

    const summary = [
        { label: 'Total items',  value: total,      hint: 'in catalog' },
        { label: 'Available',    value: available,  hint: `tracked, qty above ${threshold}`, tone: 'up' },
        { label: 'Low stock',    value: lowStock,   hint: `at or below ${threshold}`,        alert: lowStock > 0 },
        { label: 'Out of stock', value: outOfStock, hint: 'needs restock',                   alert: outOfStock > 0 },
    ];

    return (
        <div className="inventory-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Inventory</h1>
                    <p className="dash-subtitle">Equipment, supplies, and assets for City Assembly of God.</p>
                </div>
                <Link to="/items/new" className="btn-primary btn-primary--compact">
                    <Plus size={15} strokeWidth={2.2} /> Add Item
                </Link>
            </header>

            <section className="summary-strip" aria-label="Inventory summary">
                {summary.map((s, i) => (
                    <div key={i} className={`summary-cell${s.alert ? ' is-alert' : ''}`}>
                        <p className="summary-label">{s.label}</p>
                        <p className={`summary-value${s.tone === 'up' ? ' tone-up' : ''}`}>{s.value}</p>
                        <p className="summary-hint">{s.hint}</p>
                    </div>
                ))}
            </section>

            <section className="panel">
                <div className="panel-head">
                    <h2 className="panel-title">All items</h2>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
                        <button
                            type="button"
                            className="column-toggle-btn"
                            aria-label="Toggle columns"
                            aria-haspopup="menu"
                            aria-expanded={colsMenuOpen}
                            onClick={() => setColsMenuOpen(o => !o)}
                        >
                            <Columns3 size={14} strokeWidth={2} /> Columns
                        </button>

                        <div className="search-inline">
                            <Search size={13} />
                            <input type="text" placeholder="Search by name…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>

                        {colsMenuOpen && (
                            <div ref={colsMenuRef} role="menu" className="column-toggle-menu">
                                <p className="menu-heading">Show columns</p>
                                {TOGGLEABLE_COLUMNS.map(c => (
                                    <label key={c.key}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(visibleCols[c.key])}
                                            onChange={(e) =>
                                                setVisibleCols(prev => ({ ...prev, [c.key]: e.target.checked }))
                                            }
                                        />
                                        {c.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p className="muted-center">Loading…</p>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Plus size={18} /></div>
                        <p className="empty-title">{search ? 'No matches' : 'No items yet'}</p>
                        <p className="empty-hint">
                            {search ? 'Try a different search.' : (
                                <>Catalog your first asset to get started. <Link to="/items/new" style={{ color: 'var(--primary)', fontWeight: 600 }}>Add item</Link>.</>
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <SortableTh k="name" label="Item" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    {activeCols.map(c => (
                                        <SortableTh
                                            key={c.key}
                                            k={c.key}
                                            label={c.label}
                                            className={c.headerClass}
                                            sortKey={sortKey}
                                            sortDir={sortDir}
                                            onClick={toggleSort}
                                        />
                                    ))}
                                    <th aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {sortedItems.map(item => {
                                    const isOpen = openMenuId === item.id;
                                    const activeLoans = activeBorrowingsFor(item.id);
                                    const canBorrow = item.quantity > 0;
                                    return (
                                        <tr key={item.id}>
                                            <td className="strong">{item.name}</td>
                                            {activeCols.map(c => (
                                                <td key={c.key} className={c.cellClass || ''}>
                                                    {renderCell(c.key, item)}
                                                </td>
                                            ))}
                                            <td className="right" style={{ position: 'relative' }}>
                                                <button
                                                    className="icon-btn"
                                                    aria-label="More actions"
                                                    aria-haspopup="menu"
                                                    aria-expanded={isOpen}
                                                    onClick={() => setOpenMenuId(isOpen ? null : item.id)}
                                                >
                                                    <MoreVertical size={15} />
                                                </button>
                                                {isOpen && (
                                                    <div
                                                        ref={menuRef}
                                                        role="menu"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            right: 0,
                                                            marginTop: 4,
                                                            background: 'var(--surface, #fff)',
                                                            border: '1px solid var(--border, #e5e7eb)',
                                                            borderRadius: 8,
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                            minWidth: 160,
                                                            zIndex: 20,
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <button
                                                            role="menuitem"
                                                            onClick={() => handleBorrowClick(item)}
                                                            disabled={!canBorrow}
                                                            style={{
                                                                ...menuItemStyle,
                                                                opacity: canBorrow ? 1 : 0.45,
                                                                cursor: canBorrow ? 'pointer' : 'not-allowed',
                                                            }}
                                                            title={canBorrow ? '' : 'No quantity available'}
                                                        >
                                                            <Hand size={13} /> Borrow
                                                        </button>
                                                        {activeLoans.length > 0 && (
                                                            <button
                                                                role="menuitem"
                                                                onClick={() => handleReturnClick(item)}
                                                                style={menuItemStyle}
                                                            >
                                                                <Undo2 size={13} /> Return…
                                                            </button>
                                                        )}
                                                        <button
                                                            role="menuitem"
                                                            onClick={() => handleEdit(item)}
                                                            style={menuItemStyle}
                                                        >
                                                            <Pencil size={13} /> Edit
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                role="menuitem"
                                                                onClick={() => handleDeleteClick(item)}
                                                                style={{ ...menuItemStyle, color: '#c0392b' }}
                                                            >
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {confirmDelete && (
                <ModalOverlay onClose={() => setConfirmDelete(null)} closeDisabled={deleting}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Delete this item?</h3>
                    <p style={{ margin: '0 0 20px', color: 'var(--text-muted, #6b7280)', fontSize: 14 }}>
                        <strong>{confirmDelete.name}</strong> will be removed from the active inventory.
                        This action is tracked — your name and the time will be recorded.
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            style={{
                                background: '#c0392b', color: '#fff', border: 'none',
                                padding: '8px 16px', borderRadius: 6, fontWeight: 600,
                                cursor: deleting ? 'not-allowed' : 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </ModalOverlay>
            )}

            {borrowModal && (
                <ModalOverlay onClose={() => setBorrowModal(null)} closeDisabled={borrowSubmitting}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Lend out</h3>
                    <p style={{ margin: '0 0 18px', color: 'var(--text-muted, #6b7280)', fontSize: 14 }}>
                        <strong>{borrowModal.item.name}</strong> · {borrowModal.item.quantity} available
                    </p>

                    {borrowError && <div className="form-error" style={{ marginBottom: 12 }}>{borrowError}</div>}

                    <form onSubmit={handleSubmitBorrow} className="stacked-form">
                        <div className="form-field">
                            <label>Borrower *</label>
                            <select
                                className="input-field"
                                value={borrowForm.borrower_id}
                                onChange={(e) => setBorrowForm({ ...borrowForm, borrower_id: e.target.value })}
                                required
                            >
                                <option value="">Pick a registered user…</option>
                                {users.map(u => {
                                    const name = userDisplayName(u);
                                    const label = name && name !== u.email ? `${name} (${u.email})` : u.email;
                                    return <option key={u.id} value={u.id}>{label}</option>;
                                })}
                            </select>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-field">
                                <label>Quantity</label>
                                <input
                                    type="number" min="1" max={borrowModal.item.quantity}
                                    className="input-field"
                                    value={borrowForm.quantity}
                                    onChange={(e) => setBorrowForm({ ...borrowForm, quantity: e.target.value })}
                                />
                            </div>
                            <div className="form-field">
                                <label>Due date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={borrowForm.due_at}
                                    min={new Date().toISOString().slice(0, 10)}
                                    onChange={(e) => setBorrowForm({ ...borrowForm, due_at: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Notes</label>
                            <textarea
                                className="input-field textarea"
                                placeholder="What's it being used for? Event, ministry, etc."
                                value={borrowForm.notes}
                                onChange={(e) => setBorrowForm({ ...borrowForm, notes: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => setBorrowModal(null)}
                                disabled={borrowSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary btn-primary--compact"
                                disabled={borrowSubmitting}
                            >
                                <Hand size={14} /> {borrowSubmitting ? 'Lending…' : 'Lend'}
                            </button>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {returnModal && (
                <ModalOverlay onClose={() => setReturnModal(null)}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Currently out</h3>
                    <p style={{ margin: '0 0 18px', color: 'var(--text-muted, #6b7280)', fontSize: 14 }}>
                        <strong>{returnModal.item.name}</strong> — pick a loan to mark returned.
                    </p>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', maxHeight: 320, overflowY: 'auto' }}>
                        {activeBorrowingsFor(returnModal.item.id).map(b => {
                            const dueLabel = b.due_at ? new Date(b.due_at).toLocaleDateString() : null;
                            const today = new Date();
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            // 1-day grace: due 5/18 is fine through 5/19, overdue from 5/20.
                            let isOverdue = false;
                            if (b.due_at) {
                                const d = new Date(`${b.due_at.slice(0, 10)}T00:00:00`);
                                d.setDate(d.getDate() + 1);
                                const graceStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                isOverdue = graceStr < todayStr;
                            }
                            return (
                                <li key={b.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    padding: '10px 0',
                                    borderBottom: '1px solid var(--border, #e5e7eb)',
                                }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{displayUser(b.borrower_id, b.borrower_email)}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted, #6b7280)' }}>
                                            {b.quantity} unit{b.quantity > 1 ? 's' : ''}
                                            {' · borrowed '}{new Date(b.borrowed_at).toLocaleDateString()}
                                            {dueLabel && (
                                                <> · due <span style={{ color: isOverdue ? '#c0392b' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>{dueLabel}{isOverdue ? ' (overdue)' : ''}</span></>
                                            )}
                                        </p>
                                        {b.notes && (
                                            <p style={{ margin: '4px 0 0', fontSize: 12, fontStyle: 'italic', color: 'var(--text-muted, #6b7280)' }}>"{b.notes}"</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleReturn(b)}
                                        className="btn-primary btn-primary--compact"
                                        style={{ flexShrink: 0 }}
                                    >
                                        <Undo2 size={13} /> Return
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-ghost" onClick={() => setReturnModal(null)}>
                            Close
                        </button>
                    </div>
                </ModalOverlay>
            )}
        </div>
    );
};

const ModalOverlay = ({ children, onClose, closeDisabled }) => createPortal(
    <div
        style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
        }}
    >
        <div
            style={{
                position: 'relative',
                background: 'var(--surface, #fff)',
                borderRadius: 12,
                padding: '24px 24px 20px',
                maxWidth: 520,
                width: 'calc(100% - 32px)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
                maxHeight: 'calc(100vh - 64px)',
                overflowY: 'auto',
            }}
        >
            <button
                type="button"
                onClick={onClose}
                disabled={closeDisabled}
                aria-label="Close"
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 28,
                    height: 28,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: closeDisabled ? 'not-allowed' : 'pointer',
                    color: 'var(--text-muted, #6b7280)',
                    opacity: closeDisabled ? 0.4 : 1,
                }}
            >
                <X size={16} />
            </button>
            {children}
        </div>
    </div>,
    document.body
);

const SortableTh = ({ k, label, className, sortKey, sortDir, onClick }) => {
    const active = sortKey === k;
    const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
        <th
            className={className}
            onClick={() => onClick(k)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {label}
                <Icon size={11} style={{ opacity: active ? 1 : 0.35 }} />
            </span>
        </th>
    );
};

const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    textAlign: 'left',
    color: 'inherit',
};

export default Inventory;
