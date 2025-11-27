import * as React from 'react';

export interface HeyLogoProps extends React.SVGProps<SVGSVGElement> {
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

const HeyLogo = React.forwardRef<SVGSVGElement, HeyLogoProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M2.02 5A2 2 0 0 0 0 7.02v8.76c0 1.12.9 2.02 2.02 2.02H24V7.02C24 5.91 23.01 5 21.9 5zm1 3.75v5.4h1.8v-1.94h1.66v1.94h1.8v-5.4h-1.8v1.9H4.81v-1.9zm5.7 3.32c0 1.3.93 2.18 2.31 2.18.92 0 1.51-.38 1.93-.92l-.94-.75q-.4.44-.86.44a.8.8 0 0 1-.8-.57h2.71l.01-.3c0-1.27-.7-2.31-2.2-2.31-1.26 0-2.16.95-2.16 2.21zm2.76-.39h-1.14c.05-.38.26-.63.56-.63s.54.23.58.63m4.1.48.67-2.22h1.78l-1.46 3.92c-.4 1.1-.86 1.55-1.83 1.55-.6 0-1.16-.18-1.63-.44l.51-1.2c.32.18.61.28.77.28q.15 0 .29-.06l-1.65-4.05h1.81zm5.64 1.21h-3.6v1.55h3.6z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

HeyLogo.displayName = 'HeyLogo';

export { HeyLogo };
export default HeyLogo;
