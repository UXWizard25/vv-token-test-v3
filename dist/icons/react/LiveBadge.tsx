import * as React from 'react';

export interface LiveBadgeProps extends React.SVGProps<SVGSVGElement> {
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

const LiveBadge = React.forwardRef<SVGSVGElement, LiveBadgeProps>(
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
        <path fill="currentColor" d="M19.9 2h-16v2h16zm0 18h-16v2h16zM1.77 8.7V15h4.8v-1.53H3.51V8.7zm5.6 0V15h1.74V8.7zm4.95 6.35L9.78 8.7h1.94l1.43 3.99L14.6 8.7h1.91l-2.55 6.35zM17.1 8.7V15h5.12v-1.48h-3.39v-1h3.02v-1.38h-3.02v-.96h3.34V8.7z"/>
      </svg>
    );
  }
);

LiveBadge.displayName = 'LiveBadge';

export { LiveBadge };
export default LiveBadge;
