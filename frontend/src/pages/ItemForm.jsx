import React from 'react';
import { Camera, X, Save } from 'lucide-react';

const ItemForm = () => {
    return (
        <div className="item-form-page">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Add New Item</h1>
                <p style={{ color: 'var(--text-muted)' }}>Enter the details of the new inventory item.</p>
            </header>

            <div className="card" style={{ maxWidth: '800px' }}>
                <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Item Name</label>
                            <input type="text" placeholder="e.g. Yamaha PSR-E373" className="input-field" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                            <select className="input-field">
                                <option>Select Category</option>
                                <option>Worship equipment</option>
                                <option>Kitchen supplies</option>
                                <option>Event materials</option>
                                <option>Maintenance tools</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity</label>
                                <input type="number" defaultValue="1" className="input-field" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Unit</label>
                                <input type="text" placeholder="pcs, sets, etc." className="input-field" />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Storage Location</label>
                            <input type="text" placeholder="e.g. Storage Room A, Shelf 2" className="input-field" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                            <textarea placeholder="Add any specific details, serial numbers, or notes..." className="input-field" style={{ height: '120px', resize: 'none' }}></textarea>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upload Photo</label>
                            <div style={{
                                border: '2px dashed var(--border)',
                                borderRadius: 'var(--radius)',
                                height: '150px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                            }}>
                                <Camera size={24} />
                                <span style={{ fontSize: '0.9rem' }}>Click to upload or drag & drop</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <button type="button" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} /> Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;
