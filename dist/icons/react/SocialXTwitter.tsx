import * as React from 'react';

export interface SocialXTwitterProps extends React.SVGProps<SVGSVGElement> {
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

const SocialXTwitter = React.forwardRef<SVGSVGElement, SocialXTwitterProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M13.5 8.92 19.58 2h2.56l-7.5 8.54L22.67 22h-6.54L11 14.68 4.56 22H2l7.86-8.94L2.09 2h6.55zm3.77 11.24h1.84L7.49 3.9H5.65z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

SocialXTwitter.displayName = 'SocialXTwitter';

export { SocialXTwitter };
export default SocialXTwitter;
