import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

/**
 * The Icon component displays SVG icons from the BILD Design System icon library.
 * Icons are loaded on-demand and cached for optimal performance.
 *
 * ## Features
 *
 * - **199 icons** available from the design system icon library
 * - **Lazy loading** - optional IntersectionObserver-based loading
 * - **Caching** - icons are fetched once and cached across all instances
 * - **Theming** - inherits color from parent via `currentColor`
 * - **Accessible** - supports aria-label for semantic icons
 *
 * ## Usage
 *
 * ```html
 * <!-- Basic usage -->
 * <ds-icon name="add"></ds-icon>
 *
 * <!-- With size and color -->
 * <ds-icon name="arrow-right" size="32" color="red"></ds-icon>
 *
 * <!-- Accessible icon -->
 * <ds-icon name="close" label="Close dialog"></ds-icon>
 *
 * <!-- Inside a button -->
 * <ds-button>
 *   <ds-icon slot="icon-start" name="add"></ds-icon>
 *   Add Item
 * </ds-button>
 * ```
 */
const meta: Meta = {
  title: 'Components/Icon',
  component: 'ds-icon',
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'add',
        'arrow-down',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'checkmark',
        'chevron-down',
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'close',
        'download',
        'edit',
        'heart',
        'home',
        'mail',
        'menu',
        'search',
        'settings',
        'share',
        'star',
        'video',
      ],
      description: 'Name of the icon (without .svg extension)',
      table: {
        type: { summary: 'string' },
      },
    },
    size: {
      control: { type: 'number', min: 12, max: 96, step: 4 },
      description: 'Size of the icon in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '24' },
      },
    },
    color: {
      control: 'color',
      description: 'Color of the icon (CSS color value)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'currentColor' },
      },
    },
    lazy: {
      control: 'boolean',
      description: 'Enable lazy loading with IntersectionObserver',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    name: 'add',
    size: 24,
    color: 'currentColor',
    lazy: false,
  },
  render: (args) => html`
    <ds-icon
      name=${args.name}
      size=${args.size}
      color=${args.color}
      ?lazy=${args.lazy}
      label=${args.label || ''}
    ></ds-icon>
  `,
};

export default meta;
type Story = StoryObj;

/* =============================================================================
   BASIC STORIES
   ============================================================================= */

/**
 * Default icon - Add icon at 24px.
 */
export const Default: Story = {
  args: {
    name: 'add',
  },
};

/**
 * Icon with custom size (32px).
 */
export const CustomSize: Story = {
  args: {
    name: 'star',
    size: 32,
  },
};

/**
 * Icon with custom color.
 */
export const CustomColor: Story = {
  args: {
    name: 'heart',
    size: 32,
    color: '#DD0000',
  },
};

/**
 * Accessible icon with aria-label.
 */
export const Accessible: Story = {
  args: {
    name: 'close',
    size: 24,
    label: 'Close dialog',
  },
};

/* =============================================================================
   SIZE VARIATIONS
   ============================================================================= */

/**
 * Icons at different sizes.
 */
export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <div style="text-align: center;">
        <ds-icon name="star" size="16"></ds-icon>
        <div style="font-size: 12px; margin-top: 8px;">16px</div>
      </div>
      <div style="text-align: center;">
        <ds-icon name="star" size="20"></ds-icon>
        <div style="font-size: 12px; margin-top: 8px;">20px</div>
      </div>
      <div style="text-align: center;">
        <ds-icon name="star" size="24"></ds-icon>
        <div style="font-size: 12px; margin-top: 8px;">24px</div>
      </div>
      <div style="text-align: center;">
        <ds-icon name="star" size="32"></ds-icon>
        <div style="font-size: 12px; margin-top: 8px;">32px</div>
      </div>
      <div style="text-align: center;">
        <ds-icon name="star" size="48"></ds-icon>
        <div style="font-size: 12px; margin-top: 8px;">48px</div>
      </div>
    </div>
  `,
};

/* =============================================================================
   ICON GALLERY
   ============================================================================= */

/**
 * Gallery of commonly used icons.
 */
export const CommonIcons: Story = {
  render: () => html`
    <style>
      .icon-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 16px;
      }
      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--surface-color-tertiary, #e0e0e0);
        border-radius: 8px;
        transition: background-color 0.2s;
      }
      .icon-item:hover {
        background-color: var(--surface-color-secondary, #f5f5f5);
      }
      .icon-name {
        margin-top: 8px;
        font-size: 11px;
        color: var(--text-color-secondary, #6c757d);
        text-align: center;
        word-break: break-all;
      }
    </style>
    <div class="icon-gallery">
      ${[
        'add',
        'arrow-down',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'bookmark',
        'calendar',
        'camera',
        'checkmark',
        'chevron-down',
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'close',
        'comment',
        'copy',
        'download',
        'edit',
        'heart',
        'home',
        'mail',
        'menu',
        'search',
        'settings',
        'share',
        'star',
        'video',
        'play',
        'pause',
      ].map(
        (name) => html`
          <div class="icon-item">
            <ds-icon name=${name} size="24"></ds-icon>
            <div class="icon-name">${name}</div>
          </div>
        `
      )}
    </div>
  `,
};

/**
 * All available icons in the design system.
 */
export const AllIcons: Story = {
  render: () => html`
    <style>
      .icon-gallery-full {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;
      }
      .icon-item-small {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 8px;
        border: 1px solid var(--surface-color-tertiary, #e0e0e0);
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      .icon-item-small:hover {
        background-color: var(--surface-color-secondary, #f5f5f5);
      }
      .icon-name-small {
        margin-top: 6px;
        font-size: 9px;
        color: var(--text-color-secondary, #6c757d);
        text-align: center;
        word-break: break-all;
        line-height: 1.2;
      }
    </style>
    <div class="icon-gallery-full">
      ${[
        '2-liga-logo',
        'account',
        'add',
        'adjust',
        'android',
        'apple-ios',
        'arrow-down',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'arscan',
        'auto',
        'autobild-logo',
        'bams-logo',
        'basketball',
        'bild-club-logo',
        'bild-logo',
        'bildplay-logo',
        'bildplus-logo-simple',
        'bildplus-logo',
        'bin',
        'bookmark',
        'boxing',
        'bundesliga-logo',
        'burgermenu',
        'calendar',
        'camera',
        'cards',
        'checklist',
        'checkmark-circled',
        'checkmark',
        'chevron-down',
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'clock',
        'close',
        'comment',
        'computerbild-logo',
        'controller',
        'copy',
        'credit-card',
        'dark-mode',
        'data-protection',
        'desktop-checkmark',
        'desktop-questionmark',
        'desktop',
        'digital',
        'download',
        'edit',
        'enter-fullscreen',
        'erotik',
        'exclamationmark-circle',
        'exit-fullscreen',
        'external-intext',
        'external-link',
        'fast-back-chevron',
        'fast-back-filled',
        'fast-back',
        'fast-forward-chevron',
        'fast-forward-filled',
        'fast-forward',
        'fast-upward',
        'football',
        'fussball',
        'geld',
        'gesundheit',
        'gewinnspiele',
        'gtcs',
        'handball',
        'headphones',
        'heart',
        'hey-logo',
        'hide',
        'history',
        'hockey',
        'home',
        'horoskop',
        'image-gallery',
        'image',
        'imprint',
        'information',
        'input',
        'kino',
        'lifestyle',
        'light-mode',
        'list-checked',
        'live-badge',
        'locked',
        'log-out',
        'logged-in',
        'login',
        'lotto',
        'mail',
        'marktplatz-logo',
        'maximize-pip',
        'maximize',
        'mein-verein',
        'menu',
        'minimize-pip',
        'minimize',
        'motorsport',
        'mute',
        'mypass',
        'netid',
        'news-ticker',
        'news',
        'notifications-off',
        'notifications-on',
        'ost-sport',
        'paper',
        'participate',
        'pause-filled',
        'pause',
        'payment-mastercard',
        'pin',
        'placeholder',
        'play-filled',
        'play',
        'podcast-amazon',
        'podcast-applepodcast',
        'podcast-deezer',
        'podcast-googlepodcasts',
        'podcast-spotify',
        'politik',
        'push-notification',
        'questionmark-circle',
        'quote',
        'raetsel',
        'ratgeber',
        'regio',
        'reise',
        'reload',
        'replay',
        'ressorts',
        'revocation',
        'rewind-ten-sec',
        'search',
        'send',
        'settings',
        'sex-und-liebe',
        'share',
        'sharecast',
        'shopping-cart',
        'show',
        'sign-up',
        'skip-next-chevron',
        'skip-next-filled',
        'skip-next',
        'skip-previous-chevron',
        'skip-previous-filled',
        'skip-previous',
        'skip-ten-sec',
        'smartphone',
        'social-facebook',
        'social-fb-messagner',
        'social-google',
        'social-instagram',
        'social-linkedin',
        'social-snapchat',
        'social-whatsapp',
        'social-x-twitter',
        'social-xing',
        'social-youtube',
        'speed',
        'sport-bild-logo',
        'sport-live',
        'sport-ticker',
        'sport',
        'sportimtv',
        'ssl',
        'star',
        'substract',
        'sz-ticker',
        'telephone',
        'tennis',
        'three-dot-horizontal',
        'three-dot-vertical',
        'thumbs-down',
        'thumbs-up',
        'trending',
        'tv',
        'unlocked',
        'unquote',
        'unterhaltung',
        'upload',
        'us-sport',
        'verimi',
        'video-error',
        'video-recommendations',
        'video',
        'volume-down',
        'volume-up',
        'vote',
        'warning',
        'web',
        'wetter',
        'wrestling',
        'zoom-in',
      ].map(
        (name) => html`
          <div class="icon-item-small">
            <ds-icon name=${name} size="20"></ds-icon>
            <div class="icon-name-small">${name}</div>
          </div>
        `
      )}
    </div>
  `,
};

/* =============================================================================
   COLOR INHERITANCE
   ============================================================================= */

/**
 * Icons inherit color from their parent element.
 */
export const ColorInheritance: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <div style="color: #DD0000;">
        <ds-icon name="heart" size="32"></ds-icon>
        <span style="margin-left: 8px; font-size: 14px;">Inherits red</span>
      </div>
      <div style="color: #0066CC;">
        <ds-icon name="star" size="32"></ds-icon>
        <span style="margin-left: 8px; font-size: 14px;">Inherits blue</span>
      </div>
      <div style="color: #00A651;">
        <ds-icon name="checkmark" size="32"></ds-icon>
        <span style="margin-left: 8px; font-size: 14px;">Inherits green</span>
      </div>
    </div>
  `,
};

/* =============================================================================
   BUTTON INTEGRATION
   ============================================================================= */

/**
 * Icons inside buttons using slots.
 */
export const InButtons: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <ds-button variant="primary-brand">
        <ds-icon slot="icon-start" name="add"></ds-icon>
        Add Item
      </ds-button>

      <ds-button variant="primary-neutral">
        <ds-icon slot="icon-start" name="download"></ds-icon>
        Download
      </ds-button>

      <ds-button variant="secondary">
        Next
        <ds-icon slot="icon-end" name="arrow-right"></ds-icon>
      </ds-button>

      <ds-button variant="tertiary-neutral">
        <ds-icon slot="icon-start" name="edit"></ds-icon>
        Edit
      </ds-button>

      <ds-button variant="ghost">
        <ds-icon slot="icon-start" name="share"></ds-icon>
        Share
      </ds-button>
    </div>
  `,
};

/**
 * Icon-only buttons (using ghost variant).
 */
export const IconOnlyButtons: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ds-button variant="ghost">
        <ds-icon slot="icon-start" name="close" label="Close"></ds-icon>
      </ds-button>
      <ds-button variant="ghost">
        <ds-icon slot="icon-start" name="search" label="Search"></ds-icon>
      </ds-button>
      <ds-button variant="ghost">
        <ds-icon slot="icon-start" name="menu" label="Menu"></ds-icon>
      </ds-button>
      <ds-button variant="ghost">
        <ds-icon slot="icon-start" name="settings" label="Settings"></ds-icon>
      </ds-button>
    </div>
  `,
};
