import React from 'react';

interface SpacingToken {
  $value: string | number;
  $type?: string;
}

interface SpacingItemProps {
  name: string;
  value: string | number;
  cssVar?: string;
}

/**
 * Single spacing item with visual representation
 */
export const SpacingItem: React.FC<SpacingItemProps> = ({ name, value, cssVar }) => {
  const numericValue = typeof value === 'number' ? value : parseInt(value as string, 10);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '8px 0',
      borderBottom: '1px solid #eee',
    }}>
      <div style={{
        width: '120px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          height: '24px',
          width: `${Math.min(numericValue, 120)}px`,
          backgroundColor: '#DD0000',
          borderRadius: '2px',
          opacity: 0.8,
        }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 600,
          fontSize: '14px',
          color: '#232629',
        }}>
          {name}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#666',
          fontFamily: 'monospace',
        }}>
          {value}px
        </div>
        {cssVar && (
          <div style={{
            fontSize: '11px',
            color: '#999',
            fontFamily: 'monospace',
          }}>
            {cssVar}
          </div>
        )}
      </div>
    </div>
  );
};

interface SpacingScaleProps {
  tokens: Record<string, SpacingToken>;
  prefix?: string;
}

/**
 * Display spacing scale from token JSON
 */
export const SpacingScale: React.FC<SpacingScaleProps> = ({ tokens, prefix = '--' }) => {
  const spacingEntries = Object.entries(tokens)
    .filter(([_, token]) =>
      token.$type === 'dimension' ||
      token.$type === 'spacing' ||
      (typeof token.$value === 'string' && token.$value.endsWith('px'))
    )
    .sort((a, b) => {
      const aVal = parseInt(String(a[1].$value), 10);
      const bVal = parseInt(String(b[1].$value), 10);
      return aVal - bVal;
    });

  return (
    <div>
      {spacingEntries.map(([name, token]) => (
        <SpacingItem
          key={name}
          name={name}
          value={parseInt(String(token.$value), 10)}
          cssVar={`${prefix}${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
        />
      ))}
    </div>
  );
};

export default SpacingScale;
