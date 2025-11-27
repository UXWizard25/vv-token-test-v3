import * as React from 'react';

export interface UnlockedProps extends React.SVGProps<SVGSVGElement> {
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

const Unlocked = React.forwardRef<SVGSVGElement, UnlockedProps>(
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
        <path fill="currentColor" d="M11 13h2v5h-2z"/><path fill="currentColor" fill-rule="evenodd" d="M12 4a4 4 0 0 0-4 4v1h12v13H4V9h2V8a6 6 0 0 1 11.92-1h-2.05A4 4 0 0 0 12 4m-6 7v9h12v-9z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Unlocked.displayName = 'Unlocked';

export { Unlocked };
export default Unlocked;
