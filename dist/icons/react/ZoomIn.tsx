import * as React from 'react';

export interface ZoomInProps extends React.SVGProps<SVGSVGElement> {
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

const ZoomIn = React.forwardRef<SVGSVGElement, ZoomInProps>(
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
        <path fill="currentColor" d="M4 4h6v2H7.41l3.3 3.3-1.42 1.4L6 7.42V10H4zm14 3.41-3.3 3.3-1.4-1.42L16.58 6H14V4h6v6h-2zm-4.7 7.3L16.58 18H14v2h6v-6h-2v2.59l-3.3-3.3zM7.4 18l3.3-3.3-1.42-1.4L6 16.58V14H4v6h6v-2z"/>
      </svg>
    );
  }
);

ZoomIn.displayName = 'ZoomIn';

export { ZoomIn };
export default ZoomIn;
