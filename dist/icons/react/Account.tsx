import * as React from 'react';

export interface AccountProps extends React.SVGProps<SVGSVGElement> {
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

const Account = React.forwardRef<SVGSVGElement, AccountProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M12 12.91a3.64 3.64 0 1 0 0-7.27 3.64 3.64 0 0 0 0 7.27m0-2a1.64 1.64 0 1 0 0-3.27 1.64 1.64 0 0 0 0 3.27" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M4 12a8 8 0 1 1 14.3 4.94A8.2 8.2 0 0 0 12 14a8.2 8.2 0 0 0-6.3 2.95A8 8 0 0 1 4 12m3.15 6.36a7.96 7.96 0 0 0 9.71-.01 6.17 6.17 0 0 0-9.71.01" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Account.displayName = 'Account';

export { Account };
export default Account;
