import * as React from 'react';

export interface WetterProps extends React.SVGProps<SVGSVGElement> {
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

const Wetter = React.forwardRef<SVGSVGElement, WetterProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M12 8a6.4 6.4 0 0 1 6.3 5.62c2.08.2 3.7 2 3.7 4.18 0 2.32-1.83 4.2-4.09 4.2H7.45A5.53 5.53 0 0 1 2 16.4c0-2.85 2.07-5.2 4.75-5.55A6.3 6.3 0 0 1 12 8m0 2a4.3 4.3 0 0 0-3.59 1.96l-.5.75-.9.12A3.55 3.55 0 0 0 4 16.4C4 18.44 5.6 20 7.45 20h10.46c1.1 0 2.09-.93 2.09-2.2 0-1.19-.87-2.09-1.9-2.19l-1.57-.15-.21-1.57A4.4 4.4 0 0 0 12 10" clip-rule="evenodd"/><path fill="currentColor" d="M15.44 2a6.5 6.5 0 0 1 5.36 10.18l-.2-.1a7 7 0 0 0-.78-.31l-.02-.03-.47-.98a4.5 4.5 0 0 0-7.67-4.7 8 8 0 0 0-2.4.45A6.5 6.5 0 0 1 15.43 2"/>
      </svg>
    );
  }
);

Wetter.displayName = 'Wetter';

export { Wetter };
export default Wetter;
