import { render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsAutoSpacing from './PopoverAutoLayoutSettingsAutoSpacing';
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

describe('PopoverAutoLayoutSettingsAutoSpacing behaviors', () => {
  it('should offer the auto spacing options', () => {
    // mock
    const onSelect = vi.fn();

    // before
    render(<PopoverAutoLayoutSettingsAutoSpacing {...handlers} disabled={false} onSelect={onSelect} options={[]} value={undefined} />);

    // result
    expect(screen.getByText('Auto spacing')).toBeInTheDocument();
    expect(fieldProps.at(-1)).toMatchObject({ ...handlers, dimmed: false, disabled: false, onSelect });
  });

  it('should dim and disable the field when auto spacing is not available', () => {
    // before
    render(<PopoverAutoLayoutSettingsAutoSpacing {...handlers} disabled onSelect={vi.fn()} options={[]} value={undefined} />);

    // result
    expect(fieldProps.at(-1)).toMatchObject({ dimmed: true, disabled: true });
  });
});
