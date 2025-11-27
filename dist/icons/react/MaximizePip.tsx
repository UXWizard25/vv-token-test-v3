import * as React from 'react';

export interface MaximizePipProps extends React.SVGProps<SVGSVGElement> {
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

const MaximizePip = React.forwardRef<SVGSVGElement, MaximizePipProps>(
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
        <path fill="currentColor" d="M2 2v17h2V4h16v15h2V2z"/><path fill="currentColor" d="M6 6h6v2H9.41l3.3 3.3-1.42 1.4L8 9.42V12H6z"/><path fill="currentColor" fill-rule="evenodd" d="M6 16v6h12v-6zm10 2H8v2h8z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

MaximizePip.displayName = 'MaximizePip';

export { MaximizePip };
export default MaximizePip;
