import * as React from 'react';

export interface RatgeberProps extends React.SVGProps<SVGSVGElement> {
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

const Ratgeber = React.forwardRef<SVGSVGElement, RatgeberProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M2 3h20v14.08h-1.5L20 21l-3.92-3.92H2zm2 1.98V15.1h13.14L19 17.5l-.1-2.4H20V4.98z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M18.06 9h-12V7h12zm0 4h-12v-2h12z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Ratgeber.displayName = 'Ratgeber';

export { Ratgeber };
export default Ratgeber;
