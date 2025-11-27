import * as React from 'react';

export interface LockedProps extends React.SVGProps<SVGSVGElement> {
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

const Locked = React.forwardRef<SVGSVGElement, LockedProps>(
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
        <path fill="currentColor" d="M11 13h2v5h-2z"/><path fill="currentColor" fill-rule="evenodd" d="M6 9V8a6 6 0 1 1 12 0v1h2v13H4V9zm2-1a4 4 0 1 1 8 0v1H8zm-2 3v9h12v-9z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Locked.displayName = 'Locked';

export { Locked };
export default Locked;
