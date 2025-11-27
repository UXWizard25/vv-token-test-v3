import * as React from 'react';

export interface CheckmarkCircledProps extends React.SVGProps<SVGSVGElement> {
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

const CheckmarkCircled = React.forwardRef<SVGSVGElement, CheckmarkCircledProps>(
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
        <path fill="currentColor" d="m16.3 8.3-5.74 5.73-2.3-2.68-1.52 1.3 3.7 4.32 7.27-7.26z"/><path fill="currentColor" fill-rule="evenodd" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m8-10a8 8 0 1 1-16 0 8 8 0 0 1 16 0" clip-rule="evenodd"/>
      </svg>
    );
  }
);

CheckmarkCircled.displayName = 'CheckmarkCircled';

export { CheckmarkCircled };
export default CheckmarkCircled;
