import * as React from 'react';

export interface BundesligaLogoProps extends React.SVGProps<SVGSVGElement> {
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

const BundesligaLogo = React.forwardRef<SVGSVGElement, BundesligaLogoProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M0 3h24v18H0zm19.65 9.6q.12-.06.12-.11c-.04-.24-.29-.2-.41-.16-.21 0-.42 0-.75-.04-.2-.04-.46-.04-.83-.11l-.66-.16c-.57-.13-1.1-.35-1.63-.57q-.66-.3-1.4-.52l-.08.08c-.2-.1-.48-.1-.7-.1q-.16 0-.25-.02c-.83-.35-1.83-.46-1.83-.46l-.04-.2s-2.4-.3-2.94-.35c.16-1 .66-2.02.91-2.53l.66.04.13-.27.2-.35.13-.11.08-.08q.02-.05 0-.19a1 1 0 0 1 0-.51q.03-.12.08-.2.07-.13.05-.27c-.13-.47-.83-.9-1.33-.9-.95 0-1.24.75-1.2 1.33-1.04-.31-3.2-.08-3.2-.08l-.04.2s-.33-.04-.5.11a40 40 0 0 0-1.7 1.95q-.35 0-.53.3c-.17.16-.33.24-.58.32-.13.04-.08.2 0 .2.14.03.32-.06.48-.13l.06-.03c-.09.13-.27.24-.4.33l-.14.1q-.06 0 0 .07c.12.2.66.08.91-.08.2-.11.37-.27.37-.27s.09-.35.17-.39c.36-.27.95-.75 1.54-1.23l.24-.2 1.31.09.35.02-.62.23c-.37.7-.79 3.11-.66 3.39 0 0 .12-.08.16-.08-.08.3 0 1.2 0 1.2.08.86.37 1.95.5 2.18l.2.04c.05.31.38 1.09.54 1.44-.61.03-1.44.77-2.15 1.4l-.17.15c-.45.4-.95.16-1.07.08a.4.4 0 0 0-.42 0l-.04.04h-.04l-.04.04-.04.08q-.07.07 0 .08h.04q-.08.05-.09.11h-.04q-.07-.04-.08.04l.04.08q-.06.07 0 .08-.1.21-.27.37-.16.13-.27.37h-.04c-.04-.04-.08 0-.08.03l-.04.08q-.07.07 0 .08h.04l-.02.12-.02.11h-.05s-.04.04-.04.08v.12q.01.04.05.04h.04v.27c0 .2.33.27.41.11.54-.98 1.86-1.42 3.26-1.89q.99-.3 1.92-.71l-.04-.12.41-.2q.21-.12.3-.19c.08-.04.2-.11.24-.23.09-.15.09-.27.09-.35 0-.2-.04-.5-.04-.78l-.04-.46-.05-.47.17-.04-.17-1.32-.5-.23h3.24l.04-.16c.48.02.78.02 1.06.02s.56 0 .97.02c.21 0 .36.09.5.18q.17.12.37.17c.5.11.87.1 1.29.08a8 8 0 0 1 1.82.11s.08 0 .12.08l.05.23q0 .15.04.24c.12.23.29.23.45.15l.04.04h.09l.08-.04q.05-.03.04-.07l-.04-.04.12-.04.05.04h.08l.08-.04.04-.04v-.08l.45-.19q.3-.1.55-.24v.04h.08l.08-.04.04-.04v-.07l.09-.04v.04h.08l.08-.04.04-.04v-.08zm.37-1.94c0-.7.58-1.25 1.33-1.25.7 0 1.32.55 1.32 1.25s-.58 1.24-1.32 1.24-1.33-.54-1.33-1.24" clip-rule="evenodd"/>
      </svg>
    );
  }
);

BundesligaLogo.displayName = 'BundesligaLogo';

export { BundesligaLogo };
export default BundesligaLogo;
