import * as React from 'react';

export interface VideoErrorProps extends React.SVGProps<SVGSVGElement> {
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

const VideoError = React.forwardRef<SVGSVGElement, VideoErrorProps>(
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
        <path fill="currentColor" d="m10.81 9.24.65 4.25h1.09l.64-4.26V8.3H10.8zm.11 4.89V16h2.17v-1.87z"/><path fill="currentColor" fill-rule="evenodd" d="M2 4v16h20V4zm2 1.88h16v12.25H4z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

VideoError.displayName = 'VideoError';

export { VideoError };
export default VideoError;
