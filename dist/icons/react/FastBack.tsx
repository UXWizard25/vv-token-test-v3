import * as React from 'react';

export interface FastBackProps extends React.SVGProps<SVGSVGElement> {
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

const FastBack = React.forwardRef<SVGSVGElement, FastBackProps>(
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
        <path fill="currentColor" d="M4 18H2V6h2z"/><path fill="currentColor" fill-rule="evenodd" d="m13 18-8-6 8-6zm-4.67-6L11 14v-4zM22 18l-8-6 8-6zm-4.67-6L20 14v-4z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

FastBack.displayName = 'FastBack';

export { FastBack };
export default FastBack;
