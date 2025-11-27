import * as React from 'react';

export interface HeartProps extends React.SVGProps<SVGSVGElement> {
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

const Heart = React.forwardRef<SVGSVGElement, HeartProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M7.95 3.97A3.9 3.9 0 0 0 4 7.87v.44A7.6 7.6 0 0 0 5.27 12c.8 1.33 1.87 2.67 2.97 3.86A43 43 0 0 0 12 19.45a43 43 0 0 0 3.76-3.6A24 24 0 0 0 18.73 12 7.6 7.6 0 0 0 20 8.3v-.44c0-2.15-1.77-3.9-3.95-3.9a4 4 0 0 0-3.23 1.66L12 6.77l-.82-1.14a4 4 0 0 0-3.23-1.66m3.32 17.45-.3-.24a45 45 0 0 1-4.21-4A26 26 0 0 1 3.54 13 9.5 9.5 0 0 1 2 8.31v-.44a5.97 5.97 0 0 1 10-4.3A6 6 0 0 1 16.05 2 5.9 5.9 0 0 1 22 7.87v.44c0 1.59-.66 3.21-1.54 4.69-.9 1.5-2.07 2.94-3.22 4.18a45 45 0 0 1-4.5 4.24L12 22z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Heart.displayName = 'Heart';

export { Heart };
export default Heart;
