import * as React from 'react';

export interface HandballProps extends React.SVGProps<SVGSVGElement> {
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

const Handball = React.forwardRef<SVGSVGElement, HandballProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m6.4-5.2a8 8 0 0 0 1.36-2.86l-1.82-1.04L16 14.07v1.35zm-1.44 1.47-1.52-.86L13 19.04v.9a8 8 0 0 0 3.96-1.67M16 5.07a8 8 0 0 1 2.06 1.7l-.87.7L16 6.52zm2.5 3.91.67-.53q.77 1.52.83 3.33l-1.5-.86zM5.75 16.99a8 8 0 0 1-1.51-3.04l1.82-1.05L8 14.07v1.64zM11 19.94a8 8 0 0 1-3.75-1.5l1.54-.88L11 19.04zm-5.5-9.02-1.5.86a8 8 0 0 1 .83-3.33l.67.53zm1.31-3.45-.87-.7A8 8 0 0 1 8 5.07v1.45zM12 4q1.04 0 2 .25v1.28L12 7.2l-2-1.67V4.25A8 8 0 0 1 12 4m1 4.97v2l2.03 1.35 1.47-.89V9.48L14.4 7.8zM9.6 7.8 7.5 9.48v1.95l1.47.89L11 10.96v-2zm.4 6.23v1.93l2 1.34 2-1.34v-1.93l-2-1.33z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Handball.displayName = 'Handball';

export { Handball };
export default Handball;
