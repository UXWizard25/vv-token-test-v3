import { Component, Prop, State, Watch, h } from '@stencil/core';

const iconCache = new Map<string, string>();

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
   */
  @Prop() basePath: string = '/icons';

  @State() svgContent: string = '';

  connectedCallback() {
    this.loadIcon();
  }

  @Watch('name')
  onNameChange() {
    this.loadIcon();
  }

  private async loadIcon() {
    if (!this.name) return;

    const url = `${this.basePath}/${this.name}.svg`;

    if (iconCache.has(url)) {
      this.svgContent = iconCache.get(url)!;
      return;
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        const svg = await response.text();
        iconCache.set(url, svg);
        this.svgContent = svg;
      }
    } catch {
      // Silent fail
    }
  }

  render() {
    return (
      <span class="ds-icon" innerHTML={this.svgContent}></span>
    );
  }
}
