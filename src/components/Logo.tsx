import React from 'react';

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <img
            src="/logo.png"
            alt="TripKaro"
            className={`${className} mix-blend-multiply`}
            style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
            draggable={false}
        />
    );
}
