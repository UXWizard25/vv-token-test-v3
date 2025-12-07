import React from 'react';

interface ShadowItemProps {
  name: string;
  className: string;
}

/**
 * Single shadow display
 */
export const ShadowItem: React.FC<ShadowItemProps> = ({ name, className }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  }}>
    <div
      className={className}
      style={{
        width: '120px',
        height: '80px',
        backgroundColor: '#fff',
        borderRadius: '8px',
      }}
    />
    <div style={{
      fontSize: '12px',
      color: '#666',
      textAlign: 'center',
    }}>
      <div style={{ fontWeight: 600, color: '#232629' }}>{name}</div>
      <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>.{className}</div>
    </div>
  </div>
);

interface ShadowGalleryProps {
  shadows: Array<{ name: string; className: string }>;
}

/**
 * Gallery of shadow effects
 */
export const ShadowGallery: React.FC<ShadowGalleryProps> = ({ shadows }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '32px',
    padding: '24px',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
  }}>
    {shadows.map((shadow) => (
      <ShadowItem key={shadow.className} {...shadow} />
    ))}
  </div>
);

/**
 * Predefined semantic shadows
 */
export const SemanticShadows: React.FC = () => (
  <ShadowGallery
    shadows={[
      { name: 'Soft SM', className: 'shadow-soft-sm' },
      { name: 'Soft MD', className: 'shadow-soft-md' },
      { name: 'Soft LG', className: 'shadow-soft-lg' },
      { name: 'Soft XL', className: 'shadow-soft-xl' },
      { name: 'Hard SM', className: 'shadow-hard-sm' },
      { name: 'Hard MD', className: 'shadow-hard-md' },
      { name: 'Hard LG', className: 'shadow-hard-lg' },
      { name: 'Hard XL', className: 'shadow-hard-xl' },
    ]}
  />
);

export default ShadowGallery;
