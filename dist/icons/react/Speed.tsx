import * as React from 'react';

export interface SpeedProps extends React.SVGProps<SVGSVGElement> {
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

const Speed = React.forwardRef<SVGSVGElement, SpeedProps>(
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
        <path fill="currentColor" d="M4 18a10 10 0 1 1 18-6 10 10 0 0 1-2 6h-2.7a8 8 0 1 0-10.6 0z"/><path fill="currentColor" d="M16.45 8.37A6 6 0 0 0 15 7l-2.74 2.66a2 2 0 0 0-.51-.07 2 2 0 1 0 1.93 1.48zM22 22v-2H2v2z"/>
      </svg>
    );
  }
);

Speed.displayName = 'Speed';

export { Speed };
export default Speed;
