import * as React from 'react';

export interface RevocationProps extends React.SVGProps<SVGSVGElement> {
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

const Revocation = React.forwardRef<SVGSVGElement, RevocationProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M2.82 3.16a37 37 0 0 1 18.36 0l.82.22-.08.84c-.31 3.19-.33 6.52-1.02 9.64-.35 1.6-1.64 3.36-3.17 4.78a14 14 0 0 1-5.46 3.28L12 22l-.27-.08a14 14 0 0 1-5.46-3.28c-1.53-1.42-2.82-3.18-3.17-4.78-.69-3.12-.7-6.45-1.02-9.64L2 3.38zM4.14 4.9c.26 2.83.29 5.77.9 8.54.22 1.01 1.16 2.42 2.58 3.75A13 13 0 0 0 12 19.92a13 13 0 0 0 4.38-2.74c1.42-1.33 2.36-2.73 2.58-3.75.61-2.77.64-5.71.9-8.54a35 35 0 0 0-15.72 0" clip-rule="evenodd"/><path fill="currentColor" d="m10.7 11.12-1.4 1.42 1.4 1.41 1.42-1.41 1.42 1.41 1.41-1.41-1.41-1.42 1.41-1.41-1.41-1.42-1.42 1.42-1.41-1.42-1.42 1.42z"/>
      </svg>
    );
  }
);

Revocation.displayName = 'Revocation';

export { Revocation };
export default Revocation;
