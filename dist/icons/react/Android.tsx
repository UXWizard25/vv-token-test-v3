import * as React from 'react';

export interface AndroidProps extends React.SVGProps<SVGSVGElement> {
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

const Android = React.forwardRef<SVGSVGElement, AndroidProps>(
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
        <path fill="currentColor" d="m15.56 2.29-1.01 1.43a4.8 4.8 0 0 1 2.84 3.8H6.64a4.7 4.7 0 0 1 2.82-3.8l-1-1.43q-.08-.17.04-.26.14-.07.26.05l1.04 1.5a6 6 0 0 1 2.22-.4 6 6 0 0 1 2.23.4l1.03-1.5a.17.17 0 0 1 .24-.05q.11.08.05.26zM9.73 6c.34 0 .6-.26.6-.6a.6.6 0 0 0-.6-.6.6.6 0 0 0-.59.6c0 .34.28.6.6.6m4.6 0c.34 0 .6-.26.6-.6a.6.6 0 0 0-.6-.6.6.6 0 0 0-.6.6c0 .34.3.6.6.6M3.5 14.3V9.48c0-.67.52-1.25 1.22-1.25.67 0 1.19.58 1.19 1.25v4.81a1.2 1.2 0 1 1-2.4 0m14.56 0V9.5c0-.68.54-1.26 1.21-1.26s1.22.58 1.22 1.25v4.81c0 .7-.54 1.25-1.22 1.25s-1.21-.55-1.21-1.25M6.66 17.08v-8.8h10.76v8.82c0 .52-.44.96-.96.96H15.4v2.73c0 .67-.54 1.22-1.21 1.22a1.2 1.2 0 0 1-1.22-1.22v-2.73h-1.89v2.73A1.2 1.2 0 0 1 9.9 22a1.2 1.2 0 0 1-1.22-1.22v-2.73H7.6a.97.97 0 0 1-.93-.97"/>
      </svg>
    );
  }
);

Android.displayName = 'Android';

export { Android };
export default Android;
