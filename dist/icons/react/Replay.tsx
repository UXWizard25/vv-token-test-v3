import * as React from 'react';

export interface ReplayProps extends React.SVGProps<SVGSVGElement> {
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

const Replay = React.forwardRef<SVGSVGElement, ReplayProps>(
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
        <path fill="currentColor" d="M5.57 5.1h11.26l-1.7-1.72L16.5 2l4 4.03-4 4.03-1.37-1.38 1.6-1.62H7.52v3.74H5.57zm13.3 13.8H7.17l1.7 1.72L7.5 22l-4-4.03 4-4.03 1.37 1.38-1.6 1.62h9.66V12.8h1.94z"/>
      </svg>
    );
  }
);

Replay.displayName = 'Replay';

export { Replay };
export default Replay;
