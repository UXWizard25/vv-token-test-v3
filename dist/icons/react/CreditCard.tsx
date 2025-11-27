import * as React from 'react';

export interface CreditCardProps extends React.SVGProps<SVGSVGElement> {
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

const CreditCard = React.forwardRef<SVGSVGElement, CreditCardProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M14 15H6v-2h8zm4 0h-2v-2h2z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M2 5h20v14H2zm2 2h16v2H4zm0 4v6h16v-6z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

CreditCard.displayName = 'CreditCard';

export { CreditCard };
export default CreditCard;
