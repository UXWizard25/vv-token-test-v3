import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ds-card',
  styleUrl: 'ds-card.css',
  shadow: true,
})
export class DsCard {
  /**
   * Card surface variant: primary or secondary
   */
  @Prop() surface: 'primary' | 'secondary' = 'primary';

  /**
   * Optional card title
   */
  @Prop() cardTitle?: string;

  render() {
    return (
      <div
        class={{
          'ds-card': true,
          [`ds-card--${this.surface}`]: true,
        }}
      >
        {this.cardTitle && (
          <div class="ds-card__header">
            <h3 class="ds-card__title">{this.cardTitle}</h3>
          </div>
        )}
        <div class="ds-card__content">
          <slot></slot>
        </div>
      </div>
    );
  }
}
