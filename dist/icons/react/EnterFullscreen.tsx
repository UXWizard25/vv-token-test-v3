import * as React from 'react';

export interface EnterFullscreenProps extends React.SVGProps<SVGSVGElement> {
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

const EnterFullscreen = React.forwardRef<SVGSVGElement, EnterFullscreenProps>(
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
        <path fill="currentColor" d="M10 4H4v6h2V6h4zm4 0h6v6h-2V6h-4zm6 16h-6v-2h4v-4h2zm-10 0H4v-6h2v4h4z"/>
      </svg>
    );
  }
);

EnterFullscreen.displayName = 'EnterFullscreen';

export { EnterFullscreen };
export default EnterFullscreen;
