import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ICON_NAMES } from '../icons';

const meta: Meta = {
  title: 'Components/Icon',
  component: 'ds-icon',
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ICON_NAMES,
    },
  },
  args: {
    name: 'add',
  },
  render: (args) => html`<ds-icon name=${args.name}></ds-icon>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

/**
 * All available icons in the design system.
 */
export const AllIcons: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px;">
      ${ICON_NAMES.map(
        (name) => html`
          <div style="text-align: center; padding: 8px;">
            <ds-icon name=${name}></ds-icon>
            <div style="font-size: 10px; margin-top: 4px; word-break: break-all; color: var(--text-color-secondary, #666);">${name}</div>
          </div>
        `
      )}
    </div>
  `,
};
