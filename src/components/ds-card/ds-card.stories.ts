import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

/**
 * The Card component is a container for grouping related content.
 * It supports two surface variants and an optional title.
 *
 * ## Features
 * - **Primary Surface**: Elevated card with prominent shadow
 * - **Secondary Surface**: Subtle background, lighter shadow
 * - **Optional Title**: Header section with styled heading
 *
 * ## Design Tokens Used
 * - `--card-surface-bg-color`, `--surface-color-primary/secondary`
 * - `--shadow-soft-sm/md/lg`
 * - `--border-radius-lg`
 * - `--space-2-x`
 * - `--headline-3-font-size`, `--headline-3-line-height`
 * - `--text-color-primary`
 */
const meta: Meta = {
  title: 'Components/Card',
  component: 'ds-card',
  tags: ['autodocs'],
  argTypes: {
    surface: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Surface style variant',
      table: {
        type: { summary: 'primary | secondary' },
        defaultValue: { summary: 'primary' },
      },
    },
    cardTitle: {
      control: 'text',
      description: 'Optional card title',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    surface: 'primary',
    cardTitle: '',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Primary surface card - elevated appearance with shadow.
 * Use for prominent content that should stand out.
 */
export const Primary: Story = {
  args: {
    surface: 'primary',
    cardTitle: 'Card Title',
  },
  render: (args) => html`
    <ds-card surface=${args.surface} card-title=${args.cardTitle || ''}>
      <p style="margin: 0; color: var(--text-color-secondary, #6C757D);">
        This is the card content. It can contain any HTML elements
        including text, images, and other components.
      </p>
    </ds-card>
  `,
};

/**
 * Secondary surface card - subtle background.
 * Use for less prominent or nested content.
 */
export const Secondary: Story = {
  args: {
    surface: 'secondary',
    cardTitle: 'Secondary Card',
  },
  render: (args) => html`
    <ds-card surface=${args.surface} card-title=${args.cardTitle || ''}>
      <p style="margin: 0; color: var(--text-color-secondary, #6C757D);">
        Secondary surface has a subtler appearance,
        perfect for nested cards or less prominent content.
      </p>
    </ds-card>
  `,
};

/**
 * Card without title - content-only layout.
 */
export const WithoutTitle: Story = {
  args: {
    surface: 'primary',
  },
  render: (args) => html`
    <ds-card surface=${args.surface}>
      <p style="margin: 0; color: var(--text-color-primary, #232629);">
        A card without a title. Just content.
      </p>
    </ds-card>
  `,
};

/**
 * Card with button - interactive card example.
 */
export const WithButton: Story = {
  args: {
    surface: 'primary',
    cardTitle: 'Interactive Card',
  },
  render: (args) => html`
    <ds-card surface=${args.surface} card-title=${args.cardTitle || ''}>
      <p style="margin: 0 0 16px; color: var(--text-color-secondary, #6C757D);">
        Cards can contain interactive elements like buttons.
      </p>
      <ds-button variant="primary">Action</ds-button>
    </ds-card>
  `,
};

/**
 * Card grid layout - responsive card arrangement.
 */
export const CardGrid: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
      <ds-card card-title="Card One" surface="primary">
        <p style="margin: 0; color: var(--text-color-secondary, #6C757D);">
          First card in the grid layout.
        </p>
        <div style="margin-top: 16px;">
          <ds-button variant="primary">Learn More</ds-button>
        </div>
      </ds-card>

      <ds-card card-title="Card Two" surface="primary">
        <p style="margin: 0; color: var(--text-color-secondary, #6C757D);">
          Second card in the grid layout.
        </p>
        <div style="margin-top: 16px;">
          <ds-button variant="secondary">Details</ds-button>
        </div>
      </ds-card>

      <ds-card card-title="Card Three" surface="secondary">
        <p style="margin: 0; color: var(--text-color-secondary, #6C757D);">
          Third card with secondary surface.
        </p>
        <div style="margin-top: 16px;">
          <ds-button variant="tertiary">View</ds-button>
        </div>
      </ds-card>
    </div>
  `,
};

/**
 * Surface variants side by side for comparison.
 */
export const SurfaceComparison: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 280px;">
        <ds-card card-title="Primary Surface" surface="primary">
          <p style="margin: 0; color: var(--text-color-secondary, #6C757D);">
            Elevated card with prominent shadow. Hover to see shadow change.
          </p>
        </ds-card>
      </div>
      <div style="flex: 1; min-width: 280px;">
        <ds-card card-title="Secondary Surface" surface="secondary">
          <p style="margin: 0; color: var(--text-color-secondary, #6C757D);">
            Subtle background with lighter shadow. Good for nested content.
          </p>
        </ds-card>
      </div>
    </div>
  `,
};
