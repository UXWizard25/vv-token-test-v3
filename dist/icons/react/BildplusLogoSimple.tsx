import * as React from 'react';

export interface BildplusLogoSimpleProps extends React.SVGProps<SVGSVGElement> {
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

const BildplusLogoSimple = React.forwardRef<SVGSVGElement, BildplusLogoSimpleProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-7.8-4.65v3.4h3.43v2.53h-3.44v3.37h-2.57v-3.37H7.18v-2.54h3.44V7.35z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

BildplusLogoSimple.displayName = 'BildplusLogoSimple';

export { BildplusLogoSimple };
export default BildplusLogoSimple;
