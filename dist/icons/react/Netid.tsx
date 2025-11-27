import * as React from 'react';

export interface NetidProps extends React.SVGProps<SVGSVGElement> {
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

const Netid = React.forwardRef<SVGSVGElement, NetidProps>(
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
        <path fill="currentColor" d="m10.88 7.38 1.27-1.3 2.38 2.52 6.74-7.1 1.23 1.27-8 8.48z"/><path fill="currentColor" d="m20.58 7.25-1.03 1.08c.58 2.05.45 3.66-1.58 5.81l-2.36 2.5-8.59-9.1L9.4 5.03c2.53-2.68 4.63-2.48 7.06-.9l.95-1C14.4.95 11.55.82 8.47 4.1L1.5 11.47 11.9 22.5l6.97-7.38c2.58-2.73 2.77-5.11 1.7-7.87"/>
      </svg>
    );
  }
);

Netid.displayName = 'Netid';

export { Netid };
export default Netid;
