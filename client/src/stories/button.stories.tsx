import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Button>Default Button</Button>,
};

export const Secondary: Story = {
  render: () => <Button variant="secondary">Secondary Button</Button>,
};

export const Destructive: Story = {
  render: () => <Button variant="destructive">Destructive Button</Button>,
};

export const Outline: Story = {
  render: () => <Button variant="outline">Outline Button</Button>,
};

export const Ghost: Story = {
  render: () => <Button variant="ghost">Ghost Button</Button>,
};

export const Link: Story = {
  render: () => <Button variant="link">Link Button</Button>,
};

export const Large: Story = {
  render: () => <Button size="lg">Large Button</Button>,
};

export const Small: Story = {
  render: () => <Button size="sm">Small Button</Button>,
};

export const WithIcon: Story = {
  render: () => (
    <Button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
      With Icon
    </Button>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <svg
        className="mr-2 h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Please wait
    </Button>
  ),
};

export const Disabled: Story = {
  render: () => <Button disabled>Disabled Button</Button>,
}; 