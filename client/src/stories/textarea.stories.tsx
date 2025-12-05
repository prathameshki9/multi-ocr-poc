import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Textarea placeholder="Type your message here." />
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <label htmlFor="message">Your message</label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Textarea disabled placeholder="This textarea is disabled." />
  ),
}; 