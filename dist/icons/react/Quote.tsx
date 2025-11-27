import * as React from 'react';

export interface QuoteProps extends React.SVGProps<SVGSVGElement> {
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

const Quote = React.forwardRef<SVGSVGElement, QuoteProps>(
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
        <path fill="currentColor" d="M11 11c0 4.5-2.15 6.61-6.57 7L4 15.9c3.03-.5 4-2.06 4-3.9H5V6h6zm9 0c0 4.5-2.15 6.61-6.57 7L13 15.9c3.03-.5 4-2.06 4-3.9h-3V6h6z"/>
      </svg>
    );
  }
);

Quote.displayName = 'Quote';

export { Quote };
export default Quote;
