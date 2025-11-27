import * as React from 'react';

export interface SportLiveProps extends React.SVGProps<SVGSVGElement> {
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

const SportLive = React.forwardRef<SVGSVGElement, SportLiveProps>(
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
        <path fill="currentColor" d="M7.59 17h1.95V9H8.1L6 9.66l.38 1.7 1.2-.32zm3.25-3.93h2.02v-2.21h-2.02zm0 3.93h2.02v-2.21h-2.02zM17 17h-1.96v-5.96l-1.2.32-.38-1.7 2.1-.66H17z"/><path fill="currentColor" fill-rule="evenodd" d="M5 3h2v2h10V3h2v2h3v16H2V5h3zm15 4v12H4V7z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

SportLive.displayName = 'SportLive';

export { SportLive };
export default SportLive;
