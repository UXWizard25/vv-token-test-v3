import { Component, Prop, h } from '@stencil/core';

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
   */
  @Prop() variant: ButtonVariant = 'primary-brand';

  /**
   * Disables the button.
   */
  @Prop() disabled: boolean = false;

  /**
   * Icon name to display (optional).
   */
  @Prop() icon?: string;

  /**
   * Icon position: 'start' or 'end'.
   */
  @Prop() iconPosition: 'start' | 'end' = 'start';

  render() {
    const iconEl = this.icon ? <ds-icon name={this.icon}></ds-icon> : null;

    return (
      <button
        class={{
          'ds-button': true,
          [`ds-button--${this.variant}`]: true,
          'ds-button--disabled': this.disabled,
        }}
        disabled={this.disabled}
      >
        {this.iconPosition === 'start' && iconEl}
        <span class="ds-button__label">
          <slot></slot>
        </span>
        {this.iconPosition === 'end' && iconEl}
      </button>
    );
  }
}
