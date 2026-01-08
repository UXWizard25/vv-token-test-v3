import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Icon',
  component: 'ds-icon',
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['add', 'arrow-right', 'checkmark', 'close', 'download', 'edit', 'heart', 'home', 'search', 'star'],
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

export const CommonIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      ${['add', 'arrow-right', 'checkmark', 'close', 'download', 'edit', 'heart', 'home', 'search', 'star', 'menu', 'settings'].map(
        (name) => html`
          <div style="text-align: center;">
            <ds-icon name=${name}></ds-icon>
            <div style="font-size: 11px; margin-top: 4px;">${name}</div>
          </div>
        `
      )}
    </div>
  `,
};
