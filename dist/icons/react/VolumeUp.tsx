import * as React from 'react';

export interface VolumeUpProps extends React.SVGProps<SVGSVGElement> {
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

const VolumeUp = React.forwardRef<SVGSVGElement, VolumeUpProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="m13.4 22-5.48-4.6-5.92.04V6.48l5.94-.03L13.4 2zM8.68 8.44l-4.65.04v6.97l4.68-.04 2.65 2.4V6.25z" clip-rule="evenodd"/><path fill="currentColor" d="M15.22 4.99c3.84 0 6.78 3.36 6.78 7.28s-2.94 7.29-6.78 7.29v-2.24c2.4 0 4.52-2.16 4.52-5.05s-2.12-5.04-4.52-5.04z"/><path fill="currentColor" d="M15.22 8.91c1.87 0 3.39 1.5 3.39 3.36s-1.52 3.37-3.39 3.37v-2.25c.62 0 1.13-.5 1.13-1.12 0-.61-.5-1.12-1.13-1.12z"/>
      </svg>
    );
  }
);

VolumeUp.displayName = 'VolumeUp';

export { VolumeUp };
export default VolumeUp;
