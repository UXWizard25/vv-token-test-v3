import * as React from 'react';

export interface FastUpwardProps extends React.SVGProps<SVGSVGElement> {
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

const FastUpward = React.forwardRef<SVGSVGElement, FastUpwardProps>(
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
        <path fill="currentColor" d="m16.6 12.82-4.8-4.8-4.79 4.8-1.41-1.41 6.2-6.21 6.21 6.2z"/><path fill="currentColor" d="m16.6 18.82-4.8-4.8-4.79 4.8-1.41-1.41 6.2-6.21 6.21 6.2z"/>
      </svg>
    );
  }
);

FastUpward.displayName = 'FastUpward';

export { FastUpward };
export default FastUpward;
