import * as React from 'react';

export interface UnquoteProps extends React.SVGProps<SVGSVGElement> {
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

const Unquote = React.forwardRef<SVGSVGElement, UnquoteProps>(
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
        <path fill="currentColor" d="M4 13c0-4.5 2.15-6.61 6.57-7L11 8.1c-3.03.5-4 2.06-4 3.9h3v6H4zm9 0c0-4.5 2.15-6.61 6.57-7L20 8.1c-3.03.5-4 2.07-4 3.9h3v6h-6z"/>
      </svg>
    );
  }
);

Unquote.displayName = 'Unquote';

export { Unquote };
export default Unquote;
