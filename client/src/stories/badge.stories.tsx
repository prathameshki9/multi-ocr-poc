import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Badge>Default Badge</Badge>,
};

export const Secondary: Story = {
  render: () => <Badge variant="secondary">Secondary Badge</Badge>,
};

export const Destructive: Story = {
  render: () => <Badge variant="destructive">Destructive Badge</Badge>,
};

export const Outline: Story = {
  render: () => <Badge variant="outline">Outline Badge</Badge>,
}; 