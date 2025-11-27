import * as React from 'react';

export interface RaetselProps extends React.SVGProps<SVGSVGElement> {
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

const Raetsel = React.forwardRef<SVGSVGElement, RaetselProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M2 2h14v6h6v8h-6v6H8V10H2zm8 6h4V4h-4zM8 8H4V4h4zm2 8v4h4v-4zm6-2h4v-4h-4zm-2-4v4h-4v-4z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Raetsel.displayName = 'Raetsel';

export { Raetsel };
export default Raetsel;
