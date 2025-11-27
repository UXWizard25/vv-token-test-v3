import * as React from 'react';

export interface StarProps extends React.SVGProps<SVGSVGElement> {
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

const Star = React.forwardRef<SVGSVGElement, StarProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M11.08 2.63a1 1 0 0 1 1.84 0l2.28 5.76 5.9.5a1 1 0 0 1 .57 1.72l-4.52 4.07 1.38 6.1a1 1 0 0 1-1.5 1.06L12 18.6l-5.03 3.23a1 1 0 0 1-1.5-1.05l1.38-6.1-4.52-4.08a1 1 0 0 1 .58-1.73l5.89-.5zm.92 3-1.6 4.04a1 1 0 0 1-.84.62l-4.25.36L8.6 13.6c.27.24.38.61.3.96l-.98 4.34 3.55-2.28a1 1 0 0 1 1.08 0l3.55 2.28-.98-4.34a1 1 0 0 1 .3-.96l3.28-2.95-4.25-.36a1 1 0 0 1-.84-.62z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Star.displayName = 'Star';

export { Star };
export default Star;
