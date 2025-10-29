import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'full' | 'mark';
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', variant = 'full' }) => {
  const src = variant === 'mark'
    ? '/brand/Main_Logo-1-768x433.png'
    : '/brand/Main_Logo-1-768x433.png';

  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className={`flex items-center gap-1 ${className}`} aria-label="RoofER">
        <span className="text-white font-extrabold text-xl tracking-tight">ROOF</span>
        <span className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--s21-secondary)' }}>ER</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="RoofER"
      className={`${className} object-contain`}
      onError={() => setError(true)}
    />
  );
};

export default BrandLogo;

