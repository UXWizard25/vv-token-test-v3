import * as React from 'react';

export interface ClockProps extends React.SVGProps<SVGSVGElement> {
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

const Clock = React.forwardRef<SVGSVGElement, ClockProps>(
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
        <path fill="currentColor" d="M11.99 2A10 10 0 1 0 12 21.99 10 10 0 0 0 11.99 2M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16"/><path fill="currentColor" fill-rule="evenodd" d="M16 13.6h-5.5V7h2v4.6H16z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Clock.displayName = 'Clock';

export { Clock };
export default Clock;
