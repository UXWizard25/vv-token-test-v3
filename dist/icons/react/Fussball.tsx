import * as React from 'react';

export interface FussballProps extends React.SVGProps<SVGSVGElement> {
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

const Fussball = React.forwardRef<SVGSVGElement, FussballProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M15.33 12.58 12 15l-3.33-2.42 1.27-3.91h4.12zm-4.3-.76.97.7.98-.7-.38-1.15h-1.2z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M12 2c1.6 0 3.11.38 4.45 1.05l.1.05q.22.1.43.23l.07.04.7.46.12.07.21.16.1.08a10 10 0 0 1 2.06 2.2 10 10 0 0 1 1.6 7.47 10 10 0 0 1-.34 1.3l-.06.17-.1.3-.1.23-.22.5-.04.1-.13.25-.09.16-.44.72a10 10 0 0 1-7.07 4.38l-.13.02-.2.02-.37.02h-.1q-.22.02-.45.02l-.45-.01h-.1l-.4-.04-.17-.01-.56-.08-.06-.02a10 10 0 0 1-6.76-4.58l-.09-.13-.18-.31-.06-.13-.06-.1-.12-.26-.02-.04-.35-.81-.06-.18-.07-.2a10 10 0 0 1-.26-.97l-.04-.2-.06-.33-.02-.14A10 10 0 0 1 2 12a10 10 0 0 1 2.71-6.84l.1-.11q.17-.18.35-.34l.06-.06.16-.15.43-.35.15-.12.35-.25.14-.1.3-.19.2-.12.16-.1.17-.09.3-.15A10 10 0 0 1 12 2m-.98 17.18.26.79q.35.03.72.03t.72-.03l.26-.79-.98-.7zM12 4q-1.41 0-2.68.46l.6.5-1.51 3.83-3.64-.23A8 8 0 0 0 4 11.84l.8-.5 3.17 2.62-1.5 3.81a8 8 0 0 0 2.52 1.64l-.32-1L12 16l3.33 2.42-.32 1a8 8 0 0 0 2.5-1.62l-1.62-3.73 3.08-2.72 1.03.6a8 8 0 0 0-.78-3.39l-3.57.23-1.5-3.83.58-.48A8 8 0 0 0 12 4m6.3 10.6.48 1.12.32-.03q.39-.75.62-1.58l-.51-.3zm-14.03-.55q.23.86.63 1.64h.23l.45-1.11-.93-.78zm3.12-8.59q-.72.52-1.33 1.18l1.02.06.44-1.13zm9.15.11.44 1.13.96-.06a8 8 0 0 0-1.3-1.15z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Fussball.displayName = 'Fussball';

export { Fussball };
export default Fussball;
