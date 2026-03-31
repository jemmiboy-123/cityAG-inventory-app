import React from 'react';

const Logo = ({ size = 'medium', showLabel = true }) => {
    const scale = size === 'small' ? 0.6 : size === 'large' ? 1.2 : 1;
    const logoWidth = 160 * scale;
    const inventoryFs = 0.75 * scale;

    return (
        <div className="logo-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 'fit-content'
        }}>
            <div style={{ position: 'relative', width: `${logoWidth}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Top Dome */}
                <div style={{
                    width: `${140 * scale}px`,
                    height: `${110 * scale}px`,
                    borderTopLeftRadius: `${70 * scale}px`,
                    borderTopRightRadius: `${70 * scale}px`,
                    background: 'linear-gradient(to bottom, #0056b3 0%, #00d2ff 25%, #2ecc71 50%, #f1c40f 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    border: `${2 * scale}px solid white`,
                    borderBottom: 'none'
                }}>
                    {/* City Silhouette */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: `${2 * scale}px`,
                        paddingBottom: `${5 * scale}px`
                    }}>
                        <div style={{ width: `${12 * scale}px`, height: `${25 * scale}px`, backgroundColor: '#000066' }}></div>
                        <div style={{ width: `${14 * scale}px`, height: `${45 * scale}px`, backgroundColor: '#000066' }}></div>
                        <div style={{ width: `${18 * scale}px`, height: `${70 * scale}px`, backgroundColor: '#000066' }}></div>
                        <div style={{ width: `${14 * scale}px`, height: `${55 * scale}px`, backgroundColor: '#000066' }}></div>
                        <div style={{ width: `${12 * scale}px`, height: `${35 * scale}px`, backgroundColor: '#000066' }}></div>
                    </div>

                    {/* "City" Cursive Text */}
                    <div style={{
                        position: 'absolute',
                        bottom: `${10 * scale}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        fontFamily: '"Outfit", cursive',
                        fontSize: `${2.8 * scale}rem`,
                        fontWeight: '300',
                        fontStyle: 'italic',
                        zIndex: 10,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                        whiteSpace: 'nowrap'
                    }}>
                        City
                    </div>
                </div>

                {/* Bottom Wider Plate */}
                <div style={{
                    backgroundColor: '#000066',
                    width: '100%',
                    padding: `${8 * scale}px 0`,
                    textAlign: 'center',
                    zIndex: 20,
                    border: `${2 * scale}px solid white`,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                    <span style={{
                        fontSize: `${0.6 * scale}rem`,
                        color: '#fbbf24',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: `${1.5 * scale}px`,
                        display: 'block'
                    }}>
                        Assembly of God
                    </span>
                </div>
            </div>

            {showLabel && (
                <div style={{
                    marginTop: `${15 * scale}px`,
                    fontSize: `${inventoryFs}rem`,
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: `${3 * scale}px`
                }}>
                    Inventory
                </div>
            )}
        </div>
    );
};

export default Logo;
