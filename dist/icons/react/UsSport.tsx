import * as React from 'react';

export interface UsSportProps extends React.SVGProps<SVGSVGElement> {
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

const UsSport = React.forwardRef<SVGSVGElement, UsSportProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="m4.14 4.89.12 1.33.03.26a161 161 0 0 0 .75 6.95c.22 1.01 1.16 2.42 2.58 3.75A13 13 0 0 0 12 19.92a13 13 0 0 0 4.38-2.74c1.42-1.33 2.36-2.73 2.58-3.75.12-.53.3-2.16.48-4.1.1-.94.19-1.93.27-2.85l.03-.26.12-1.33a35 35 0 0 0-15.72 0M2.82 3.16a37 37 0 0 1 18.36 0l.82.22-.08.84-.2 2.19-.03.25-.27 2.87a55 55 0 0 1-.52 4.33c-.35 1.6-1.64 3.36-3.17 4.78a14 14 0 0 1-5.46 3.28L12 22l-.27-.08a14 14 0 0 1-5.46-3.28c-1.53-1.42-2.82-3.18-3.17-4.78-.15-.67-.34-2.46-.52-4.33l-.3-3.12-.2-2.19L2 3.38z" clip-rule="evenodd"/><path fill="currentColor" d="m13.54 13.1 1.28-4.9h1.54l1.28 4.9h-1.4l-.16-.74h-1.01l-.15.75zm1.75-1.8h.56l-.28-1.38zm-3.33 1.88a2.8 2.8 0 0 1-1.78-.6l.57-1.14c.39.32.82.53 1.16.53.24 0 .34-.13.34-.26 0-.17-.15-.26-.52-.42-.84-.37-1.36-.76-1.36-1.58v-.04c0-.92.67-1.54 1.67-1.54.51 0 1.02.11 1.58.53l-.6 1.08c-.24-.17-.6-.4-.96-.4-.2 0-.31.12-.31.25v.01c0 .15.16.25.6.46.72.33 1.27.74 1.27 1.54v.03c0 .93-.68 1.55-1.66 1.55m-3.63.02c-1.03 0-1.76-.53-1.76-1.8V8.2h1.38v3.24c0 .36.16.52.4.52s.4-.15.4-.51V8.21h1.37v3.16c0 1.29-.74 1.83-1.79 1.83"/>
      </svg>
    );
  }
);

UsSport.displayName = 'UsSport';

export { UsSport };
export default UsSport;
