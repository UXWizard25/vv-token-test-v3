import * as React from 'react';

export interface HistoryProps extends React.SVGProps<SVGSVGElement> {
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

const History = React.forwardRef<SVGSVGElement, HistoryProps>(
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
        <path fill="currentColor" d="M11.98 20a8.01 8.01 0 1 0 0-16A8 8 0 0 0 5.7 7h2.8v2H2V3h2v2.93A10.01 10.01 0 1 1 2 13h2.02a8 8 0 0 0 7.96 7"/><path fill="currentColor" d="M13.88 7.24v5.24l-4.08 3.3-1.26-1.55 3.34-2.7v-4.3z"/>
      </svg>
    );
  }
);

History.displayName = 'History';

export { History };
export default History;
