import * as React from 'react';

export interface NewsTickerProps extends React.SVGProps<SVGSVGElement> {
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

const NewsTicker = React.forwardRef<SVGSVGElement, NewsTickerProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M17 12a5 5 0 1 1 0 10 5 5 0 0 1 0-10m-1 6.03h3.53v-1.05h-2.48V14.5H16z" clip-rule="evenodd"/><path fill="currentColor" d="M22 12.1a7 7 0 0 0-2-1.43V6H4v12h6.07q.15 1.06.6 2H2V4h20z"/><path fill="currentColor" d="M10 15H6V9h4zm8-4.93a7 7 0 0 0-4.6.93H12V9h6z"/>
      </svg>
    );
  }
);

NewsTicker.displayName = 'NewsTicker';

export { NewsTicker };
export default NewsTicker;
