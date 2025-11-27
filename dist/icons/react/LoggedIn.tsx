import * as React from 'react';

export interface LoggedInProps extends React.SVGProps<SVGSVGElement> {
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

const LoggedIn = React.forwardRef<SVGSVGElement, LoggedInProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="m17.7 5.77 3.32-3.35 1.4 1.4L17.7 8.6l-2.74-2.77 1.39-1.4zM11.5 13a3.6 3.6 0 0 0 3.59-3.62c0-2-1.6-3.63-3.59-3.63S7.91 7.37 7.91 9.37s1.6 3.62 3.59 3.62m0-1.99a1.63 1.63 0 0 0 0-3.26c-.89 0-1.61.73-1.61 1.63S10.6 11 11.5 11" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M21.3 10q.2.97.2 2a10 10 0 1 1-10-10q1.03 0 2 .2v2.05a8 8 0 0 0-8.3 12.69A8.2 8.2 0 0 1 11.5 14a8.2 8.2 0 0 1 6.3 2.95A8 8 0 0 0 19.25 10zm-9.8 10c1.82 0 3.5-.61 4.85-1.64A6.2 6.2 0 0 0 11.49 16a6.2 6.2 0 0 0-4.85 2.35A8 8 0 0 0 11.5 20" clip-rule="evenodd"/>
      </svg>
    );
  }
);

LoggedIn.displayName = 'LoggedIn';

export { LoggedIn };
export default LoggedIn;
