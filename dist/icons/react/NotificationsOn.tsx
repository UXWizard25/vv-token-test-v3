import * as React from 'react';

export interface NotificationsOnProps extends React.SVGProps<SVGSVGElement> {
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

const NotificationsOn = React.forwardRef<SVGSVGElement, NotificationsOnProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M18.84 6.7a6.7 6.7 0 0 0-2.18-3.27c-2.45-1.9-6.87-1.9-9.32 0A6.7 6.7 0 0 0 5.16 6.7c-.29.86-.4 1.71-.5 2.56-.1.7-.18 1.4-.37 2.1a4.8 4.8 0 0 1-1.82 2.6l-.47.3V18h20v-3.75l-.47-.3a4.8 4.8 0 0 1-1.82-2.6c-.19-.7-.28-1.4-.37-2.09-.1-.85-.21-1.7-.5-2.56m-11.76.63c.32-.95.8-1.75 1.52-2.32a6.1 6.1 0 0 1 6.8 0c.73.57 1.2 1.37 1.52 2.32.27.82.37 1.65.48 2.48q.1 1.02.35 2.05a7 7 0 0 0 2.22 3.44v.7H4.03v-.7a7 7 0 0 0 2.22-3.44c.19-.69.27-1.37.36-2.05.1-.83.2-1.66.47-2.48" clip-rule="evenodd"/><path fill="currentColor" d="M8.5 22h7v-2h-7z"/>
      </svg>
    );
  }
);

NotificationsOn.displayName = 'NotificationsOn';

export { NotificationsOn };
export default NotificationsOn;
