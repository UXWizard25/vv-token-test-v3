import * as React from 'react';

export interface RegioProps extends React.SVGProps<SVGSVGElement> {
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

const Regio = React.forwardRef<SVGSVGElement, RegioProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-2 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M20 9.27C20 14.73 12 22 12 22S4 14.73 4 9.27C4 5.26 7.58 2 12 2s8 3.26 8 7.27m-2.04 0q0 1.36-1.02 3.36a24 24 0 0 1-2.53 3.78A40 40 0 0 1 12 19.14a40 40 0 0 1-2.4-2.73 24 24 0 0 1-2.54-3.78 8 8 0 0 1-1.02-3.36c0-2.71 2.48-5.23 5.96-5.23s5.96 2.52 5.96 5.23" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Regio.displayName = 'Regio';

export { Regio };
export default Regio;
