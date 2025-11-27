import * as React from 'react';

export interface SocialGoogleProps extends React.SVGProps<SVGSVGElement> {
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

const SocialGoogle = React.forwardRef<SVGSVGElement, SocialGoogleProps>(
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
        <path fill="currentColor" d="m22.18 10.38-.1-.45H12.3v4.14h5.84c-.6 2.88-3.42 4.4-5.71 4.4a6.8 6.8 0 0 1-4.6-1.84 6.6 6.6 0 0 1-1.96-4.64c0-1.74.78-3.48 1.92-4.63a6.5 6.5 0 0 1 4.57-1.78 6 6 0 0 1 3.89 1.5l2.93-2.91a10.4 10.4 0 0 0-6.92-2.67A10.7 10.7 0 0 0 4.7 4.58c-1.98 1.96-3 4.8-3 7.42s.97 5.32 2.87 7.3c2.04 2.1 4.93 3.2 7.9 3.2a9.8 9.8 0 0 0 7.1-2.98 10.5 10.5 0 0 0 2.73-7.27c0-1.15-.12-1.84-.12-1.87"/>
      </svg>
    );
  }
);

SocialGoogle.displayName = 'SocialGoogle';

export { SocialGoogle };
export default SocialGoogle;
