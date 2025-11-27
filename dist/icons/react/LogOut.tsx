import * as React from 'react';

export interface LogOutProps extends React.SVGProps<SVGSVGElement> {
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

const LogOut = React.forwardRef<SVGSVGElement, LogOutProps>(
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
        <path fill="currentColor" d="m5.5 11.08 1.58-1.69L5.77 8 2 12l3.77 4 1.3-1.4-1.46-1.55H15v-1.97z"/><path fill="currentColor" fill-rule="evenodd" d="M9.85 7V6h10.3v12H9.85v-1H8v3h14V4H8v3z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

LogOut.displayName = 'LogOut';

export { LogOut };
export default LogOut;
