import { Component, Prop, State, Watch, h } from '@stencil/core';

const iconCache = new Map<string, string>();

// Type declaration for global icons base path (set by Storybook or other hosts)
declare global {
  interface Window {
    __ICONS_BASE_PATH__?: string;
  }
}

@Component({
  tag: 'ds-icon',
  styleUrl: 'ds-icon.css',
  shadow: true,
})
export class DsIcon {
  /**
   * Name of the icon (without .svg extension).
   */
  @Prop() name!: string;

  /**
   * Base path for icon SVG files.
   * If not set, will check for window.__ICONS_BASE_PATH__ (set by Storybook for GitHub Pages).
   * @default '/icons'
   */
  @Prop() basePath?: string;

  @State() svgContent: string = '';

  connectedCallback() {
    this.loadIcon();
  }

  @Watch('name')
  onNameChange() {
    this.loadIcon();
  }

  /**
   * Get the effective base path for icons.
   * Priority: 1. explicit basePath prop, 2. window.__ICONS_BASE_PATH__, 3. '/icons'
   */
  private getEffectiveBasePath(): string {
    if (this.basePath) {
      return this.basePath;
    }
    if (typeof window !== 'undefined' && window.__ICONS_BASE_PATH__) {
      return window.__ICONS_BASE_PATH__;
    }
    return '/icons';
  }

  private async loadIcon() {
    if (!this.name) return;

    const effectiveBasePath = this.getEffectiveBasePath();
    const url = `${effectiveBasePath}/${this.name}.svg`;
    console.log(`[ds-icon] Loading icon: ${this.name}, URL: ${url}, Full URL: ${new URL(url, window.location.href).href}`);

    if (iconCache.has(url)) {
      this.svgContent = iconCache.get(url)!;
      console.log(`[ds-icon] Found in cache: ${this.name}`);
      return;
    }

    try {
      const response = await fetch(url);
      console.log(`[ds-icon] Fetch response: ${response.status} ${response.statusText} for ${url}`);
      if (response.ok) {
        const svg = await response.text();
        iconCache.set(url, svg);
        this.svgContent = svg;
      } else {
        console.warn(`[ds-icon] Failed to load icon "${this.name}" from ${url}: ${response.status}`);
      }
    } catch (error) {
      console.warn(`[ds-icon] Error loading icon "${this.name}" from ${url}:`, error);
    }
  }

  render() {
    return (
      <span class="ds-icon" innerHTML={this.svgContent}></span>
    );
  }
}
