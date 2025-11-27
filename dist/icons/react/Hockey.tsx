import * as React from 'react';

export interface HockeyProps extends React.SVGProps<SVGSVGElement> {
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

const Hockey = React.forwardRef<SVGSVGElement, HockeyProps>(
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
        <path fill="currentColor" d="M19.76 2H16.8L13 9.14l1.43 2.65zM6.93 2H4.2l6.38 11.67-3.24 6.07a.5.5 0 0 1-.44.26H3.97L2 22h5.68a2 2 0 0 0 1.75-1.04l2.56-4.7 2.58 4.7A2 2 0 0 0 16.32 22H22l-1.97-2h-3.16a.5.5 0 0 1-.44-.26z"/>
      </svg>
    );
  }
);

Hockey.displayName = 'Hockey';

export { Hockey };
export default Hockey;
