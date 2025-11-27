import * as React from 'react';

export interface LoginProps extends React.SVGProps<SVGSVGElement> {
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

const Login = React.forwardRef<SVGSVGElement, LoginProps>(
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
        <path fill="currentColor" d="M4 6v2h2V6h2V4H6V2H4v2H2v2z"/><path fill="currentColor" fill-rule="evenodd" d="M12 12.91a3.64 3.64 0 1 0 0-7.27 3.64 3.64 0 0 0 0 7.27m0-2a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M2.2 10q-.2.97-.2 2A10 10 0 1 0 12 2q-1.03 0-2 .2v2.05a8 8 0 0 1 8.3 12.69A8.2 8.2 0 0 0 12 14a8.2 8.2 0 0 0-6.3 2.95A8 8 0 0 1 4.26 10zM12 20a8 8 0 0 1-4.85-1.64 6.17 6.17 0 0 1 9.71-.01A8 8 0 0 1 12 20" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Login.displayName = 'Login';

export { Login };
export default Login;
