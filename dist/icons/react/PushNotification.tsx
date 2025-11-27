import * as React from 'react';

export interface PushNotificationProps extends React.SVGProps<SVGSVGElement> {
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

const PushNotification = React.forwardRef<SVGSVGElement, PushNotificationProps>(
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
        <path fill="currentColor" d="M10 9.19H3.98v10.84h12.04L16 14h1.98l.02 8H2V7.22h8z"/><path fill="currentColor" fill-rule="evenodd" d="M17 2c2.76 0 5 2.23 5 4.97a4.99 4.99 0 0 1-10 0A5 5 0 0 1 17 2m-1.4 2.2.1 1.32.79-.22v4.8h1.49V3.8H16.9z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

PushNotification.displayName = 'PushNotification';

export { PushNotification };
export default PushNotification;
