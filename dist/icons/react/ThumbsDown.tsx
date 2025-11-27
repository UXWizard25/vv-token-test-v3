import * as React from 'react';

export interface ThumbsDownProps extends React.SVGProps<SVGSVGElement> {
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

const ThumbsDown = React.forwardRef<SVGSVGElement, ThumbsDownProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M10 22a2.4 2.4 0 0 0 1.48-.46c.4-.3.64-.7.8-1.07.19-.4.3-.85.4-1.23l.02-.07c.38-1.43.99-2.8 1.64-4.12L18 12h4V2H5.13a49 49 0 0 0-1.67 3.16c-.5 1.03-.99 2.2-1.21 3.1-.48 1.89-.23 3.86.15 5.74h5.7a17 17 0 0 0-.6 4.09c0 .68 0 1.57.24 2.29.13.4.37.83.78 1.15q.64.48 1.48.47m6-18H6.59a7 7 0 0 0-1.32 2.02 16 16 0 0 0-1.08 2.72A10 10 0 0 0 4.06 12h7.05l-.73 1.45A14 14 0 0 0 9.5 18c.01.8.02 1.37.15 1.75.06.2.16.25.36.25.26 0 .36-.1.46-.34q.14-.33.3-.98a25 25 0 0 1 1.9-4.73L16 11zm2 0v6h2V4z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

ThumbsDown.displayName = 'ThumbsDown';

export { ThumbsDown };
export default ThumbsDown;
