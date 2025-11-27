import * as React from 'react';

export interface HideProps extends React.SVGProps<SVGSVGElement> {
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

const Hide = React.forwardRef<SVGSVGElement, HideProps>(
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
        <path fill="currentColor" fill-rule="evenodd" d="M7.37 5.97A11 11 0 0 1 12 5c6.16 0 9.2 4.4 9.95 6.68l.1.32-.1.32a10 10 0 0 1-3.6 4.7l3.56 3.57L20.5 22 2 3.41 3.42 2zM12 7c-1.17 0-2.2.2-3.1.51l1.6 1.61a3 3 0 0 1 1.5-.39A3.2 3.2 0 0 1 15.16 12q0 .8-.33 1.47l2.1 2.1a8.3 8.3 0 0 0 3-3.57A8.4 8.4 0 0 0 12 7" clip-rule="evenodd"/><path fill="currentColor" d="M5.51 9.77A8 8 0 0 0 4.07 12c.74 1.81 3.18 5 7.93 5q.36 0 .71-.03l1.77 1.77q-1.14.25-2.48.26c-6.16 0-9.19-4.4-9.95-6.68l-.1-.32.1-.32c.3-.9.97-2.15 2.05-3.32z"/>
      </svg>
    );
  }
);

Hide.displayName = 'Hide';

export { Hide };
export default Hide;
