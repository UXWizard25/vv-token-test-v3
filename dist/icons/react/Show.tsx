import * as React from 'react';

export interface ShowProps extends React.SVGProps<SVGSVGElement> {
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

const Show = React.forwardRef<SVGSVGElement, ShowProps>(
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
        <path fill="currentColor" d="M12 8.73A3.2 3.2 0 0 0 8.84 12c0 1.8 1.4 3.27 3.16 3.27 1.75 0 3.17-1.46 3.17-3.27S13.75 8.73 12 8.73"/><path fill="currentColor" fill-rule="evenodd" d="M12 5c-6.16 0-9.19 4.41-9.95 6.68l-.1.32.1.32C2.81 14.59 5.85 19 12 19s9.19-4.41 9.95-6.68l.1-.32-.1-.32A10.4 10.4 0 0 0 12 5m0 12a8.4 8.4 0 0 1-7.93-5C4.8 10.19 7.25 7 12 7s7.19 3.19 7.93 5A8.4 8.4 0 0 1 12 17" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Show.displayName = 'Show';

export { Show };
export default Show;
