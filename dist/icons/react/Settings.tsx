import * as React from 'react';

export interface SettingsProps extends React.SVGProps<SVGSVGElement> {
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

const Settings = React.forwardRef<SVGSVGElement, SettingsProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M16 11.85c0 2.17-1.79 3.93-4 3.93s-4-1.76-4-3.93 1.79-3.93 4-3.93 4 1.76 4 3.93m-2 0c0 1.04-.86 1.93-2 1.93s-2-.9-2-1.93.86-1.93 2-1.93 2 .9 2 1.93" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M6.5 3h11l4.5 9-4.5 9h-11L2 12zm-2.26 9 3.49-6.97h8.54L19.76 12l-3.49 6.97H7.73z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Settings.displayName = 'Settings';

export { Settings };
export default Settings;
