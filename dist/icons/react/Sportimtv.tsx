import * as React from 'react';

export interface SportimtvProps extends React.SVGProps<SVGSVGElement> {
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

const Sportimtv = React.forwardRef<SVGSVGElement, SportimtvProps>(
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
        <path fill="currentColor" d="M10 2 5 4l-3 7.5 3.5 1V22h6.6a7 7 0 0 1-1.43-2H7.5v-9l-2.82-.81 1.86-4.65L9.62 4.3a4.4 4.4 0 0 0 4.76 0l3.08 1.24 1.86 4.65L22 11.5 19 4l-5-2-.3.3a2.4 2.4 0 0 1-3.4 0z"/><path fill="currentColor" d="M10 8v2h4V8z"/><path fill="currentColor" fill-rule="evenodd" d="M17 12a5 5 0 1 1 0 10 5 5 0 0 1 0-10m-.2 3.3 1.4 3.5h.9l1.4-3.5h-1.05l-.8 2.2-.79-2.2zm-3.2 0v.84h1.04v2.64h.96v-2.64h1.04v-.84z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Sportimtv.displayName = 'Sportimtv';

export { Sportimtv };
export default Sportimtv;
