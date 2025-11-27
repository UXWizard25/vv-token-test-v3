import * as React from 'react';

export interface ShoppingCartProps extends React.SVGProps<SVGSVGElement> {
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

const ShoppingCart = React.forwardRef<SVGSVGElement, ShoppingCartProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M4.19 5.5H2v-2h3.81l.63 3h15.88l-3.06 10H6.69zm2.67 3 1.45 6h9.43l1.94-6z" clip-rule="evenodd"/><path fill="currentColor" d="M11 18.5H8v2h3zm7 0h-3v2h3z"/>
      </svg>
    );
  }
);

ShoppingCart.displayName = 'ShoppingCart';

export { ShoppingCart };
export default ShoppingCart;
