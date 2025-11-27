import * as React from 'react';

export interface ThumbsUpProps extends React.SVGProps<SVGSVGElement> {
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

const ThumbsUp = React.forwardRef<SVGSVGElement, ThumbsUpProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M14 2a2.4 2.4 0 0 0-1.47.46c-.41.3-.65.7-.82 1.07-.18.4-.3.85-.4 1.23l-.01.07c-.38 1.43-.99 2.8-1.64 4.12L6 12H2v10h16.87a49 49 0 0 0 1.67-3.16c.5-1.03.99-2.2 1.22-3.1.47-1.89.22-3.86-.16-5.74h-5.7a17 17 0 0 0 .6-4.09c0-.68 0-1.57-.24-2.29-.13-.4-.37-.83-.78-1.15A2.4 2.4 0 0 0 14 2M8 20h9.41c.59-.55.97-1.27 1.32-2.02.5-1.02.91-2.03 1.09-2.72a10 10 0 0 0 .1-3.26h-7.04l.73-1.45A14 14 0 0 0 14.5 6a7 7 0 0 0-.15-1.75C14.3 4.05 14.2 4 14 4c-.26 0-.36.1-.46.34q-.14.33-.3.98a25 25 0 0 1-1.9 4.73L8 13zm-2 0v-6H4v6z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

ThumbsUp.displayName = 'ThumbsUp';

export { ThumbsUp };
export default ThumbsUp;
