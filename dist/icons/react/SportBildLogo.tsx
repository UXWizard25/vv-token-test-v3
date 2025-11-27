import * as React from 'react';

export interface SportBildLogoProps extends React.SVGProps<SVGSVGElement> {
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

const SportBildLogo = React.forwardRef<SVGSVGElement, SportBildLogoProps>(
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
        <path fill="currentColor" d="M19.05 19.21c.45 0 .55.59.55 1.13s-.1 1.14-.55 1.14-.55-.6-.55-1.14.1-1.13.55-1.13m-7.09.76q.5 0 .5.57c0 .48-.25.6-.54.6h-.82v-1.17zm-.12-2.14c.3 0 .48.11.48.43 0 .4-.19.52-.48.52h-.73v-.95zM9.5 7.8c.02 0 .3-.07.3.34v4.78l-.01.29q-.01.5-.32.53c-.17.04-.38-.12-.38-.7V8.8c.03-.91.38-.98.4-.98m4.23-1.32c.15-.03.28.07.3.2q.06.18.07.36v5.04c0 .46-.21.64-.36.67s-.35-.07-.35-.35v-5.1c0-.58.07-.77.34-.82"/><path fill="currentColor" fill-rule="evenodd" d="M22 0v24H2V0zm-2.44 16.33v2.22h-.01c-.19-.38-.53-.62-.9-.62-1.1 0-1.39 1.32-1.39 2.39 0 1.15.44 2.43 1.37 2.43.61 0 .8-.32.95-.61v.5h1.22v-6.31zm-9.83 0v6.32h2.56c.8 0 1.58-.67 1.58-1.92 0-.93-.38-1.38-.78-1.58.33-.25.55-.58.55-1.23s-.26-1.58-1.44-1.58zm6.02 0v6.3h1.24v-6.3zm-1.66 1.72v4.58h1.24v-4.58zm0-1.71v1.22h1.24v-1.22zM10.57 5.7c-.5 0-.95.29-1.16.72-.16.33-.3.67-.32.72v-.9l-1.64.4v10.9l1.64-.42V14.7l.17.25c.15.2.42.58 1.03.42s1.15-.79 1.15-2.08V7.17c0-.73-.28-1.46-.87-1.46M5.53 4.67c-1.13 0-2.9 1.05-2.9 3.45 0 1.18.02 1.87.76 2.8L4.53 12h.01c.2.18.9.8.9 1.58 0 .86-.39 1.1-.6 1.15s-.63.06-.63-.85v-1.1l-1.7.45v.55c0 1.06.1 3.6 2.21 3.05 2.15-.55 2.4-2.66 2.4-3.86.03-1.15-.06-1.72-.9-2.6L5.1 9.29c-.63-.64-.83-.95-.83-1.44 0-.51.22-.97.61-1.06s.52.3.52 1.12v.7l1.65-.43v-.89c0-1.51-.38-2.62-1.51-2.62m10.2 2.36c0-2.28-1.28-2.4-1.91-2.3-.78.11-2.08.85-2.08 2.97v4.71c.06 1.67.86 2.43 2.05 2.1 1.15-.31 1.95-.9 1.95-4.38zm3.33-5.24v1.84l-.32.08v-.2a1 1 0 0 0-.66.67l-.43 1.34V4.01l-1.64.43v9.31l1.64-.43V7.64c.02-.6.44-.94.74-1.02l.35-.08V5.4l.32-.08v6.32c0 1.24.72 1.2 1.45 1l.84-.22v-1.74c-.01.01-.62.25-.66-.17V4.9l.66-.18V3.04l-.66.18V1.34z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

SportBildLogo.displayName = 'SportBildLogo';

export { SportBildLogo };
export default SportBildLogo;
