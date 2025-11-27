import * as React from 'react';

export interface GewinnspieleProps extends React.SVGProps<SVGSVGElement> {
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

const Gewinnspiele = React.forwardRef<SVGSVGElement, GewinnspieleProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M6 6h12v12H6zm14-2v16H4V4z" clip-rule="evenodd"/><path fill="currentColor" d="M7.42 15.31a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0m5.84-6.42a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0"/>
      </svg>
    );
  }
);

Gewinnspiele.displayName = 'Gewinnspiele';

export { Gewinnspiele };
export default Gewinnspiele;
