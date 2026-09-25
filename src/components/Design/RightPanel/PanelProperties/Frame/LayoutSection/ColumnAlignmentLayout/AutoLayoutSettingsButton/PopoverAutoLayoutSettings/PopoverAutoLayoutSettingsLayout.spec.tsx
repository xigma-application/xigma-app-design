import { render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsLayout from './PopoverAutoLayoutSettingsLayout';
import { fieldProps } from 'test/FieldMock';

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return {
    ...original,
    Tooltip: ({ children }: { children: unknown }): unknown => children,
    UITools: { ...original.UITools, Field: FieldMock },
  };
});

const handlers = { onHoverOption: vi.fn(), onMouseEnter: vi.fn(), onMouseLeave: vi.fn() };

describe('PopoverAutoLayoutSettingsLayout behaviors', () => {
  it('should offer the layout versions', () => {
    // mock
    const onSelect = vi.fn();

    // before
    render(<PopoverAutoLayoutSettingsLayout {...handlers} onSelect={onSelect} options={[]} value={undefined} />);

    // result
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(fieldProps.at(-1)).toMatchObject({ ...handlers, onSelect });
  });
});
