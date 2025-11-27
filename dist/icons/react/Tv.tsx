import * as React from 'react';

export interface TvProps extends React.SVGProps<SVGSVGElement> {
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

const Tv = React.forwardRef<SVGSVGElement, TvProps>(
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
        <path fill="currentColor" d="M7.7 10.73v4.77h1.75v-4.77h1.9V9.2H5.82v1.53zm3.91-1.53 2.55 6.35h1.62l2.56-6.35h-1.91l-1.44 3.99-1.43-3.99z"/><path fill="currentColor" fill-rule="evenodd" d="M22 20V4H2v16zM4 6h16v12H4z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Tv.displayName = 'Tv';

export { Tv };
export default Tv;
