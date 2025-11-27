import * as React from 'react';

export interface PodcastAmazonProps extends React.SVGProps<SVGSVGElement> {
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

const PodcastAmazon = React.forwardRef<SVGSVGElement, PodcastAmazonProps>(
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
        <path fill="currentColor" d="M13.56 7.63c-2.29.08-7.95.72-7.95 5.5 0 5.14 6.48 5.35 8.6 2.03.3.48 1.66 1.76 2.13 2.2L19 14.72s-1.52-1.19-1.52-2.48v-6.9c0-1.18-1.14-3.85-5.26-3.85s-6.31 2.59-6.31 4.9l3.44.32c.77-2.32 2.54-2.32 2.54-2.32 1.91 0 1.67 1.4 1.67 3.24m0 4.06c0 3.75-3.95 3.2-3.95.81 0-2.21 2.37-2.66 3.95-2.7zm6.37 7.67c-.36.47-3.28 3.14-8.18 3.14s-8.65-3.35-9.8-4.73c-.31-.37.05-.53.26-.4 3.44 2.1 8.8 5.53 17.46 1.43.35-.18.63.1.26.56m1.87.1c-.3.74-.75 1.26-1 1.46-.26.2-.44.12-.3-.18s.9-2.18.6-2.58-1.74-.2-2.26-.15c-.5.05-.6.1-.65-.02-.11-.26 1.01-.72 1.75-.82.74-.08 1.93-.03 2.16.27.17.24 0 1.27-.3 2.02"/>
      </svg>
    );
  }
);

PodcastAmazon.displayName = 'PodcastAmazon';

export { PodcastAmazon };
export default PodcastAmazon;
