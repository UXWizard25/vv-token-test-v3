import * as React from 'react';

export interface SportProps extends React.SVGProps<SVGSVGElement> {
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

const Sport = React.forwardRef<SVGSVGElement, SportProps>(
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
        <path fill="currentColor" d="M10 8v2h4V8z"/><path fill="currentColor" fill-rule="evenodd" d="M10 2 5 4l-3 7.5 3.5 1V22h13v-9.5l3.5-1L19 4l-5-2-.3.3a2.4 2.4 0 0 1-3.4 0zM7.5 20v-9l-2.82-.81 1.86-4.65L9.62 4.3a4.4 4.4 0 0 0 4.76 0l3.08 1.24 1.86 4.65-2.82.8V20z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Sport.displayName = 'Sport';

export { Sport };
export default Sport;
