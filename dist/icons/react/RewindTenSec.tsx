import * as React from 'react';

export interface RewindTenSecProps extends React.SVGProps<SVGSVGElement> {
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

const RewindTenSec = React.forwardRef<SVGSVGElement, RewindTenSecProps>(
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
        <path fill="currentColor" d="m11.69 7.26 4.2 4.27 1.45-1.47-1.92-1.95c2.86.48 5.03 2.75 5.03 5.48 0 3.06-2.75 5.56-6.13 5.56V21c4.52 0 8.18-3.32 8.18-7.41 0-3.71-3-6.79-6.93-7.33l1.77-1.8L15.9 3z"/><path fill="currentColor" fill-rule="evenodd" d="M6.54 17.25c0 2.04 1.27 3.73 3.3 3.73 2.05 0 3.33-1.81 3.33-3.77 0-2.04-1.27-3.73-3.3-3.73-2.04 0-3.33 1.81-3.33 3.77m3.3-2c1.8 0 1.85 3.96.03 3.96-1.79 0-1.8-3.97-.02-3.97" clip-rule="evenodd"/><path fill="currentColor" d="M3.09 15.43v5.4h1.95v-7.26H3.6l-2.1.6.38 1.55z"/>
      </svg>
    );
  }
);

RewindTenSec.displayName = 'RewindTenSec';

export { RewindTenSec };
export default RewindTenSec;
