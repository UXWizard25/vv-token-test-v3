import * as React from 'react';

export interface SportTickerProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (width and height)
   * @default 24
   */
  size?: number | string;
  /**
   * Accessible label for screen readers.
   * If provided, aria-hidden will be set to false.
   */
  'aria-label'?: string;
  /**
   * Hide icon from screen readers (decorative icon)
   * @default true
   */
  'aria-hidden'?: boolean;
  /**
   * Optional title element for tooltip/accessibility
   */
  title?: string;
}

const SportTicker = React.forwardRef<SVGSVGElement, SportTickerProps>(
  (
    {
      size = 24,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = true,
      title,
      ...props
    },
    ref
  ) => {
    const isDecorative = !ariaLabel && ariaHidden;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        role="img"
        aria-hidden={isDecorative}
        aria-label={ariaLabel}
        {...props}
      >
        {title && <title>{title}</title>}
        <path fill="currentColor" d="m19 4 3 7.5-2.68-1.31-1.86-4.65-3.08-1.23a4.4 4.4 0 0 1-4.76 0L6.54 5.54l-1.86 4.65 2.82.8V20h3.17a7 7 0 0 0 1.43 2H5.5v-9.5l-3.5-1L5 4l5-2 .3.3a2.4 2.4 0 0 0 3.4 0L14 2z"/><path fill="currentColor" fill-rule="evenodd" d="M17 12a5 5 0 1 1 0 10 5 5 0 0 1 0-10m-1 6.03h3.53v-1.05h-2.48V14.5H16z" clip-rule="evenodd"/><path fill="currentColor" d="M14 10h-4V8h4z"/>
      </svg>
    );
  }
);

SportTicker.displayName = 'SportTicker';

export { SportTicker };
export default SportTicker;
