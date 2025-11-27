import * as React from 'react';

export interface CameraProps extends React.SVGProps<SVGSVGElement> {
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

const Camera = React.forwardRef<SVGSVGElement, CameraProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M16 7H4v10h12zM2 5v14h16V5z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M22 6.61V17.4l-6-2V8.6zm-4 3.44v3.9l2 .66V9.4zM14 11H5.5V9H14z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Camera.displayName = 'Camera';

export { Camera };
export default Camera;
