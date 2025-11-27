import * as React from 'react';

export interface BasketballProps extends React.SVGProps<SVGSVGElement> {
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

const Basketball = React.forwardRef<SVGSVGElement, BasketballProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M12.2 22a10 10 0 0 0-.27-20A10 10 0 0 0 5.3 4.52a10 10 0 0 0-3.36 7.4V12q0 1.09.22 2.12a10 10 0 0 0 2.58 4.82q.7.73 1.55 1.31A10 10 0 0 0 11.9 22zm-.27-2q.76 0 1.48-.14c1.2-2.18 1.7-4.6 1.7-6.9a4.6 4.6 0 0 0-2.6 1.55 31 31 0 0 1-4.42 4.51 8 8 0 0 0 3.84.98m-5.1-2.27-.27.2a8 8 0 0 1-2.6-5.17l.7-.35c1.12-.51 2.41-.92 3.76-1.25a38 38 0 0 1 6.48-.95q.07.46.12.93a6.8 6.8 0 0 0-3.89 2.22 28 28 0 0 1-4.3 4.37M8 9.4c-1.38.33-2.75.76-3.97 1.3a8 8 0 0 1 2.4-4.51q.51-.01 1.07.03c1.13.12 2.25.45 3.06.82 1.63.74 2.9.96 3.83.99l.12.4c-1.8.11-4.2.41-6.51.97m3.3-4c-.69-.32-1.55-.6-2.46-.8a8 8 0 0 1 3.23-.6 6 6 0 0 1 1.58 2.15 9 9 0 0 1-2.35-.75m8.63 6.6q0 .63-.1 1.23a5 5 0 0 0-.74-.92 4.6 4.6 0 0 0-2.26-1.16q-.04-.48-.1-.94c.38.03.82.07 1.24.13q.67.1 1.2.25a3 3 0 0 1 .68.27q.08.56.08 1.14m-1.7-4.93a8 8 0 0 1 1.01 1.68 12 12 0 0 0-1.01-.19 19 19 0 0 0-1.87-.17l-.12-.44q.29-.05.59-.14c.46-.14.96-.37 1.4-.74m-3.42-2.54a8 8 0 0 1 2.15 1.25q-.27.2-.65.3a4 4 0 0 1-.67.14 13 13 0 0 0-.83-1.69M15.8 19a8 8 0 0 0 3.03-2.94c-.07-1.26-.51-2-.98-2.44a3 3 0 0 0-.93-.58c-.02 1.95-.35 4-1.12 5.96" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Basketball.displayName = 'Basketball';

export { Basketball };
export default Basketball;
