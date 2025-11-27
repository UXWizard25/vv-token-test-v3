import * as React from 'react';

export interface WrestlingProps extends React.SVGProps<SVGSVGElement> {
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

const Wrestling = React.forwardRef<SVGSVGElement, WrestlingProps>(
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
        <path fill="currentColor" d="M13.14 10.14 12.1 7.5l-1.04 2.64-2.71.22 2.06 1.86L9.78 15l2.32-1.49L14.42 15l-.63-2.78 2.06-1.86z"/><path fill="currentColor" fill-rule="evenodd" d="M8 2h8c.17.5.5 1.5 1 2 .47.47 1.6.7 2.37.85q.42.08.63.15v3h2v8h-2c-.67.83-2.3 2.7-3.5 3.5S13 21.5 12 22c-1-.5-3.3-1.7-4.5-2.5S4.67 16.83 4 16H2V8h2V5l.55-.1c.8-.1 1.82-.26 2.45-.9.5-.5.83-1.5 1-2m.41 3.41c.45-.44.76-.99.96-1.41h5.26a4 4 0 0 0 2.28 2.25q.57.23 1.09.35v8.68q-.43.51-1 1.1c-.62.65-1.2 1.18-1.6 1.46-.83.55-2.3 1.34-3.4 1.91a44 44 0 0 1-3.39-1.91c-.41-.28-1-.81-1.62-1.46a27 27 0 0 1-.99-1.1v-8.6A5 5 0 0 0 8.41 5.4" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Wrestling.displayName = 'Wrestling';

export { Wrestling };
export default Wrestling;
