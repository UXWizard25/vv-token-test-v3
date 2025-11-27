import * as React from 'react';

export interface ShareProps extends React.SVGProps<SVGSVGElement> {
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

const Share = React.forwardRef<SVGSVGElement, ShareProps>(
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
        <path fill="currentColor" d="m12.92 5.5 1.69 1.58L16 5.77 12 2 8 5.77l1.4 1.3 1.55-1.46V15h1.97z"/><path fill="currentColor" fill-rule="evenodd" d="M17 9.85h1v10.3H6V9.85h1V8H4v14h16V8h-3z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Share.displayName = 'Share';

export { Share };
export default Share;
