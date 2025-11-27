import * as React from 'react';

export interface AppleIosProps extends React.SVGProps<SVGSVGElement> {
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

const AppleIos = React.forwardRef<SVGSVGElement, AppleIosProps>(
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
        <path fill="currentColor" d="M16.01 2h.15a4.2 4.2 0 0 1-1.12 3.23c-.67.75-1.6 1.5-3.07 1.38a4 4 0 0 1 1.14-3.13A5 5 0 0 1 16.01 2m4.5 14.68v.04a12 12 0 0 1-1.75 3.21c-.66.87-1.47 2.05-2.92 2.05-1.25 0-2.08-.77-3.36-.8-1.36-.01-2.1.65-3.35.82h-.42c-.91-.13-1.65-.82-2.18-1.44a12.4 12.4 0 0 1-3.03-7.27v-.9a5.8 5.8 0 0 1 2.67-4.8A4.7 4.7 0 0 1 9.2 6.9c.5.08 1.02.24 1.48.4.43.17.97.45 1.48.44.34-.01.69-.19 1.04-.31 1.02-.35 2.02-.76 3.34-.57q2.37.36 3.41 1.95c-1.34.82-2.4 2.06-2.22 4.16.16 1.92 1.32 3.04 2.77 3.7"/>
      </svg>
    );
  }
);

AppleIos.displayName = 'AppleIos';

export { AppleIos };
export default AppleIos;
