import React from 'react';
import { User, Calendar, ClipboardCheck, X } from 'lucide-react';

const BorrowForm = () => {
    return (
        <div className="borrow-form-page">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Borrow Item</h1>
                <p style={{ color: 'var(--text-muted)' }}>Record an item being taken for use.</p>
            </header>

            <div className="card" style={{ maxWidth: '600px' }}>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Item</label>
                        <select className="input-field">
                            <option>Select an item from inventory...</option>
                            <option>Yamaha Keyboard</option>
                            <option>Projector - Epson</option>
                            <option>Sound Mixer</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Borrower Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Full Name" className="input-field" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ministry / Group</label>
                        <input type="text" placeholder="e.g. Worship Team, Youth Ministry" className="input-field" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Borrow Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="date" className="input-field" style={{ paddingLeft: '2.5rem' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Expected Return Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="date" className="input-field" style={{ paddingLeft: '2.5rem' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <button type="button" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            <ClipboardCheck size={18} /> Confirm Borrowing
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BorrowForm;
