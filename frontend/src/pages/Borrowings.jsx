import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { HandCoins, Undo2, Search, Plus, Pencil, MoreVertical, History, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Human-readable labels for fields we audit. Order here drives display order
// in the Edit-history diff lines.
const EDIT_FIELD_LABELS = {
    borrower_id: 'Borrower',
    quantity:    'Quantity',
    borrowed_at: 'Borrowed on',
    due_at:      'Due date',
    notes:       'Notes',
};

const FILTERS = [
    { key: 'active',  label: 'Active'   },
    { key: 'overdue', label: 'Overdue'  },
    { key: 'history', label: 'History'  },
    { key: 'all',     label: 'All'      },
];

const Borrowings = () => {
    const { user } = useAuth();
    const [borrowings, setBorrowings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null); // 'asc' | 'desc' | null
    const [returningId, setReturningId] = useState(null);
    const [returnModal, setReturnModal] = useState(null);
    const [returnAmount, setReturnAmount] = useState(1);
    const [returnSubmitting, setReturnSubmitting] = useState(false);
    const [returnError, setReturnError] = useState('');
    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({
        borrower_id: '', quantity: 1, borrowed_at: '', due_at: '', notes: '',
    });
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState('');
    const [historyModal, setHistoryModal] = useState(null);
    // Shared history list — only one of edit/history modal is open at a time.
    const [loanHistory, setLoanHistory] = useState([]);
    const [loanHistoryLoading, setLoanHistoryLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => { fetchBorrowings(); fetchUsers(); }, []);

    useEffect(() => {
        if (openMenuId === null) return;
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [openMenuId]);

    const fetchBorrowings = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('borrowings')
            .select('*, items(name, quantity)')
            .order('borrowed_at', { ascending: false });
        setBorrowings(data || []);
        setLoading(false);
    };

    const fetchLoanHistory = async (borrowingId) => {
        setLoanHistoryLoading(true);
        const { data } = await supabase
            .from('borrowing_edits')
            .select('*')
            .eq('borrowing_id', borrowingId)
            .order('edited_at', { ascending: false });
        setLoanHistory(data || []);
        setLoanHistoryLoading(false);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name');
        setUsers(data || []);
    };

    const userDisplayName = (u) => {
        if (!u) return null;
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
        return name || u.email;
    };

    const displayUser = (id, fallbackEmail) => {
        const u = users.find(x => x.id === id);
        return userDisplayName(u) || fallbackEmail || '—';
    };

    const handleReturn = (b) => {
        setOpenMenuId(null);
        // qty 1 → no confirmation needed, just return immediately.
        if (b.quantity === 1) {
            submitReturn(b, 1);
            return;
        }
        // qty ≥ 2 → confirm + allow partial.
        setReturnError('');
        setReturnAmount(b.quantity);
        setReturnModal(b);
    };

    const submitReturn = async (loan, amount) => {
        setReturningId(loan.id);
        const nowIso = new Date().toISOString();

        if (amount >= loan.quantity) {
            // Full return: mark the existing row returned.
            const { error } = await supabase
                .from('borrowings')
                .update({ returned_at: nowIso, returned_by: user?.id ?? null })
                .eq('id', loan.id);
            setReturningId(null);
            if (error) { alert(`Could not mark returned: ${error.message}`); return false; }
            fetchBorrowings();
            return true;
        }

        // Partial return: insert a new returned-row for the portion handed
        // back, then lower the qty on the original active row. The trigger
        // refunds items.quantity on the UPDATE (delta = old - new).
        const { error: insertError } = await supabase
            .from('borrowings')
            .insert({
                item_id:        loan.item_id,
                borrower_id:    loan.borrower_id,
                borrower_email: loan.borrower_email,
                quantity:       amount,
                borrowed_at:    loan.borrowed_at,
                due_at:         loan.due_at,
                returned_at:    nowIso,
                returned_by:    user?.id ?? null,
                is_partial:     true,
                notes:          loan.notes,
                created_by:     loan.created_by,
            });
        if (insertError) {
            setReturningId(null);
            alert(`Could not record partial return: ${insertError.message}`);
            return false;
        }

        const { error: updateError } = await supabase
            .from('borrowings')
            .update({ quantity: loan.quantity - amount })
            .eq('id', loan.id);
        setReturningId(null);
        if (updateError) {
            // We've already inserted the returned-row, so items.quantity
            // hasn't been adjusted yet — surface the error so the user can
            // retry the update part rather than ending up out of sync.
            alert(`Returned row recorded, but failed to lower active qty: ${updateError.message}`);
            fetchBorrowings();
            return false;
        }
        fetchBorrowings();
        return true;
    };

    const handleSubmitReturn = async (e) => {
        e?.preventDefault();
        setReturnError('');
        const amt = parseInt(returnAmount, 10);
        if (!amt || amt < 1) { setReturnError('Return at least 1 unit.'); return; }
        if (amt > returnModal.quantity) {
            setReturnError(`Only ${returnModal.quantity} on this loan.`);
            return;
        }
        setReturnSubmitting(true);
        const ok = await submitReturn(returnModal, amt);
        setReturnSubmitting(false);
        if (ok) setReturnModal(null);
    };

    const handleEditClick = (b) => {
        setOpenMenuId(null);
        setEditError('');
        setEditForm({
            borrower_id: b.borrower_id || '',
            quantity:    b.quantity,
            borrowed_at: b.borrowed_at ? b.borrowed_at.slice(0, 10) : '',
            due_at:      b.due_at ? b.due_at.slice(0, 10) : '',
            notes:       b.notes || '',
        });
        setLoanHistory([]);
        setEditModal(b);
        fetchLoanHistory(b.id);
    };

    const handleHistoryClick = (b) => {
        setOpenMenuId(null);
        setLoanHistory([]);
        setHistoryModal(b);
        fetchLoanHistory(b.id);
    };

    const handleSubmitEdit = async (e) => {
        e?.preventDefault();
        setEditError('');

        const newNotes = editForm.notes.trim() || null;
        const newDueAt = editForm.due_at || null;

        if (newDueAt && editModal.borrowed_at) {
            const borrowedDay = editModal.borrowed_at.slice(0, 10);
            if (newDueAt < borrowedDay) {
                setEditError(`Due date can't be earlier than the borrowed date (${fmtDate(editModal.borrowed_at)}).`);
                return;
            }
        }

        // Build the diff of what actually changed. Skip no-op edits — no
        // point writing an audit row that says nothing changed.
        const next = { due_at: newDueAt, notes: newNotes };
        const prev = { due_at: editModal.due_at, notes: editModal.notes };

        const changes = {};
        for (const k of Object.keys(next)) {
            if (prev[k] !== next[k]) changes[k] = { old: prev[k] ?? null, new: next[k] ?? null };
        }

        if (Object.keys(changes).length === 0) {
            setEditModal(null);
            return;
        }

        setEditSubmitting(true);
        const { error: updateError } = await supabase
            .from('borrowings')
            .update({ due_at: newDueAt, notes: newNotes })
            .eq('id', editModal.id);

        if (updateError) {
            setEditSubmitting(false);
            setEditError(updateError.message);
            return;
        }

        // Audit row. If the row update succeeded but the audit insert fails
        // we still want the user to know — surface the error rather than
        // silently lose the history entry.
        const { error: auditError } = await supabase
            .from('borrowing_edits')
            .insert({
                borrowing_id: editModal.id,
                edited_by:    user?.id ?? null,
                changes,
            });

        setEditSubmitting(false);
        if (auditError) {
            setEditError(`Saved, but audit log failed: ${auditError.message}`);
            fetchBorrowings();
            return;
        }

        setEditModal(null);
        fetchBorrowings();
    };

    const formatAuditValue = (field, value) => {
        if (value === null || value === undefined || value === '') return '—';
        if (field === 'borrower_id') return displayUser(value, null) || value;
        if (field === 'borrowed_at' || field === 'due_at') {
            const d = new Date(value);
            return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
        }
        return String(value);
    };

    const now = new Date();
    // Local YYYY-MM-DD — using toISOString() would be UTC, which can flip the
    // day for users east/west of UTC and incorrectly mark loans overdue (or not).
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    // Overdue uses a 1-day grace period: "due X" means fine through end of
    // X+1, overdue only once we're past that. So due 5/18 stays Active on
    // 5/19 and only flips to Overdue on 5/20.
    const isOverdue = (b) => {
        if (b.returned_at !== null || !b.due_at) return false;
        const due = new Date(`${b.due_at.slice(0, 10)}T00:00:00`);
        due.setDate(due.getDate() + 1);
        const graceStr = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
        return graceStr < todayStr;
    };

    // Sort helpers — must be declared before `sortedFiltered` references them,
    // otherwise const TDZ throws "Cannot access 'sortValueFor' before initialization".
    const toggleSort = (key) => {
        if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
        if (sortDir === 'asc')  { setSortDir('desc'); return; }
        setSortKey(null); setSortDir(null);
    };

    const sortValueFor = (b, key) => {
        try {
            switch (key) {
                case 'item':          return (b.items?.name || '').toString().toLowerCase();
                case 'borrower':      return (displayUser(b.borrower_id, b.borrower_email) || '').toString().toLowerCase();
                case 'authorized_by': return (displayUser(b.created_by, null) || '').toString().toLowerCase();
                case 'qty':           return Number.isFinite(b.quantity) ? b.quantity : 0;
                case 'borrowed': {
                    if (!b.borrowed_at) return null;
                    const t = new Date(b.borrowed_at).getTime();
                    return Number.isFinite(t) ? t : null;
                }
                case 'due': {
                    if (!b.due_at) return null;
                    const t = new Date(b.due_at).getTime();
                    return Number.isFinite(t) ? t : null;
                }
                case 'returned': {
                    if (!b.returned_at) return null;
                    const t = new Date(b.returned_at).getTime();
                    return Number.isFinite(t) ? t : null;
                }
                case 'notes':         return (b.notes || '').toString().toLowerCase();
                case 'status': {
                    if (b.returned_at) return b.is_partial ? 2 : 3;
                    if (isOverdue(b)) return 0;
                    return 1;
                }
                default: return null;
            }
        } catch (e) {
            console.error('[Borrowings.sortValueFor] threw for', key, b, e);
            return null;
        }
    };

    const filtered = borrowings.filter(b => {
        if (filter === 'active'  && b.returned_at !== null) return false;
        if (filter === 'history' && b.returned_at === null) return false;
        if (filter === 'overdue' && !isOverdue(b))          return false;
        if (search) {
            const q = search.toLowerCase();
            const itemName = (b.items?.name || '').toLowerCase();
            const email    = (b.borrower_email || '').toLowerCase();
            const name     = (displayUser(b.borrower_id, '') || '').toLowerCase();
            if (!itemName.includes(q) && !email.includes(q) && !name.includes(q)) return false;
        }
        return true;
    });

    const sortedFiltered = (() => {
        if (!sortKey || !sortDir) return filtered;
        try {
            const dir = sortDir === 'asc' ? 1 : -1;
            return [...filtered].sort((a, b) => {
                const av = sortValueFor(a, sortKey);
                const bv = sortValueFor(b, sortKey);
                // Nulls always sink to the bottom regardless of direction.
                if (av == null && bv == null) return 0;
                if (av == null) return 1;
                if (bv == null) return -1;
                let cmp;
                if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
                else cmp = String(av).localeCompare(String(bv));
                return cmp * dir;
            });
        } catch (e) {
            console.error('[Borrowings] sort failed, falling back to unsorted:', { sortKey, sortDir, error: e });
            return filtered;
        }
    })();

    const counts = {
        active:  borrowings.filter(b => b.returned_at === null).length,
        overdue: borrowings.filter(b => isOverdue(b)).length,
        history: borrowings.filter(b => b.returned_at !== null).length,
        all:     borrowings.length,
    };

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const returnedThisMonth = borrowings.filter(b =>
        b.returned_at !== null && new Date(b.returned_at) >= startOfMonth
    ).length;

    const summary = [
        { label: 'Currently out',      value: counts.active,    hint: 'active loans' },
        { label: 'Overdue',            value: counts.overdue,   hint: 'past due date', alert: counts.overdue > 0 },
        { label: 'Returned this month', value: returnedThisMonth, hint: 'so far',     tone: 'up' },
        { label: 'Total all-time',     value: counts.all,       hint: 'every loan ever' },
    ];

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : null;

    const statusForRow = (b) => {
        if (b.returned_at) {
            return b.is_partial
                ? { label: 'Partial',  tone: 'info' }
                : { label: 'Returned', tone: 'ok'   };
        }
        if (isOverdue(b))  return { label: 'Overdue',  tone: 'danger' };
        return                    { label: 'Active',   tone: 'warn'   };
    };

    return (
        <div className="inventory-page animate-in">
            <header className="dash-header">
                <div>
                    <h1 className="dash-title">Borrowings</h1>
                    <p className="dash-subtitle">Track who has what and when it's due back.</p>
                </div>
            </header>

            <section className="summary-strip" aria-label="Borrowings summary">
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
                    <h2 className="panel-title">Loans</h2>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setFilter(f.key)}
                                    className={`filter-chip${filter === f.key ? ' is-active' : ''}`}
                                >
                                    {f.label}
                                    <span className="filter-chip-count">{counts[f.key]}</span>
                                </button>
                            ))}
                        </div>
                        <div className="search-inline">
                            <Search size={13} />
                            <input
                                type="text"
                                placeholder="Search item or borrower…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p className="muted-center">Loading…</p>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><HandCoins size={18} /></div>
                        <p className="empty-title">
                            {search ? 'No matches' :
                             filter === 'active'  ? 'No active loans' :
                             filter === 'overdue' ? 'Nothing overdue' :
                             filter === 'history' ? 'No returned loans yet' :
                             'No loans yet'}
                        </p>
                        <p className="empty-hint">
                            {filter === 'active' && !search ? (
                                <>Lend an item from the <Link to="/inventory" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inventory</Link> page.</>
                            ) : 'Try a different filter or search.'}
                        </p>
                    </div>
                ) : (
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <SortableTh k="item"          label="Item"          sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="borrower"      label="Borrower"      sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="authorized_by" label="Authorized by" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="qty"           label="Qty"           className="right" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="borrowed"      label="Borrowed"      sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="due"           label="Due"           sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="status"        label="Status"        sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="returned"      label="Returned"      sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <SortableTh k="notes"         label="Notes"         sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                                    <th aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFiltered.map(b => {
                                    const status = statusForRow(b);
                                    const overdue = isOverdue(b);
                                    return (
                                        <tr key={b.id}>
                                            <td className="strong">
                                                {b.items?.name ?? <span className="muted">—</span>}
                                            </td>
                                            <td>
                                                {displayUser(b.borrower_id, b.borrower_email)}
                                            </td>
                                            <td className="muted">
                                                {b.created_by ? displayUser(b.created_by, null) : <span className="muted">—</span>}
                                            </td>
                                            <td className="right strong">{b.quantity}</td>
                                            <td className="muted">{fmtDate(b.borrowed_at)}</td>
                                            <td className={overdue ? 'strong' : 'muted'}
                                                style={overdue ? { color: '#c0392b' } : undefined}>
                                                {fmtDate(b.due_at) ?? '—'}
                                            </td>
                                            <td>
                                                <span className={`status-pill ${status.tone}`}>{status.label}</span>
                                            </td>
                                            <td className="muted">
                                                {b.returned_at ? fmtDate(b.returned_at) : '—'}
                                            </td>
                                            <td className="muted" style={{ maxWidth: 220 }}>
                                                {b.notes
                                                    ? <span title={b.notes} style={{ display: 'inline-block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>{b.notes}</span>
                                                    : '—'}
                                            </td>
                                            <td className="right" style={{ position: 'relative' }}>
                                                {(() => {
                                                    const isOpen = openMenuId === b.id;
                                                    const isActive = b.returned_at === null;
                                                    return (
                                                        <>
                                                            <button
                                                                className="icon-btn"
                                                                aria-label="More actions"
                                                                aria-haspopup="menu"
                                                                aria-expanded={isOpen}
                                                                onClick={() => setOpenMenuId(isOpen ? null : b.id)}
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
                                                                    {isActive ? (
                                                                        <>
                                                                            <button
                                                                                role="menuitem"
                                                                                onClick={() => handleEditClick(b)}
                                                                                style={menuItemStyle}
                                                                            >
                                                                                <Pencil size={13} /> Edit
                                                                            </button>
                                                                            <button
                                                                                role="menuitem"
                                                                                onClick={() => handleReturn(b)}
                                                                                disabled={returningId === b.id}
                                                                                style={menuItemStyle}
                                                                            >
                                                                                <Undo2 size={13} /> {returningId === b.id ? 'Returning…' : 'Return'}
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button
                                                                            role="menuitem"
                                                                            onClick={() => handleHistoryClick(b)}
                                                                            style={menuItemStyle}
                                                                        >
                                                                            <History size={13} /> View history
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {returnModal && (
                <ModalOverlay onClose={() => setReturnModal(null)} closeDisabled={returnSubmitting}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Return loan</h3>
                    <p style={{ margin: '0 0 18px', color: 'var(--text-muted, #6b7280)', fontSize: 14 }}>
                        <strong>{returnModal.items?.name ?? 'Item'}</strong> · {returnModal.quantity} unit{returnModal.quantity > 1 ? 's' : ''} on loan to {displayUser(returnModal.borrower_id, returnModal.borrower_email)}
                    </p>

                    {returnError && <div className="form-error" style={{ marginBottom: 12 }}>{returnError}</div>}

                    <form onSubmit={handleSubmitReturn} className="stacked-form">
                        <div className="form-field">
                            <label>How many returning?</label>
                            <input
                                type="number"
                                min="1"
                                max={returnModal.quantity}
                                className="input-field"
                                value={returnAmount}
                                onChange={(e) => setReturnAmount(e.target.value)}
                                autoFocus
                            />
                            <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                                {parseInt(returnAmount, 10) >= returnModal.quantity
                                    ? 'Returns the entire loan.'
                                    : `Partial return — ${returnModal.quantity - (parseInt(returnAmount, 10) || 0)} will stay on loan.`}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => setReturnModal(null)}
                                disabled={returnSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary btn-primary--compact"
                                disabled={returnSubmitting}
                            >
                                <Undo2 size={14} /> {returnSubmitting ? 'Returning…' : 'Confirm return'}
                            </button>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {editModal && (
                <ModalOverlay onClose={() => setEditModal(null)} closeDisabled={editSubmitting}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Edit loan</h3>
                    <p style={{ margin: '0 0 18px', color: 'var(--text-muted, #6b7280)', fontSize: 14 }}>
                        <strong>{editModal.items?.name ?? 'Item'}</strong>
                        {' · '}{editModal.quantity} unit{editModal.quantity > 1 ? 's' : ''} on loan
                    </p>

                    {editError && <div className="form-error" style={{ marginBottom: 12 }}>{editError}</div>}

                    <form onSubmit={handleSubmitEdit} className="stacked-form">
                        {/* Borrower / Quantity / Borrowed-on are context only — not editable. */}
                        <fieldset disabled style={{ border: 'none', padding: 0, margin: 0 }}>
                            <div className="form-field">
                                <label>Borrower</label>
                                <select className="input-field" value={editForm.borrower_id} onChange={() => {}}>
                                    <option value="">—</option>
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
                                    <input type="number" className="input-field" value={editForm.quantity} onChange={() => {}} />
                                </div>
                                <div className="form-field">
                                    <label>Borrowed on</label>
                                    <input type="date" className="input-field" value={editForm.borrowed_at} onChange={() => {}} />
                                </div>
                            </div>
                        </fieldset>

                        <div className="form-field">
                            <label>Due date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={editForm.due_at}
                                min={editForm.borrowed_at || undefined}
                                onChange={(e) => setEditForm({ ...editForm, due_at: e.target.value })}
                            />
                        </div>

                        <div className="form-field">
                            <label>Notes</label>
                            <textarea
                                className="input-field textarea"
                                placeholder="What's it being used for? Event, ministry, etc."
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => setEditModal(null)}
                                disabled={editSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary btn-primary--compact"
                                disabled={editSubmitting}
                            >
                                <Pencil size={14} /> {editSubmitting ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border, #e5e7eb)' }}>
                        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted, #6b7280)' }}>
                            <History size={13} /> Edit history
                        </p>
                        <LoanHistoryList
                            loading={loanHistoryLoading}
                            history={loanHistory}
                            displayUser={displayUser}
                            formatAuditValue={formatAuditValue}
                        />
                    </div>
                </ModalOverlay>
            )}

            {historyModal && (
                <ModalOverlay onClose={() => setHistoryModal(null)}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Loan history</h3>
                    <p style={{ margin: '0 0 18px', color: 'var(--text-muted, #6b7280)', fontSize: 14 }}>
                        <strong>{historyModal.items?.name ?? 'Item'}</strong>
                        {historyModal.returned_at && (
                            <> · {historyModal.is_partial ? 'partial return' : 'returned'} {fmtDate(historyModal.returned_at)}</>
                        )}
                    </p>

                    {/* Read-only loan summary. No form, no inputs — just facts. */}
                    <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 12, rowGap: 6, margin: '0 0 20px', fontSize: 13 }}>
                        <dt className="muted">Borrower</dt>
                        <dd style={{ margin: 0 }}>{displayUser(historyModal.borrower_id, historyModal.borrower_email)}</dd>
                        <dt className="muted">Quantity</dt>
                        <dd style={{ margin: 0 }}>{historyModal.quantity}</dd>
                        <dt className="muted">Borrowed on</dt>
                        <dd style={{ margin: 0 }}>{fmtDate(historyModal.borrowed_at) ?? '—'}</dd>
                        <dt className="muted">Due</dt>
                        <dd style={{ margin: 0 }}>{fmtDate(historyModal.due_at) ?? '—'}</dd>
                        {historyModal.notes && (
                            <>
                                <dt className="muted">Notes</dt>
                                <dd style={{ margin: 0 }}>{historyModal.notes}</dd>
                            </>
                        )}
                    </dl>

                    <div style={{ paddingTop: 16, borderTop: '1px solid var(--border, #e5e7eb)' }}>
                        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted, #6b7280)' }}>
                            <History size={13} /> Edit history
                        </p>
                        <LoanHistoryList
                            loading={loanHistoryLoading}
                            history={loanHistory}
                            displayUser={displayUser}
                            formatAuditValue={formatAuditValue}
                        />
                    </div>
                </ModalOverlay>
            )}
        </div>
    );
};

const LoanHistoryList = ({ loading, history, displayUser, formatAuditValue }) => {
    if (loading) return <p className="muted" style={{ fontSize: 12, margin: 0 }}>Loading…</p>;
    if (history.length === 0) return <p className="muted" style={{ fontSize: 12, margin: 0 }}>No edits yet.</p>;
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
            {history.map(h => (
                <li key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border, #e5e7eb)', fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{displayUser(h.edited_by, null) || 'Unknown'}</span>
                        <span className="muted">{new Date(h.edited_at).toLocaleString()}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {Object.keys(EDIT_FIELD_LABELS)
                            .filter(k => h.changes && h.changes[k])
                            .map(k => (
                                <li key={k} className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                                    <strong style={{ color: 'inherit' }}>{EDIT_FIELD_LABELS[k]}:</strong>{' '}
                                    <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{formatAuditValue(k, h.changes[k].old)}</span>
                                    {' → '}
                                    <span style={{ color: 'var(--text, inherit)', fontWeight: 500 }}>{formatAuditValue(k, h.changes[k].new)}</span>
                                </li>
                            ))}
                    </ul>
                </li>
            ))}
        </ul>
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

export default Borrowings;
