import * as React from 'react';

export interface MarktplatzLogoProps extends React.SVGProps<SVGSVGElement> {
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

const MarktplatzLogo = React.forwardRef<SVGSVGElement, MarktplatzLogoProps>(
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
        <path fill="currentColor" d="M18.02 20.02h-.8v-9.28h.8zm-11.24 0h-.8v-5.53h.8zm0-7.49h-.8V7.98h.8z"/><path fill="currentColor" fill-rule="evenodd" d="M11.67 0c2.45-.11 5.1 1.15 5.95 4H22v20H2V4h4.34C7.07 1.46 9.4.13 11.67.01M9.6 22h1.97V8.79H9.6zm2.83 0h1.97V6h-1.97zm5.6-13.22H16.1a.86.86 0 0 0-.85.87v11.48a.86.86 0 0 0 .86.86L20 22V6h-1.97zM4 22h3.89a.86.86 0 0 0 .86-.87V14.2a.9.9 0 0 0-.91-.9h.08a.8.8 0 0 0 .83-.82v-5.6A.86.86 0 0 0 7.89 6H4zM9.6 7.98h1.97V6H9.6zm2.15-6.33A4.1 4.1 0 0 0 8.08 4h7.8c-.72-1.65-2.4-2.44-4.13-2.35" clip-rule="evenodd"/>
      </svg>
    );
  }
);

MarktplatzLogo.displayName = 'MarktplatzLogo';

export { MarktplatzLogo };
export default MarktplatzLogo;
