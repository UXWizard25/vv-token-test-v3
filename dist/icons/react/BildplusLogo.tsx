import * as React from 'react';

export interface BildplusLogoProps extends React.SVGProps<SVGSVGElement> {
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

const BildplusLogo = React.forwardRef<SVGSVGElement, BildplusLogoProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M18.15 6a5.86 5.86 0 0 1 0 11.7 5.86 5.86 0 0 1 0-11.7m-.88 2.93v2.05h-2.05v1.75h2.05v2.05h1.75v-2.05h2.05v-1.75h-2.05V8.93z" clip-rule="evenodd"/><path fill="currentColor" d="M2.8 15.36h-.46V12.2h.46zm0-4.33h-.46v-2.7h.46zm6.57 4.33H8.9V9.97h.47z"/><path fill="currentColor" fill-rule="evenodd" d="M15.2 6q.06 0 .06.06l-.03.05-.45.25-.04.03-.04.02-.04.03-.04.03a6.44 6.44 0 0 0 .64 11.15v.03q0 .05-.05.06H0V6zM4.45 16.53h1.17V8.8H4.44zm-3.28 0h2.11q.7 0 .7-.7V12.2q0-.58-.47-.7.47-.13.47-.7V7.85q0-.7-.7-.7h-2.1zm8.2-7.73h-.93q-.7 0-.7.7v6.33q0 .7.7.7h2.1V7.16H9.38zm-3.28 7.73h1.17V7.16H6.08zm-1.64-8.2h1.17V7.16H4.44z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

BildplusLogo.displayName = 'BildplusLogo';

export { BildplusLogo };
export default BildplusLogo;
