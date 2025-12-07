import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ds-button',
  styleUrl: 'ds-button.css',
  shadow: true,
})
export class DsButton {
  /**
   * Button variant: primary, secondary, or tertiary
   */
  @Prop() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';

  /**
   * Disabled state
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
        <span class="ds-button__label">
          <slot></slot>
        </span>
      </button>
    );
  }
}
