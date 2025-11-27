import * as React from 'react';

export interface DesktopCheckmarkProps extends React.SVGProps<SVGSVGElement> {
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

const DesktopCheckmark = React.forwardRef<SVGSVGElement, DesktopCheckmarkProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M10 8H5.98v7.41h12.04V14H20v3.09L22 22H2l2-4.91V6h6zM4.83 20.12h14.34l-1.15-2.83H5.98z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M17 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10m-.63 5.65-1.52-1.09-.7.98 2.42 1.72 3.31-3.87-.9-.78z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

DesktopCheckmark.displayName = 'DesktopCheckmark';

export { DesktopCheckmark };
export default DesktopCheckmark;
