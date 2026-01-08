import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ICON_NAMES } from '../icons';

/**
 * The Button component is the primary interactive element in the design system.
 * It supports seven variants across three categories and adapts to brand theming,
 * color modes, and density settings via CSS Custom Properties.
 *
 * ## Variants
 *
 * **Primary (filled background):**
 * - `primary-brand` - Main CTA with brand color (BILD red, SportBILD blue)
 * - `primary-neutral` - Primary action with neutral/dark background
 * - `primary-success` - Confirmation/positive action with success color
 *
 * **Secondary:**
 * - `secondary` - Secondary actions with neutral gray background
 *
 * **Tertiary (outlined):**
 * - `tertiary-neutral` - Low-emphasis outlined style
 * - `tertiary-success` - Outlined with success color
 *
 * **Ghost:**
 * - `ghost` - Text-only, no background or border
 *
 * ## States
 * All variants support: idle, hover, active/pressed, and disabled states.
 *
 * ## Theming
 * Use the Storybook toolbar to switch:
 * - **Color Brand** - BILD / SportBILD (changes colors)
 * - **Theme** - Light / Dark (sun/moon toggle)
 * - **Density** - Default / Dense / Spacious (changes spacing)
 */
const meta: Meta = {
  title: 'Components/Button',
  component: 'ds-button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary-brand', 'primary-neutral', 'primary-success', 'secondary', 'tertiary-neutral', 'tertiary-success', 'ghost'],
    },
    disabled: { control: 'boolean' },
    icon: { control: 'select', options: ['', ...ICON_NAMES] },
    iconPosition: { control: 'select', options: ['start', 'end'] },
    label: { control: 'text' },
  },
  args: {
    label: 'Label',
    variant: 'primary-brand',
    disabled: false,
    icon: '',
    iconPosition: 'start',
  },
  render: (args) => html`
    <ds-button variant=${args.variant} ?disabled=${args.disabled} icon=${args.icon} icon-position=${args.iconPosition}>
      ${args.label}
    </ds-button>
  `,
};

export default meta;
type Story = StoryObj;

/* =============================================================================
   INDIVIDUAL VARIANT STORIES
   ============================================================================= */

/**
 * Default button story - Primary Brand variant.
 * Uses brand color for background (BILD red, SportBILD blue).
 */
export const Primary: Story = {
  args: {
    variant: 'primary-brand',
    label: 'Label',
  },
};

/**
 * Primary Brand - the main call-to-action.
 * Uses brand color for background (BILD red, SportBILD blue).
 */
export const PrimaryBrand: Story = {
  args: {
    variant: 'primary-brand',
    label: 'Label',
  },
};

/**
 * Primary Neutral - primary action with neutral/dark background.
 */
export const PrimaryNeutral: Story = {
  args: {
    variant: 'primary-neutral',
    label: 'Label',
  },
};

/**
 * Primary Success - confirmation or positive action.
 * Uses success/green color.
 */
export const PrimarySuccess: Story = {
  args: {
    variant: 'primary-success',
    label: 'Label',
  },
};

/**
 * Secondary - for secondary actions.
 * Uses neutral gray background.
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Label',
  },
};

/**
 * Tertiary Neutral - low-emphasis outlined style.
 */
export const TertiaryNeutral: Story = {
  args: {
    variant: 'tertiary-neutral',
    label: 'Label',
  },
};

/**
 * Tertiary Success - outlined with success color.
 */
export const TertiarySuccess: Story = {
  args: {
    variant: 'tertiary-success',
    label: 'Label',
  },
};

/**
 * Ghost - text-only button without background or border.
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    label: 'Label',
  },
};

/* =============================================================================
   OVERVIEW STORIES
   ============================================================================= */

/**
 * All seven button variants displayed side by side for comparison.
 */
export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <ds-button variant="primary-brand">Label</ds-button>
      <ds-button variant="primary-neutral">Label</ds-button>
      <ds-button variant="primary-success">Label</ds-button>
      <ds-button variant="secondary">Label</ds-button>
      <ds-button variant="tertiary-neutral">Label</ds-button>
      <ds-button variant="tertiary-success">Label</ds-button>
      <ds-button variant="ghost">Label</ds-button>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <ds-button variant="primary-brand" icon="add">Add Item</ds-button>
      <ds-button variant="primary-neutral" icon="download">Download</ds-button>
      <ds-button variant="secondary" icon="arrow-right" icon-position="end">Next</ds-button>
      <ds-button variant="tertiary-neutral" icon="edit">Edit</ds-button>
    </div>
  `,
};

/**
 * All variants in disabled state.
 */
export const AllDisabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <ds-button variant="primary-brand" disabled>Label</ds-button>
      <ds-button variant="primary-neutral" disabled>Label</ds-button>
      <ds-button variant="primary-success" disabled>Label</ds-button>
      <ds-button variant="secondary" disabled>Label</ds-button>
      <ds-button variant="tertiary-neutral" disabled>Label</ds-button>
      <ds-button variant="tertiary-success" disabled>Label</ds-button>
      <ds-button variant="ghost" disabled>Label</ds-button>
    </div>
  `,
};

/**
 * Complete state matrix showing all variants across all states.
 * States shown: default, hover (simulated), pressed (simulated), disabled.
 *
 * Note: Hover and pressed states are indicated by labels. To see actual
 * hover/pressed styling, interact with the buttons directly.
 */
export const StateMatrix: Story = {
  render: () => html`
    <style>
      .state-matrix {
        display: grid;
        grid-template-columns: 140px repeat(4, 1fr);
        gap: 12px;
        align-items: center;
      }
      .state-matrix__header {
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-color-secondary, #6c757d);
        text-align: center;
      }
      .state-matrix__label {
        font-size: 13px;
        color: var(--text-color-primary, #232629);
      }
      .state-matrix__cell {
        display: flex;
        justify-content: center;
      }
    </style>
    <div class="state-matrix">
      <!-- Header Row -->
      <div></div>
      <div class="state-matrix__header">Default</div>
      <div class="state-matrix__header">Hover</div>
      <div class="state-matrix__header">Pressed</div>
      <div class="state-matrix__header">Disabled</div>

      <!-- Primary Neutral -->
      <div class="state-matrix__label">Primary neutral</div>
      <div class="state-matrix__cell"><ds-button variant="primary-neutral">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-neutral">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-neutral">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-neutral" disabled>Label</ds-button></div>

      <!-- Primary Brand -->
      <div class="state-matrix__label">Primary brand</div>
      <div class="state-matrix__cell"><ds-button variant="primary-brand">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-brand">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-brand">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-brand" disabled>Label</ds-button></div>

      <!-- Primary Success -->
      <div class="state-matrix__label">Primary success</div>
      <div class="state-matrix__cell"><ds-button variant="primary-success">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-success">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-success">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="primary-success" disabled>Label</ds-button></div>

      <!-- Secondary -->
      <div class="state-matrix__label">Secondary</div>
      <div class="state-matrix__cell"><ds-button variant="secondary">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="secondary">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="secondary">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="secondary" disabled>Label</ds-button></div>

      <!-- Tertiary Neutral -->
      <div class="state-matrix__label">Tertiary neutral</div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-neutral">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-neutral">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-neutral">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-neutral" disabled>Label</ds-button></div>

      <!-- Tertiary Success -->
      <div class="state-matrix__label">Tertiary success</div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-success">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-success">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-success">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="tertiary-success" disabled>Label</ds-button></div>

      <!-- Ghost -->
      <div class="state-matrix__label">Ghost</div>
      <div class="state-matrix__cell"><ds-button variant="ghost">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="ghost">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="ghost">Label</ds-button></div>
      <div class="state-matrix__cell"><ds-button variant="ghost" disabled>Label</ds-button></div>
    </div>
  `,
};
