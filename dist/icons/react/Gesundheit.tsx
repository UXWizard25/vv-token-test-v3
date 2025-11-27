import * as React from 'react';

export interface GesundheitProps extends React.SVGProps<SVGSVGElement> {
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

const Gesundheit = React.forwardRef<SVGSVGElement, GesundheitProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="m16 2 3.26 11.05H22v1.94h-4.25L16 9.06 12.18 22l-4.23-9.73-1.31 2.72H2v-1.94h3.36L8.05 7.5l3.77 8.68z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Gesundheit.displayName = 'Gesundheit';

export { Gesundheit };
export default Gesundheit;
