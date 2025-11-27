import * as React from 'react';

export interface SocialXingProps extends React.SVGProps<SVGSVGElement> {
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

const SocialXing = React.forwardRef<SVGSVGElement, SocialXingProps>(
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
        <path fill="currentColor" d="M6.28 7.16q-.23 0-.33.15-.09.15.02.35l1.6 2.7v.02L5.05 14.7q-.1.2 0 .36t.3.15h2.38c.36 0 .53-.23.65-.44l2.56-4.4L9.3 7.6c-.12-.2-.3-.44-.66-.44zM16.24 4c-.35 0-.5.22-.63.44l-5.29 9.1 3.38 6.02c.11.2.3.44.66.44h2.37q.21 0 .31-.15.1-.16 0-.35l-3.35-5.95v-.01l5.26-9.04q.1-.19 0-.35T18.64 4z"/>
      </svg>
    );
  }
);

SocialXing.displayName = 'SocialXing';

export { SocialXing };
export default SocialXing;
