import * as React from 'react';

export interface SkipTenSecProps extends React.SVGProps<SVGSVGElement> {
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

const SkipTenSec = React.forwardRef<SVGSVGElement, SkipTenSecProps>(
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
        <path fill="currentColor" d="M12.49 7.26 8.2 11.53l-1.47-1.47L8.7 8.11c-2.91.48-5.12 2.75-5.12 5.48 0 3.06 2.8 5.56 6.23 5.56V21c-4.59 0-8.31-3.32-8.31-7.41 0-3.71 3.05-6.79 7.04-7.33l-1.8-1.8L8.21 3z"/><path fill="currentColor" fill-rule="evenodd" d="M15.77 17.25c0 2.04 1.28 3.73 3.35 3.73s3.38-1.81 3.38-3.77c0-2.04-1.29-3.73-3.36-3.73s-3.37 1.81-3.37 3.77m3.35-2c1.82 0 1.87 3.96.02 3.96-1.81 0-1.83-3.97-.02-3.97" clip-rule="evenodd"/><path fill="currentColor" d="M12.25 15.43v5.4h1.99v-7.26h-1.47l-2.13.6.39 1.55z"/>
      </svg>
    );
  }
);

SkipTenSec.displayName = 'SkipTenSec';

export { SkipTenSec };
export default SkipTenSec;
