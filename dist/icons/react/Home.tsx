import * as React from 'react';

export interface HomeProps extends React.SVGProps<SVGSVGElement> {
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

const Home = React.forwardRef<SVGSVGElement, HomeProps>(
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
        <path fill="currentColor" d="M14 14h-4v4h4z"/><path fill="currentColor" fill-rule="evenodd" d="M19.94 22v-9.16l.65.66L22 12.09 12 2 2 12.09l1.4 1.41.65-.65V22zM12 4.84l5.95 6V20H6.05v-9.14z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Home.displayName = 'Home';

export { Home };
export default Home;
