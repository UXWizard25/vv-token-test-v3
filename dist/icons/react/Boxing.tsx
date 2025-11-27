import * as React from 'react';

export interface BoxingProps extends React.SVGProps<SVGSVGElement> {
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

const Boxing = React.forwardRef<SVGSVGElement, BoxingProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M9.06 5.87 6.6 10H2v10h17.43l.28-.5c.33-.6.86-1.6 1.35-2.66.48-1.03.94-2.34.94-3.34V13a30 30 0 0 0-.53-4.55 3.66 3.66 0 0 0-3.59-3.04h-.07l-2.2-1.05A4 4 0 0 0 14.03 4h-1.74c-1.31 0-2.53.7-3.23 1.87m4.97.13h-1.74c-.66 0-1.27.35-1.61.94L8 11.4V18h10c.58-.55.95-1.27 1.3-2.02.47-1.02.75-2.26.75-2.98l.01-.75c-.07-.93-.24-2.2-.46-3.42a1.7 1.7 0 0 0-1.72-1.42h-.31L16 9.5h-4v-2h3l.68-.9-.86-.42a2 2 0 0 0-.8-.18M6 18v-6H3.95v6z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Boxing.displayName = 'Boxing';

export { Boxing };
export default Boxing;
