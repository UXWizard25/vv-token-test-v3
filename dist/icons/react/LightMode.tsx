import * as React from 'react';

export interface LightModeProps extends React.SVGProps<SVGSVGElement> {
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

const LightMode = React.forwardRef<SVGSVGElement, LightModeProps>(
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
        <path fill="currentColor" d="M11 5V2h2v3z"/><path fill="currentColor" fill-rule="evenodd" d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10m0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6" clip-rule="evenodd"/><path fill="currentColor" d="M22 11h-3v2h3zm-9 8v3h-2v-3zM2 13h3v-2H2zm4.41-5.17L4.3 5.7l1.42-1.42L7.84 6.4zm9.88 9.88 2.12 2.12 1.42-1.42-2.12-2.12zm3.54-12L17.7 7.83 16.29 6.4l2.12-2.12zM5.7 19.83l2.12-2.12-1.42-1.42-2.12 2.12z"/>
      </svg>
    );
  }
);

LightMode.displayName = 'LightMode';

export { LightMode };
export default LightMode;
