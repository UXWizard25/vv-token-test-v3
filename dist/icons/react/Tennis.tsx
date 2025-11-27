import * as React from 'react';

export interface TennisProps extends React.SVGProps<SVGSVGElement> {
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

const Tennis = React.forwardRef<SVGSVGElement, TennisProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M22 11.66a10 10 0 0 0-.29-2.04 10 10 0 0 0-6.58-7.12A10 10 0 0 0 2 11.67a10 10 0 0 0 5.57 9.3A10 10 0 0 0 22 12zm-2.25-1.67a8 8 0 0 0-3.65-4.86 4 4 0 0 0 3.65 4.86M12 20a8 8 0 0 1-1.48-.14A6 6 0 0 0 4.36 9.61a8 8 0 0 1 9.88-5.3A6 6 0 0 0 20 12a8 8 0 0 1-8 8m-1-5a4 4 0 0 1-3.07 3.89 8 8 0 0 1-3.92-6.54A4 4 0 0 1 11 15" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Tennis.displayName = 'Tennis';

export { Tennis };
export default Tennis;
