import React from 'react';

interface TypographyToken {
  $value: string | number;
  $type?: string;
}

interface FontFamilyItemProps {
  name: string;
  value: string;
  cssVar?: string;
}

/**
 * Font family display
 */
export const FontFamilyItem: React.FC<FontFamilyItemProps> = ({ name, value, cssVar }) => (
  <div style={{
    padding: '16px 0',
    borderBottom: '1px solid #eee',
  }}>
    <div style={{
      fontFamily: value,
      fontSize: '24px',
      marginBottom: '8px',
      color: '#232629',
    }}>
      The quick brown fox jumps over the lazy dog
    </div>
    <div style={{
      display: 'flex',
      gap: '16px',
      fontSize: '12px',
    }}>
      <span style={{ fontWeight: 600, color: '#232629' }}>{name}</span>
      <span style={{ color: '#666', fontFamily: 'monospace' }}>{value}</span>
      {cssVar && (
        <span style={{ color: '#999', fontFamily: 'monospace' }}>{cssVar}</span>
      )}
    </div>
  </div>
);

interface FontSizeScaleProps {
  tokens: Record<string, TypographyToken>;
  prefix?: string;
}

/**
 * Font size scale display
 */
export const FontSizeScale: React.FC<FontSizeScaleProps> = ({ tokens, prefix = '--' }) => {
  const sizeEntries = Object.entries(tokens)
    .filter(([_, token]) =>
      token.$type === 'fontSize' ||
      token.$type === 'dimension' ||
      (typeof token.$value === 'string' && token.$value.endsWith('px'))
    )
    .sort((a, b) => {
      const aVal = parseInt(String(a[1].$value), 10);
      const bVal = parseInt(String(b[1].$value), 10);
      return aVal - bVal;
    });

  return (
    <div>
      {sizeEntries.map(([name, token]) => {
        const size = typeof token.$value === 'string' ? token.$value : `${token.$value}px`;
        return (
          <div key={name} style={{
            padding: '12px 0',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'baseline',
            gap: '16px',
          }}>
            <span style={{
              fontSize: size,
              color: '#232629',
              minWidth: '200px',
            }}>
              Aa
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#232629',
              minWidth: '150px',
            }}>
              {name}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#666',
              fontFamily: 'monospace',
            }}>
              {size}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface FontWeightScaleProps {
  tokens: Record<string, TypographyToken>;
}

/**
 * Font weight scale display
 */
export const FontWeightScale: React.FC<FontWeightScaleProps> = ({ tokens }) => {
  const weightEntries = Object.entries(tokens)
    .filter(([_, token]) =>
      token.$type === 'fontWeight' ||
      (typeof token.$value === 'number' && token.$value >= 100 && token.$value <= 900)
    )
    .sort((a, b) => Number(a[1].$value) - Number(b[1].$value));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
    }}>
      {weightEntries.map(([name, token]) => (
        <div key={name} style={{
          padding: '16px',
          border: '1px solid #eee',
          borderRadius: '8px',
        }}>
          <div style={{
            fontWeight: Number(token.$value),
            fontSize: '24px',
            marginBottom: '8px',
            color: '#232629',
          }}>
            Aa
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#232629' }}>
            {name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {token.$value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default { FontFamilyItem, FontSizeScale, FontWeightScale };
