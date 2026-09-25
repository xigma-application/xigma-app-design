import { fireEvent, render, screen } from '@testing-library/react';

// components
import StrokeSidesMenu from './StrokeSidesMenu';
import { TooltipProvider } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { StrokeSides } from 'types/design/enums';

const renderMenu = (sides: StrokeSides | undefined, hidden?: boolean): TFunc => {
  const onSelect = vi.fn();

  render(
    <TooltipProvider>
      <StrokeSidesMenu hidden={hidden} onSelect={onSelect} sides={sides} />
    </TooltipProvider>,
  );

  return onSelect;
};

describe('StrokeSidesMenu behaviors', () => {
  it('should list every side option and report a picked one', () => {
    // before
    const onSelect = renderMenu(StrokeSides.all);

    // action
    fireEvent.click(screen.getByLabelText('Individual strokes'));

    // result
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText(MIXED_LABEL)).not.toBeInTheDocument();

    // action
    fireEvent.click(screen.getByText('Top'));

    // result
    expect(onSelect).toHaveBeenCalledWith(StrokeSides.top);
  });

  it('should show a disabled Mixed entry for mixed sides', () => {
    // before
    renderMenu(undefined);

    // action
    fireEvent.click(screen.getByLabelText('Individual strokes'));

    // result
    expect(screen.getByText(MIXED_LABEL)).toBeInTheDocument();
  });

  it('should disable a hidden trigger', () => {
    // before
    renderMenu(StrokeSides.custom, true);

    // result
    expect(screen.getByLabelText('Individual strokes', { selector: 'button' })).toBeDisabled();
  });
});
