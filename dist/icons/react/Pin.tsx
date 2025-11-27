import * as React from 'react';

export interface PinProps extends React.SVGProps<SVGSVGElement> {
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

const Pin = React.forwardRef<SVGSVGElement, PinProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M18 4h-1.93l.58 7.34c.56.4 1.32 1.1 2 2.1a4.7 4.7 0 0 1 .66 3.98l-.23.67H13V22h-2v-3.9H4.92l-.23-.68a4.7 4.7 0 0 1 .65-3.98 9 9 0 0 1 2-2.1L7.82 4H6V2h12zM9.85 4h4.18l.68 8.54.51.25c.18.09.98.62 1.75 1.75.38.55.5 1.14.5 1.58H6.53a3 3 0 0 1 .5-1.59 6 6 0 0 1 1.75-1.74l.52-.25z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Pin.displayName = 'Pin';

export { Pin };
export default Pin;
