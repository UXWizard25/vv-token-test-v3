import * as React from 'react';

export interface ListCheckedProps extends React.SVGProps<SVGSVGElement> {
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

const ListChecked = React.forwardRef<SVGSVGElement, ListCheckedProps>(
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
        <path fill="currentColor" d="M18.5 2h-16v20h16v-9h-2v7h-12V4h12v1h2z"/><path fill="currentColor" d="m20.8 5.3-3.28 3.28-1.31-1.32-1.42 1.41 2.74 2.75L22.2 6.7zM7 11h7v2H7zm0 4h8v2H7zm0-8h6v2H7z"/>
      </svg>
    );
  }
);

ListChecked.displayName = 'ListChecked';

export { ListChecked };
export default ListChecked;
