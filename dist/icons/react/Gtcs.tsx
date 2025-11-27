import * as React from 'react';

export interface GtcsProps extends React.SVGProps<SVGSVGElement> {
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

const Gtcs = React.forwardRef<SVGSVGElement, GtcsProps>(
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
        <path fill="currentColor" d="M16.1 15.25a3.2 3.2 0 0 1 1.52 2.7c0 2.44-2.01 4.05-5.35 4.05-2.66 0-4.75-1-6.27-2.64l1.88-1.89a6.2 6.2 0 0 0 4.36 1.97c.93 0 2.2-.27 2.2-1.41 0-.8-.78-1.3-3.58-1.95C8.7 15.58 5 14.84 5 11.98c0-1.81 1.25-2.79 2.9-3.23a3.1 3.1 0 0 1-1.49-2.64C6.41 3.2 9.17 2 11.73 2c2.66 0 4.75.97 6.27 2.64l-1.88 1.89a6.2 6.2 0 0 0-4.36-1.97c-1.44 0-2.2.55-2.2 1.36 0 1.44 2.6 1.76 3.58 2 4.2.97 5.86 2.03 5.86 4.05 0 1.77-1.3 2.85-2.9 3.28M13.95 14c1.22 0 2.1-.64 2.1-1.5 0-1.36-2.21-1.75-3.18-2a12 12 0 0 0-2.82-.5c-.95 0-2.1.46-2.1 1.56 0 .8.88 1.36 3.2 1.94 1.36.36 2.18.5 2.8.5"/>
      </svg>
    );
  }
);

Gtcs.displayName = 'Gtcs';

export { Gtcs };
export default Gtcs;
