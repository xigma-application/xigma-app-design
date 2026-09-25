import { render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsInsideStroke from './PopoverAutoLayoutSettingsInsideStroke';
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

describe('PopoverAutoLayoutSettingsInsideStroke behaviors', () => {
  it('should label the row by the layout version', () => {
    // mock
    const onSelect = vi.fn();

    // before
    render(<PopoverAutoLayoutSettingsInsideStroke {...handlers} isLegacyLayout onSelect={onSelect} options={[]} value={undefined} />);
    render(
      <PopoverAutoLayoutSettingsInsideStroke {...handlers} isLegacyLayout={false} onSelect={onSelect} options={[]} value={undefined} />,
    );

    // result
    expect(screen.getByText('Strokes')).toBeInTheDocument();
    expect(screen.getByText('Inside stroke')).toBeInTheDocument();
    expect(fieldProps.at(-1)).toMatchObject({ ...handlers, onSelect });
  });
});
