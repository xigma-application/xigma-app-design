import { fireEvent, render, screen } from '@testing-library/react';

// components
import LayoutGuideSettingsHeader from './LayoutGuideSettingsHeader';
import { TooltipProvider } from 'shared';

// types
import { LayoutGuideType } from 'types/design/enums';

const renderHeader = (): Record<string, TFunc> => {
  const handlers = { onClose: vi.fn(), onTypeChange: vi.fn() };

  render(
    <TooltipProvider>
      <LayoutGuideSettingsHeader {...handlers} type={LayoutGuideType.columns} />
    </TooltipProvider>,
  );

  return handlers;
};

describe('LayoutGuideSettingsHeader behaviors', () => {
  it('should change the layout guide type from its menu', () => {
    // before
    const { onTypeChange } = renderHeader();

    // action
    fireEvent.click(screen.getByLabelText('Change layout guide type'));
    fireEvent.click(screen.getByText('Grid'));

    // result
    expect(onTypeChange).toHaveBeenCalledWith(LayoutGuideType.grid);
  });

  it('should close from its button', () => {
    // before
    const { onClose } = renderHeader();

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
