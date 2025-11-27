import * as React from 'react';

export interface PodcastDeezerProps extends React.SVGProps<SVGSVGElement> {
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

const PodcastDeezer = React.forwardRef<SVGSVGElement, PodcastDeezerProps>(
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
        <path fill="currentColor" d="M18.81 11.53H24V8.5h-5.19zm0-7.25v3.03H24V4.28zm0 11.47H24v-3.03h-5.19zM0 19.95h5.19v-3.03H0zm6.27 0h5.19v-3.03H6.27zm6.27 0h5.2v-3.03h-5.2zm6.27 0H24v-3.03h-5.19zm-6.27-4.22h5.2v-3.02h-5.2zm-6.27 0h5.19v-3.02H6.27zm0-4.21h5.19V8.5H6.27z"/>
      </svg>
    );
  }
);

PodcastDeezer.displayName = 'PodcastDeezer';

export { PodcastDeezer };
export default PodcastDeezer;
