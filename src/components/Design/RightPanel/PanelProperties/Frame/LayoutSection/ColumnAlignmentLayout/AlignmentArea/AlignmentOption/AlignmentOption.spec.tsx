import { fireEvent, render, screen } from '@testing-library/react';

// components
import AlignmentOption from './AlignmentOption';
import { TooltipProvider } from 'shared';

// types
import { AlignmentLayout } from 'types/design/enums';

const { indicatorProps } = vi.hoisted(() => ({ indicatorProps: [] as Record<string, unknown>[] }));

vi.mock('./OptionIndicators', () => ({
  default: (props: Record<string, unknown>): null => {
    indicatorProps.push(props);
    return null;
  },
}));

const renderOption = (props: Partial<Parameters<typeof AlignmentOption>[0]> = {}): Record<string, TFunc> => {
  const handlers = { onClick: vi.fn(), onMouseEnter: vi.fn(), onMouseLeave: vi.fn() };

  render(
    <TooltipProvider>
      <AlignmentOption
        alignment={AlignmentLayout.topLeft}
        isGapAutoHorizontal={false}
        isGapAutoVertical={false}
        isHighlighted={false}
        isHorizontal
        isSelected
        isWrap
        {...handlers}
        {...props}
      />
    </TooltipProvider>,
  );

  return handlers;
};

describe('AlignmentOption behaviors', () => {
  it('should report hovering and picking its alignment and show the wrap indicators', () => {
    // before
    const { onClick, onMouseEnter, onMouseLeave } = renderOption();

    // find
    const option = screen.getByLabelText('Top left');

    // action
    fireEvent.mouseEnter(option);
    fireEvent.click(option);
    fireEvent.mouseLeave(option);

    // result
    expect(option).toHaveAttribute('aria-pressed', 'true');
    expect(onMouseEnter).toHaveBeenCalledWith(AlignmentLayout.topLeft);
    expect(onClick).toHaveBeenCalledWith(AlignmentLayout.topLeft);
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
    expect(indicatorProps.at(-1)).toMatchObject({ alignment: AlignmentLayout.topLeft, isBaseline: false, isSelected: true, isWrap: true });
  });

  it('should skip the view modifiers of a baseline option', () => {
    // before
    renderOption({ isBaseline: true, isSelected: false });

    // result
    expect(screen.getByLabelText('Top left').className).toMatch(/baseline/);
    expect(indicatorProps.at(-1)).toMatchObject({ isBaseline: true, isWrap: false });
  });
});
