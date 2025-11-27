import * as React from 'react';

export interface CardsProps extends React.SVGProps<SVGSVGElement> {
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

const Cards = React.forwardRef<SVGSVGElement, CardsProps>(
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
        <path fill="currentColor" d="M3.5 2h12v2h-10v14h-2zm8.25 12.01L14.06 11l2.3 3.01-2.3 3.02z"/><path fill="currentColor" fill-rule="evenodd" d="M7.5 22V6h13v16zm2-14h9v12h-9z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Cards.displayName = 'Cards';

export { Cards };
export default Cards;
