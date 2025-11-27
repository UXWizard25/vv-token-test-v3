import * as React from 'react';

export interface MotorsportProps extends React.SVGProps<SVGSVGElement> {
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

const Motorsport = React.forwardRef<SVGSVGElement, MotorsportProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M13.93 3.02c-4.52-.23-7.47 1.57-9.3 3.95a14 14 0 0 0-2.6 6.99c-.1 1 .11 2.48.38 3.7a19 19 0 0 0 .7 2.38q.11.29.33.58l.3.38h15.18l.3-.38a12.9 12.9 0 0 0 2.42-10.96c-.9-3.53-3.53-6.43-7.71-6.64M5.35 9.55a12 12 0 0 0-1.13 3.22l9.3-.19a1.5 1.5 0 0 0 1.5-1.51 1.5 1.5 0 0 0-1.53-1.52zM4 14.76a17 17 0 0 0 .76 4l.08.25h13.09a11 11 0 0 0 1.76-8.86c-.73-2.89-2.76-5-5.88-5.15-3.41-.17-5.63.99-7.09 2.57h6.76a3.5 3.5 0 0 1 3.52 3.5c0 1.9-1.54 3.46-3.45 3.5z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Motorsport.displayName = 'Motorsport';

export { Motorsport };
export default Motorsport;
