import * as React from 'react';

export interface InformationProps extends React.SVGProps<SVGSVGElement> {
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

const Information = React.forwardRef<SVGSVGElement, InformationProps>(
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
        <path fill="currentColor" d="M13 9v8h-2V9zm0-1V6h-2v2z"/><path fill="currentColor" fill-rule="evenodd" d="M2 12a10 10 0 1 1 19.99-.01A10 10 0 0 1 2 12m2 0a8 8 0 1 0 16 0 8 8 0 0 0-16 0" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Information.displayName = 'Information';

export { Information };
export default Information;
