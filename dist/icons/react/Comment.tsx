import * as React from 'react';

export interface CommentProps extends React.SVGProps<SVGSVGElement> {
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

const Comment = React.forwardRef<SVGSVGElement, CommentProps>(
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
        <path fill="currentColor" d="M6 9h12V7H6zm12 4H6v-2h12z"/><path fill="currentColor" fill-rule="evenodd" d="M22 3H2v14.08h1.5L4 21l3.93-3.92H22zm-2 1.98V15.1H6.86L5 17.5l.1-2.4H4V4.98z" clip-rule="evenodd"/>
      </svg>
    );
  }
);

Comment.displayName = 'Comment';

export { Comment };
export default Comment;
