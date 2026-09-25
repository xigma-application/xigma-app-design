import { render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsAlignTextBaseline from './PopoverAutoLayoutSettingsAlignTextBaseline';
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

describe('PopoverAutoLayoutSettingsAlignTextBaseline behaviors', () => {
  it('should show the baseline toggle with its value, or empty when mixed', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<PopoverAutoLayoutSettingsAlignTextBaseline {...handlers} onChange={onChange} toggleButtons={[]} value={'on' as never} />);
    render(<PopoverAutoLayoutSettingsAlignTextBaseline {...handlers} onChange={onChange} toggleButtons={[]} value={undefined} />);

    // result
    expect(screen.getAllByText('Align text baseline')).toHaveLength(2);
    expect(fieldProps.at(-2)).toMatchObject({ ...handlers, onChange, value: 'on' });
    expect(fieldProps.at(-1)).toMatchObject({ value: '' });
  });
});
