import * as React from 'react';

export interface DesktopQuestionmarkProps extends React.SVGProps<SVGSVGElement> {
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

const DesktopQuestionmark = React.forwardRef<SVGSVGElement, DesktopQuestionmarkProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M10 8H5.98v7.41h12.04V14H20v3.09L22 22H2l2-4.91V6h6zM4.83 20.12h14.34l-1.15-2.83H5.98z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M17 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10m-.68 6.78v1.32h1.32V8.78zm.66-5.03c-.63 0-1.13.27-1.58.68l.63.87c.15-.16.46-.45.87-.45s.7.28.7.68c0 .5-.38.85-1.12.96l-.04.05.14 1.54h.8l.1-.9c.71-.22 1.31-.71 1.31-1.7 0-1.03-.7-1.73-1.81-1.73" clip-rule="evenodd"/>
      </svg>
    );
  }
);

DesktopQuestionmark.displayName = 'DesktopQuestionmark';

export { DesktopQuestionmark };
export default DesktopQuestionmark;
