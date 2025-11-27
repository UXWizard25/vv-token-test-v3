import * as React from 'react';

export interface UnterhaltungProps extends React.SVGProps<SVGSVGElement> {
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

const Unterhaltung = React.forwardRef<SVGSVGElement, UnterhaltungProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16" clip-rule="evenodd"/><path fill="currentColor" d="m12 7 1.39 3.16 3.61.28-2.75 2.23.84 3.33L12 14.21 8.91 16l.84-3.33L7 10.44l3.61-.28z"/>
      </svg>
    );
  }
);

Unterhaltung.displayName = 'Unterhaltung';

export { Unterhaltung };
export default Unterhaltung;
