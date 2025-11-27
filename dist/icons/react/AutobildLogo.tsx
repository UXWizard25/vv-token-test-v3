import * as React from 'react';

export interface AutobildLogoProps extends React.SVGProps<SVGSVGElement> {
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

const AutobildLogo = React.forwardRef<SVGSVGElement, AutobildLogoProps>(
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
        <path fill="currentColor" d="M7.33 18.62v2.2h-.67v-2.2zm0-4v2.2h-.67v-2.19zm10.1 2.18v3.97h-.6V16.8zm.88-12.2-.74 5.96h-.67l.73-5.95z"/><path fill="currentColor" fill-rule="evenodd" d="M20.5 24h-17V12.14h1.02l1.12-3.7h.95l-.47 3.7h1.56l1.36-10.9H6.21l-2.71 9V0h17zM4.86 12.88v9.69h3.67a.6.6 0 0 0 .6-.6v-3.65a.6.6 0 0 0-.6-.6.6.6 0 0 0 .6-.6v-3.65a.6.6 0 0 0-.6-.6zm5.01 2.14v7.55h1.8v-7.55zm2.54-2.14v9.69h1.8v-9.7zm5.03 0V15h-1.89a.6.6 0 0 0-.6.6v6.37c0 .33.27.6.6.6h3.69v-9.7zm-7.57 0v1.8h1.8v-1.8zm-.42-9.85L8.4 11.55a.52.52 0 0 0 .52.6h2.43a.7.7 0 0 0 .68-.6l1.05-8.52h-1.46l-.93 7.53H10l.93-7.53zm4.64-1.8-.22 1.8h-.46l-.2 1.58h.46l-.93 7.53h1.68l.93-7.53h.46l.2-1.58h-.47l.22-1.8zm2.8 1.8a.7.7 0 0 0-.66.6l-.98 7.91a.52.52 0 0 0 .53.6h2.46a.7.7 0 0 0 .67-.6l.98-7.92a.52.52 0 0 0-.53-.6z" clip-rule="evenodd"/><path fill="currentColor" d="M6.9 6.64h-.73l1.18-3.61z"/>
      </svg>
    );
  }
);

AutobildLogo.displayName = 'AutobildLogo';

export { AutobildLogo };
export default AutobildLogo;
