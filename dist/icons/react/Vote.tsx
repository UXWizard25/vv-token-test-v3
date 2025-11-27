import * as React from 'react';

export interface VoteProps extends React.SVGProps<SVGSVGElement> {
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

const Vote = React.forwardRef<SVGSVGElement, VoteProps>(
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
        <path fill="currentColor" d="M16.26 6.28 12.59 2 8.05 6.1l1.33 1.48 3.03-2.72 2.33 2.72z"/><path fill="currentColor" fill-rule="evenodd" d="M2 15V9h20v6h-2v7H4v-7zm4 0h12v5H6zm14-4v2H4v-2z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Vote.displayName = 'Vote';

export { Vote };
export default Vote;
