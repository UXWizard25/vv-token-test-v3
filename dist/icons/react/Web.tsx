import * as React from 'react';

export interface WebProps extends React.SVGProps<SVGSVGElement> {
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

const Web = React.forwardRef<SVGSVGElement, WebProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20M4.06 13a8 8 0 0 0 5.39 6.58A13 13 0 0 1 7.04 13zm12.9 0a13 13 0 0 1-2.41 6.58A8 8 0 0 0 19.94 13zm-7.91 0c.22 2.4 1.24 4.68 2.95 6.57A11.4 11.4 0 0 0 14.95 13zm.4-8.58A8 8 0 0 0 4.06 11h2.98a13 13 0 0 1 2.41-6.58m2.55.01A11.4 11.4 0 0 0 9.05 11h5.9A11.4 11.4 0 0 0 12 4.43m2.55-.01A13 13 0 0 1 16.96 11h2.98a8 8 0 0 0-5.4-6.58" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Web.displayName = 'Web';

export { Web };
export default Web;
