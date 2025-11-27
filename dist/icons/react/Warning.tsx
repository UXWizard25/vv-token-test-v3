import * as React from 'react';

export interface WarningProps extends React.SVGProps<SVGSVGElement> {
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

const Warning = React.forwardRef<SVGSVGElement, WarningProps>(
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
        <path fill="currentColor" d="m10.93 11.18.6 4.8h.92l.62-4.8v-.4h-2.14zm.1 5.5v1.8h1.93v-1.8z"/><path fill="currentColor" fill-rule="evenodd" d="m2 21.5 10.1-20 9.9 20zm3.25-2 6.83-13.53 6.7 13.53z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Warning.displayName = 'Warning';

export { Warning };
export default Warning;
