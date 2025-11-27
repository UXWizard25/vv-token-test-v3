import * as React from 'react';

export interface ReloadProps extends React.SVGProps<SVGSVGElement> {
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

const Reload = React.forwardRef<SVGSVGElement, ReloadProps>(
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
        <path fill="currentColor" d="M5.95 6.8V4H4v6h6V8.06H7.43a6.1 6.1 0 0 1 4.64-2.11c3.4 0 5.99 2.56 5.99 5.95s-2.76 6.16-6.16 6.16c-2.78 0-5.13-1.54-5.89-4.07H4C4.81 17.61 8.04 20 11.9 20a8.1 8.1 0 0 0 8.1-8.1C20 7.42 16.54 4 12.07 4a8 8 0 0 0-6.12 2.8"/>
      </svg>
    );
  }
);

Reload.displayName = 'Reload';

export { Reload };
export default Reload;
