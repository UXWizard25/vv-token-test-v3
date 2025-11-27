import * as React from 'react';

export interface SzTickerProps extends React.SVGProps<SVGSVGElement> {
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

const SzTicker = React.forwardRef<SVGSVGElement, SzTickerProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M17 12a5 5 0 1 1 0 10 5 5 0 0 1 0-10m-1 6.03h3.53v-1.05h-2.48V14.5H16z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M20.95 10.69a7 7 0 0 0-2.1-1.02v-4.8L8.37 8.3l.4 5.12 1.27.22a7.3 7.3 0 0 0 .3 6.77l-3.66 1.44-2.94-6.95L2 14.7V7.8l4.97-1.22L20.95 2zM7.3 19.39l1.47-.5-1.45-3.56H5.68zM4.1 9.42v3.44l2.53.27-.33-4.26z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

SzTicker.displayName = 'SzTicker';

export { SzTicker };
export default SzTicker;
