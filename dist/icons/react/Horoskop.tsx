import * as React from 'react';

export interface HoroskopProps extends React.SVGProps<SVGSVGElement> {
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

const Horoskop = React.forwardRef<SVGSVGElement, HoroskopProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M12.75 2.08q1.46.19 2.75.75a10 10 0 0 0-2.25 1.36A10 10 0 0 0 9.5 12a10 10 0 0 0 3.75 7.8 10 10 0 0 0 2.25 1.37 10 10 0 0 1-4 .83 10 10 0 1 1 0-20q.64 0 1.25.08M3.5 12a8 8 0 0 1 7-7.94 11.95 11.95 0 0 0 0 15.88 8 8 0 0 1-7-7.94" clip-rule="evenodd"/><path fill="currentColor" d="M18.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m2.5 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-1 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
      </svg>
    );
  }
);

Horoskop.displayName = 'Horoskop';

export { Horoskop };
export default Horoskop;
