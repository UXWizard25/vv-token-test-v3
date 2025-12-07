import React from 'react';

interface ColorToken {
  $value: string;
  $type?: string;
}

interface ColorSwatchProps {
  name: string;
  value: string;
  cssVar?: string;
}

/**
 * Single color swatch with name and value
 */
export const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, value, cssVar }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      backgroundColor: value,
      borderRadius: '8px',
      border: '1px solid rgba(0,0,0,0.1)',
      flexShrink: 0,
    }} />
    <div style={{ flex: 1, minWidth: 0 }}>
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
        {value}
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

interface ColorPaletteProps {
  tokens: Record<string, ColorToken>;
  prefix?: string;
}

/**
 * Display a palette of colors from token JSON
 */
export const ColorPalette: React.FC<ColorPaletteProps> = ({ tokens, prefix = '--' }) => {
  const colorEntries = Object.entries(tokens).filter(
    ([_, token]) => token.$type === 'color' || token.$value?.startsWith('#') || token.$value?.startsWith('rgb')
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
    }}>
      {colorEntries.map(([name, token]) => (
        <ColorSwatch
          key={name}
          name={name}
          value={token.$value}
          cssVar={`${prefix}${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
        />
      ))}
    </div>
  );
};

interface ColorGridProps {
  tokens: Record<string, ColorToken>;
  columns?: number;
}

/**
 * Compact color grid for large palettes
 */
export const ColorGrid: React.FC<ColorGridProps> = ({ tokens, columns = 8 }) => {
  const colorEntries = Object.entries(tokens).filter(
    ([_, token]) => token.$type === 'color' || token.$value?.startsWith('#') || token.$value?.startsWith('rgb')
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '4px',
    }}>
      {colorEntries.map(([name, token]) => (
        <div
          key={name}
          title={`${name}: ${token.$value}`}
          style={{
            aspectRatio: '1',
            backgroundColor: token.$value,
            borderRadius: '4px',
            border: '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
