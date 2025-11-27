import * as React from 'react';

export interface LottoProps extends React.SVGProps<SVGSVGElement> {
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

const Lotto = React.forwardRef<SVGSVGElement, LottoProps>(
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
        <path fill="currentColor" d="M8.68 2a6.7 6.7 0 0 1 6.47 5H13.1a4.74 4.74 0 0 0-9.17 1.68A4.7 4.7 0 0 0 7 13.11v2.04A6.68 6.68 0 0 1 8.68 2m4.69 6h.01zm2.98 6.22v4.18h1.28v-5.47h-.92l-1.13.34.09 1.15zm-2.5 4.18v-4.18l-.68.2-.1-1.15 1.14-.35h.92v5.48z"/><path fill="currentColor" fill-rule="evenodd" d="M15.48 22a6.52 6.52 0 1 0 0-13.03 6.52 6.52 0 0 0 0 13.03m4.58-6.52a4.57 4.57 0 1 1-9.15 0 4.57 4.57 0 0 1 9.15 0" clip-rule="evenodd"/><path fill="currentColor" d="M7.48 11.23 9.05 7h-1.8V5.8h3.14v.88l-1.6 4.56z"/>
      </svg>
    );
  }
);

Lotto.displayName = 'Lotto';

export { Lotto };
export default Lotto;
