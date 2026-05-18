import React from 'react';

const LOGO_WIDTHS = {
    small: 128,
    medium: 160,
    large: 192,
};

const Logo = ({ size = 'medium', showLabel = false }) => {
    const logoWidth = LOGO_WIDTHS[size] || LOGO_WIDTHS.medium;

    return (
        <div className="logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content' }}>
            <img
                src="/image/CAGlogo.png"
                alt="City Assembly of God logo"
                style={{ width: `${logoWidth}px`, height: 'auto', display: 'block' }}
            />

            {showLabel && (
                <div style={{
                    marginTop: '0.6rem',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '3px'
                }}>
                    Inventory
                </div>
            )}
        </div>
    );
};

export default Logo;
