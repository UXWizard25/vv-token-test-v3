import * as React from 'react';

export interface ErotikProps extends React.SVGProps<SVGSVGElement> {
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

const Erotik = React.forwardRef<SVGSVGElement, ErotikProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M21.35 11.2c.31.09.55.36.6.7a.9.9 0 0 1-.37.85l-.34.19c-.79 1.57-3.28 5.8-9.26 5.8s-8.47-4.23-9.26-5.8l-.34-.19a.9.9 0 0 1-.37-.86.8.8 0 0 1 .6-.69c1.05-.28 1.82-1.04 2.68-2.04l.32-.37A10 10 0 0 1 8.3 6.3c.77-.41 1.6-.32 2.26-.1a4.5 4.5 0 0 0 2.84 0l.07-.02c.59-.2 1.37-.32 2.1.04 1.13.55 2 1.6 2.76 2.5l.3.35c.87 1.04 1.67 1.84 2.72 2.12M4.74 13.12a8.2 8.2 0 0 0 7.24 3.96c4.1 0 6.22-2.34 7.25-3.97l-.92-.15-.8-.18-.05-.01-.73-.16q-.75-.16-1.25-.17-.7 0-1.32.33a4 4 0 0 1-2.01.5c-.74 0-1.38-.18-2.03-.5a2.4 2.4 0 0 0-1.3-.33q-.51 0-1.32.17l-.72.15-.98.2q-.52.1-1.06.16m10.74-2.4c.5 0 1.05.1 1.57.21l.75.17h.05l.46.11a17 17 0 0 1-.9-1l-.3-.35c-.8-.94-1.42-1.7-2.21-2.08q-.31-.16-.94.04l-.07.02a6 6 0 0 1-3.82 0q-.67-.21-1.03 0a8 8 0 0 0-2.2 2.06l-.34.4q-.4.48-.88.96l.8-.17.78-.16c.55-.1 1.12-.2 1.61-.2a4 4 0 0 1 2.02.5 3 3 0 0 0 2.64 0c.46-.24 1-.5 2.01-.5" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Erotik.displayName = 'Erotik';

export { Erotik };
export default Erotik;
