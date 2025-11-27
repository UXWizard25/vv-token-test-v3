import * as React from 'react';

export interface PodcastGooglepodcastsProps extends React.SVGProps<SVGSVGElement> {
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

const PodcastGooglepodcasts = React.forwardRef<SVGSVGElement, PodcastGooglepodcastsProps>(
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
        <g clip-path="url(#a)"><path fill="currentColor" d="M17.27 10.92c.8 0 1.46.65 1.46 1.46v5.36a1.46 1.46 0 0 1-2.91 0v-5.36c0-.8.65-1.46 1.45-1.46m5.28-1.2c.8 0 1.45.66 1.45 1.46v1.64a1.46 1.46 0 0 1-2.91 0v-1.64c0-.8.65-1.45 1.46-1.45M17.27 4.8c.8 0 1.46.65 1.46 1.46V7.9a1.46 1.46 0 0 1-2.91 0V6.24c0-.8.65-1.45 1.45-1.45M12 19.45c.8 0 1.46.65 1.46 1.45v1.64a1.46 1.46 0 0 1-2.92 0V20.9c0-.8.66-1.45 1.46-1.45m-5.27-4.8c.8 0 1.45.65 1.45 1.45v1.64a1.46 1.46 0 0 1-2.9 0V16.1c0-.8.64-1.45 1.45-1.45M12 6.17c.8 0 1.46.65 1.46 1.45v8.76a1.46 1.46 0 0 1-2.92 0V7.62c0-.8.66-1.45 1.46-1.45M1.46 9.73c.8 0 1.45.65 1.45 1.45v1.64a1.46 1.46 0 0 1-2.9 0v-1.64c0-.8.64-1.45 1.45-1.45M6.73 4.8c.8 0 1.45.65 1.45 1.46v5.36a1.46 1.46 0 0 1-2.9 0V6.26c0-.8.65-1.46 1.45-1.46M12 0c.8 0 1.46.65 1.46 1.46V3.1a1.46 1.46 0 0 1-2.92 0V1.44C10.55.65 11.2 0 12 0"/></g><defs><clipPath id="a"><rect width="24" height="24" fill="currentColor"/></clipPath></defs>
      </svg>
    );
  }
);

PodcastGooglepodcasts.displayName = 'PodcastGooglepodcasts';

export { PodcastGooglepodcasts };
export default PodcastGooglepodcasts;
