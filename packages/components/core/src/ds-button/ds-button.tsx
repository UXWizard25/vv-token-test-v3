import { Component, Prop, h } from '@stencil/core';

/**
 * Button variants matching the design system specification.
 * - Primary variants: Filled background (brand, neutral, success)
 * - Secondary: Neutral filled background
 * - Tertiary variants: Outlined style (neutral, success)
 * - Ghost: Text only, no background/border
 */
export type ButtonVariant =
  | 'primary-brand'
  | 'primary-neutral'
  | 'primary-success'
  | 'secondary'
  | 'tertiary-neutral'
  | 'tertiary-success'
  | 'ghost';

@Component({
  tag: 'ds-button',
  styleUrl: 'ds-button.css',
  shadow: true,
})
export class DsButton {
  /**
   * Button variant determining visual style.
   * @default 'primary-brand'
   */
  @Prop() variant: ButtonVariant = 'primary-brand';

  /**
   * Disables the button interaction and applies disabled styling.
   * @default false
   */
  @Prop() disabled: boolean = false;

  render() {
    return (
      <button
        class={{
          'ds-button': true,
          [`ds-button--${this.variant}`]: true,
          'ds-button--disabled': this.disabled,
        }}
        disabled={this.disabled}
      >
        <slot name="icon-start"></slot>
        <span class="ds-button__label">
          <slot></slot>
        </span>
        <slot name="icon-end"></slot>
      </button>
    );
  }
}
