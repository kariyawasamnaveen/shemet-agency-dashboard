'use client';
import React from 'react';

const ShemetLoader = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#020617', // Base dark color
            zIndex: 9999,
            overflow: 'hidden'
        }}>
            {/* Ultra-Premium Mesh Gradient Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-20%',
                    width: '70vw',
                    height: '70vw',
                    background: 'radial-gradient(circle, rgba(255, 20, 147, 0.1) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    animation: 'floatGlow 8s infinite alternate ease-in-out'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '-20%',
                    width: '70vw',
                    height: '70vw',
                    background: 'radial-gradient(circle, rgba(58, 38, 57, 0.15) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    animation: 'floatGlow 12s infinite alternate-reverse ease-in-out'
                }} />
            </div>

            {/* Main Stage */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Outer Portal Rings */}
                <div style={{
                    position: 'absolute',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 20, 147, 0.1)',
                    animation: 'ringPulse 3s infinite ease-out'
                }} />
                
                {/* 3D Spinning Container */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    position: 'relative',
                    perspective: '1000px'
                }}>
                    {/* Glowing Aura */}
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        background: 'radial-gradient(circle, rgba(255, 20, 147, 0.2) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'auraPulse 2s infinite ease-in-out'
                    }} />

                        {/* Logo with 3D Spin - Minimalist Stack */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            transformStyle: 'preserve-3d',
                            animation: 'spin3D 3s linear infinite'
                        }}>
                            {/* Front Side */}
                            <img 
                                src="/shemet-logo.png" 
                                alt="Shemet" 
                                style={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden',
                                }} 
                            />
                            {/* Back Side */}
                            <img 
                                src="/shemet-logo.png" 
                                alt="Shemet" 
                                style={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    transform: 'rotateY(180deg)',
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden',
                                }} 
                            />
                        </div>
                </div>

                {/* Progress Text */}
                <div style={{
                    marginTop: '40px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: '800',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        background: 'linear-gradient(to right, #ffffff, #ff1493, #ffffff)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'shineText 3s linear infinite'
                    }}>
                        Initializing Elite Access
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin3D {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
                @keyframes auraPulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.15); }
                }
                @keyframes ringPulse {
                    0% { transform: scale(0.6); opacity: 1; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                @keyframes floatGlow {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(5%, 5%) scale(1.2); }
                }
                @keyframes shineText {
                    to { background-position: 200% center; }
                }
            `}</style>
        </div>
    );
};

export default ShemetLoader;
