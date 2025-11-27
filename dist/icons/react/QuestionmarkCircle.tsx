import * as React from 'react';

export interface QuestionmarkCircleProps extends React.SVGProps<SVGSVGElement> {
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

const QuestionmarkCircle = React.forwardRef<SVGSVGElement, QuestionmarkCircleProps>(
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
        <path fill="currentColor" d="m10.84 11.2.27 1.94h1.23l.13-.73c1.3-.26 2.36-.89 2.36-2.41v-.02c0-1.6-1.17-2.49-2.9-2.49a3.8 3.8 0 0 0-2.94 1.3l1.1 1.21a2.5 2.5 0 0 1 1.8-.83c.7 0 1.1.31 1.1.85v.03c0 .63-.58 1.03-2.1 1.09zm-.12 2.88V16h1.94v-1.92z"/><path fill="currentColor" fill-rule="evenodd" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16" clip-rule="evenodd"/>
      </svg>
    );
  }
);

QuestionmarkCircle.displayName = 'QuestionmarkCircle';

export { QuestionmarkCircle };
export default QuestionmarkCircle;
