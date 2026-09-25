import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColumnSpacingField from './ColumnSpacingField';
import { TooltipProvider } from 'shared';

const renderField = (displayValue: number | string): Record<string, TFunc> => {
  const handlers = { onBlur: vi.fn(), onDragEnd: vi.fn(), onDragStart: vi.fn(), onScrub: vi.fn() };

  render(
    <TooltipProvider>
      <ColumnSpacingField
        ariaLabel="Horizontal spacing"
        displayValue={displayValue}
        e2eValue={'spacing-horizontal' as never}
        icon="SpacingHorizontal"
        tooltip="Horizontal"
        value={typeof displayValue === 'number' ? displayValue : 0}
        {...handlers}
      />
    </TooltipProvider>,
  );

  return handlers;
};

describe('ColumnSpacingField behaviors', () => {
  it('should show a numeric spacing and report the blur', () => {
    // before
    const { onBlur } = renderField(12);

    // find
    const input = screen.getByLabelText('Horizontal spacing');

    // action
    fireEvent.blur(input);

    // result
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveValue(12);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should show a text value such as Mixed', () => {
    // before
    renderField('Mixed');

    // result
    expect(screen.getByLabelText('Horizontal spacing')).toHaveValue('Mixed');
  });
});
