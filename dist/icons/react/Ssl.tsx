import * as React from 'react';

export interface SslProps extends React.SVGProps<SVGSVGElement> {
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

const Ssl = React.forwardRef<SVGSVGElement, SslProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M8.45 7.4A3.56 3.56 0 0 1 12 4a3.56 3.56 0 0 1 3.56 3.4zm-1.98 0a5.55 5.55 0 0 1 11.07 0H22V22H2V7.4zM3.97 20h16.04V9.4H3.98z" clip-rule="evenodd"/><path fill="currentColor" d="M14.72 17.72v-6.26h1.47v4.9H18v1.36zm-2.5.08a3 3 0 0 1-2.1-.8l.72-1.2c.39.34.86.67 1.34.67.37 0 .56-.22.56-.5 0-.23-.17-.4-.75-.72-1-.52-1.62-1-1.62-1.98 0-1.14.89-1.9 2-1.9.6 0 1.25.18 1.86.7l-.75 1.16c-.27-.23-.67-.52-1.12-.52-.3 0-.51.18-.51.42 0 .42.6.66.9.82.9.49 1.47 1 1.47 1.92v.04c0 1.12-.86 1.9-2 1.9m-4.12 0A3 3 0 0 1 6 17l.72-1.2c.39.34.86.67 1.34.67.37 0 .56-.22.56-.5 0-.23-.17-.4-.75-.72-1-.52-1.62-1-1.62-1.97 0-1.15.89-1.9 2-1.9.6 0 1.25.17 1.86.7l-.75 1.15c-.27-.23-.67-.52-1.12-.52-.26 0-.51.15-.51.43 0 .25.18.42.9.82.9.48 1.47.99 1.47 1.91v.04c0 1.12-.85 1.9-2 1.9"/>
      </svg>
    );
  }
);

Ssl.displayName = 'Ssl';

export { Ssl };
export default Ssl;
