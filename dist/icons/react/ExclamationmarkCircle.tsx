import * as React from 'react';

export interface ExclamationmarkCircleProps extends React.SVGProps<SVGSVGElement> {
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

const ExclamationmarkCircle = React.forwardRef<SVGSVGElement, ExclamationmarkCircleProps>(
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
        <path fill="currentColor" d="m10.88 7.84.56 5.3h1l.57-5.3V7.6h-2.13zm.1 6.24V16h1.94v-1.92z"/><path fill="currentColor" fill-rule="evenodd" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16" clip-rule="evenodd"/>
      </svg>
    );
  }
);

ExclamationmarkCircle.displayName = 'ExclamationmarkCircle';

export { ExclamationmarkCircle };
export default ExclamationmarkCircle;
