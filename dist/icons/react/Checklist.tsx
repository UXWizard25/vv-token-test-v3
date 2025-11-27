import * as React from 'react';

export interface ChecklistProps extends React.SVGProps<SVGSVGElement> {
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

const Checklist = React.forwardRef<SVGSVGElement, ChecklistProps>(
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
        <path fill="currentColor" d="M4.03 5.29 7.3 2l1.42 1.41-4.69 4.71L1.3 5.38l1.42-1.41zM7.3 9l-3.27 3.29-1.31-1.33-1.42 1.41 2.73 2.75 4.69-4.71zm0 7-3.27 3.29-1.31-1.33-1.42 1.41 2.73 2.75 4.69-4.71zM22 11.7H9.78v2H22zm-12.23 7H22v2H9.77zM22 4.7H9.77v2H22z"/>
      </svg>
    );
  }
);

Checklist.displayName = 'Checklist';

export { Checklist };
export default Checklist;
