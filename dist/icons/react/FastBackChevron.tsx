import * as React from 'react';

export interface FastBackChevronProps extends React.SVGProps<SVGSVGElement> {
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

const FastBackChevron = React.forwardRef<SVGSVGElement, FastBackChevronProps>(
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
        <path fill="currentColor" d="m9.53 12 4.79 4.8-1.41 1.41-6.21-6.2 6.2-6.21 1.42 1.41z"/><path fill="currentColor" d="m15.03 12 4.79 4.8-1.41 1.41-6.21-6.2 6.2-6.21 1.42 1.41zM4 6h2v12H4z"/>
      </svg>
    );
  }
);

FastBackChevron.displayName = 'FastBackChevron';

export { FastBackChevron };
export default FastBackChevron;
