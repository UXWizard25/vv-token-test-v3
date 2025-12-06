import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

/**
 * The Button component is the primary interactive element in the design system.
 * It supports three variants (primary, secondary, tertiary) and adapts to
 * brand theming via CSS Custom Properties.
 *
 * ## Features
 * - **Primary**: Main call-to-action, brand-colored background
 * - **Secondary**: Secondary actions, neutral background
 * - **Tertiary**: Low-emphasis actions, outlined style
 *
 * ## Design Tokens Used
 * - `--button-primary-brand-bg-color-idle/hover`
 * - `--button-secondary-bg-color-idle/hover`
 * - `--button-tertiary-border-color-idle/hover`
 * - `--button-stack-space`, `--button-inline-space`
 * - `--button-border-radius`
 * - `--button-label-font-size`, `--button-label-line-height`
 */
const meta: Meta = {
  title: 'Components/Button',
  component: 'ds-button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual style variant of the button',
      table: {
        type: { summary: 'primary | secondary | tertiary' },
        defaultValue: { summary: 'primary' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button interaction',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      control: 'text',
      description: 'Button text content (slot)',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    label: 'Button',
    variant: 'primary',
    disabled: false,
  },
  render: (args) => html`
    <ds-button variant=${args.variant} ?disabled=${args.disabled}>
      ${args.label}
    </ds-button>
  `,
};

export default meta;
type Story = StoryObj;

/**
 * Primary button - the main call-to-action.
 * Uses brand color for background (BILD red, SportBILD blue).
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary Button',
  },
};

/**
 * Secondary button - for secondary actions.
 * Uses neutral background color.
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Secondary Button',
  },
};

/**
 * Tertiary button - for low-emphasis actions.
 * Outlined style with transparent background.
 */
export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    label: 'Tertiary Button',
  },
};

/**
 * Disabled state - applies to all variants.
 * Reduces opacity and prevents interaction.
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    label: 'Disabled',
    disabled: true,
  },
};

/**
 * All variants side by side for comparison.
 */
export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <ds-button variant="primary">Primary</ds-button>
      <ds-button variant="secondary">Secondary</ds-button>
      <ds-button variant="tertiary">Tertiary</ds-button>
    </div>
  `,
};

/**
 * Disabled states for all variants.
 */
export const AllDisabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <ds-button variant="primary" disabled>Primary</ds-button>
      <ds-button variant="secondary" disabled>Secondary</ds-button>
      <ds-button variant="tertiary" disabled>Tertiary</ds-button>
    </div>
  `,
};
