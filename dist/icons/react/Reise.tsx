import * as React from 'react';

export interface ReiseProps extends React.SVGProps<SVGSVGElement> {
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

const Reise = React.forwardRef<SVGSVGElement, ReiseProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M11 2H5v4H2v15h1.5v1h2v-1H8v-2H4V8h8v2.96h2V6h-3zM9 6V4H7v2z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M10 12.96h12v9H10zm2 2v5h8v-5z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Reise.displayName = 'Reise';

export { Reise };
export default Reise;
