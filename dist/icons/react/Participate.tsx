import * as React from 'react';

export interface ParticipateProps extends React.SVGProps<SVGSVGElement> {
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

const Participate = React.forwardRef<SVGSVGElement, ParticipateProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M21.97 6.24 17.72 2 6 13.61V18l4.36-.15zM8 15.91v-1.5l9.72-9.58 1.42 1.41-9.64 9.67z" clip-rule="evenodd"/><path fill="currentColor" d="M13 2.1H2v20h20V10.91h-2v9.17H4v-16h9z"/>
      </svg>
    );
  }
);

Participate.displayName = 'Participate';

export { Participate };
export default Participate;
