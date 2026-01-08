import { Component, Prop, State, Watch, Element, h } from '@stencil/core';

/**
 * Icon cache shared between all ds-icon instances.
 * Prevents duplicate fetch requests for the same icon.
 */
const iconCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

@Component({
  tag: 'ds-icon',
  styleUrl: 'ds-icon.css',
  shadow: true,
})
export class DsIcon {
  @Element() el!: HTMLElement;

  /**
   * Name of the icon to display (without .svg extension).
   * Must match a file in the icons directory.
   * @example "add", "arrow-left", "close"
   */
  @Prop() name!: string;

  /**
   * Size of the icon in pixels.
   * @default 24
   */
  @Prop() size: number = 24;

  /**
   * Color of the icon. Accepts any valid CSS color value.
   * Icons use currentColor by default, inheriting from parent.
   * @default 'currentColor'
   */
  @Prop() color: string = 'currentColor';

  /**
   * Base path for loading icon SVG files.
   * @default '/icons'
   */
  @Prop() basePath: string = '/icons';

  /**
   * Enable lazy loading with IntersectionObserver.
   * Icon will only load when visible in viewport.
   * @default false
   */
  @Prop() lazy: boolean = false;

  /**
   * Accessible label for screen readers.
   * If provided, icon is treated as semantic (not decorative).
   */
  @Prop() label?: string;

  /**
   * Internal state for the loaded SVG content.
   */
  @State() svgContent: string = '';

  /**
   * Internal state for loading status.
   */
  @State() isLoading: boolean = false;

  /**
   * Internal state for error status.
   */
  @State() hasError: boolean = false;

  private observer?: IntersectionObserver;
  private isVisible: boolean = false;

  connectedCallback() {
    if (this.lazy) {
      this.setupIntersectionObserver();
    } else {
      this.loadIcon();
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  @Watch('name')
  onNameChange() {
    if (!this.lazy || this.isVisible) {
      this.loadIcon();
    }
  }

  @Watch('basePath')
  onBasePathChange() {
    if (!this.lazy || this.isVisible) {
      this.loadIcon();
    }
  }

  private setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for browsers without IntersectionObserver
      this.loadIcon();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.loadIcon();
            this.observer?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Load slightly before entering viewport
      }
    );

    this.observer.observe(this.el);
  }

  private async loadIcon() {
    if (!this.name) {
      this.hasError = true;
      return;
    }

    const iconUrl = `${this.basePath}/${this.name}.svg`;

    // Check cache first
    if (iconCache.has(iconUrl)) {
      this.svgContent = iconCache.get(iconUrl)!;
      this.hasError = false;
      return;
    }

    // Check for pending request (prevent duplicate fetches)
    if (pendingRequests.has(iconUrl)) {
      try {
        this.svgContent = await pendingRequests.get(iconUrl)!;
        this.hasError = false;
      } catch {
        this.hasError = true;
      }
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    // Create fetch promise and store it
    const fetchPromise = this.fetchIcon(iconUrl);
    pendingRequests.set(iconUrl, fetchPromise);

    try {
      this.svgContent = await fetchPromise;
      iconCache.set(iconUrl, this.svgContent);
      this.hasError = false;
    } catch {
      this.hasError = true;
      this.svgContent = '';
    } finally {
      this.isLoading = false;
      pendingRequests.delete(iconUrl);
    }
  }

  private async fetchIcon(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load icon: ${url}`);
    }

    const svgText = await response.text();

    // Basic security check - ensure it's valid SVG
    if (!svgText.includes('<svg')) {
      throw new Error(`Invalid SVG content: ${url}`);
    }

    return svgText;
  }

  render() {
    const isDecorative = !this.label;

    return (
      <span
        class={{
          'ds-icon': true,
          'ds-icon--loading': this.isLoading,
          'ds-icon--error': this.hasError,
        }}
        style={{
          '--icon-size': `${this.size}px`,
          '--icon-color': this.color,
        }}
        role={isDecorative ? 'presentation' : 'img'}
        aria-hidden={isDecorative ? 'true' : undefined}
        aria-label={this.label}
      >
        {this.svgContent ? (
          <span class="ds-icon__svg" innerHTML={this.svgContent}></span>
        ) : this.hasError ? (
          <span class="ds-icon__error" title={`Icon "${this.name}" not found`}>
            {/* Error placeholder - simple X */}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </span>
        ) : null}
      </span>
    );
  }
}
