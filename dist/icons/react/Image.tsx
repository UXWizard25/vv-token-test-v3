import * as React from 'react';

export interface ImageProps extends React.SVGProps<SVGSVGElement> {
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

const Image = React.forwardRef<SVGSVGElement, ImageProps>(
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
        <path fill="currentColor" d="M13.73 11.43a1.71 1.71 0 1 0 0-3.43 1.71 1.71 0 0 0 0 3.43"/><path fill="currentColor" fill-rule="evenodd" d="M22 4H2v16h20zM4.93 18H20v-1.4l-2.52-2.4-3.97 3.48-5.28-4.8zM20 13.83l-2.46-2.35-4 3.52-5.71-5.2L4 15.76V6h16z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Image.displayName = 'Image';

export { Image };
export default Image;
