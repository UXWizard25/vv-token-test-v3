import * as React from 'react';

export interface SharecastProps extends React.SVGProps<SVGSVGElement> {
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

const Sharecast = React.forwardRef<SVGSVGElement, SharecastProps>(
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
        <path fill="currentColor" d="M22 4H2v4.36h2V5.94h16v12.12h-6V20h8zM2 19.96V17.3a2.7 2.7 0 0 1 2.73 2.67zm0-4.45v-1.78a6.3 6.3 0 0 1 6.36 6.23H6.55A4.5 4.5 0 0 0 2 15.51"/><path fill="currentColor" d="M2 11.95v-1.78a9.9 9.9 0 0 1 10 9.8h-1.82A8.1 8.1 0 0 0 2 11.94"/>
      </svg>
    );
  }
);

Sharecast.displayName = 'Sharecast';

export { Sharecast };
export default Sharecast;
