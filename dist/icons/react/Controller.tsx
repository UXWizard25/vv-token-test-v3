import * as React from 'react';

export interface ControllerProps extends React.SVGProps<SVGSVGElement> {
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

const Controller = React.forwardRef<SVGSVGElement, ControllerProps>(
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
        <path fill="currentColor" d="M15 15h3v-2h-3zm-7.04-2v-2h2v2H12v2H9.96v2h-2v-2H6v-2z"/><path fill="currentColor" fill-rule="evenodd" d="M11 8V4h2v4h9v12H2V8zm9 2H4v8h16z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Controller.displayName = 'Controller';

export { Controller };
export default Controller;
