import * as React from 'react';

export interface ImageGalleryProps extends React.SVGProps<SVGSVGElement> {
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

const ImageGallery = React.forwardRef<SVGSVGElement, ImageGalleryProps>(
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
        <path fill="currentColor" d="M15.03 15.09 13.1 17l-.97-.96-3.03 3h9.92zm-3.45-1.98a1.48 1.48 0 1 0-1.48-1.48c0 .82.66 1.48 1.48 1.48"/><path fill="currentColor" fill-rule="evenodd" d="M22 6.2H6.13V22H22zm-1.98 1.97H8.12v11.85h11.9z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M16 2H2v15.5h2V4h12z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

ImageGallery.displayName = 'ImageGallery';

export { ImageGallery };
export default ImageGallery;
