import * as React from 'react';

export interface VolumeDownProps extends React.SVGProps<SVGSVGElement> {
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

const VolumeDown = React.forwardRef<SVGSVGElement, VolumeDownProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="m13.2 22-5.38-4.6-5.82.04V6.48l5.85-.03L13.2 2zM8.58 8.44 4 8.48v6.97l4.6-.04 2.6 2.4V6.25z" clip-rule="evenodd"/><path fill="currentColor" d="M15 9c1.93 0 3.5 1.5 3.5 3.36s-1.57 3.37-3.5 3.37v-2.25c.64 0 1.17-.5 1.17-1.12s-.53-1.12-1.17-1.12z"/>
      </svg>
    );
  }
);

VolumeDown.displayName = 'VolumeDown';

export { VolumeDown };
export default VolumeDown;
