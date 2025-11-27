import * as React from 'react';

export interface SignUpProps extends React.SVGProps<SVGSVGElement> {
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

const SignUp = React.forwardRef<SVGSVGElement, SignUpProps>(
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
        <path fill="currentColor" d="M18 2H2v20h16.04v-8H16v6H4.04V4H16v1h2z"/><path fill="currentColor" d="m22 6-1.44-1.41-9.3 9.11-.08 1.42h1.52zm-8.25 3H6V7h7.75zM6 12h5v-2H6z"/>
      </svg>
    );
  }
);

SignUp.displayName = 'SignUp';

export { SignUp };
export default SignUp;
