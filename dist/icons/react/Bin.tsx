import * as React from 'react';

export interface BinProps extends React.SVGProps<SVGSVGElement> {
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

const Bin = React.forwardRef<SVGSVGElement, BinProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M7.63 4.01a4 4 0 0 0-.46.99H2v2h2.13l1 15h13.5l.99-15H22V5h-5.17a4 4 0 0 0-.46-.99c-.67-1.04-1.99-2-4.37-2s-3.7.96-4.37 2M14.9 5l-.12-.2c-.36-.56-1.08-1.2-2.79-1.2s-2.43.64-2.79 1.2l-.1.2zm2.7 2H6.14L7 20h9.75z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Bin.displayName = 'Bin';

export { Bin };
export default Bin;
