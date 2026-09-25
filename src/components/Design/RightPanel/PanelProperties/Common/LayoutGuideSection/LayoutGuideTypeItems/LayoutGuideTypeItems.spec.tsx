import { fireEvent, render, screen } from '@testing-library/react';

// components
import LayoutGuideTypeItems from './LayoutGuideTypeItems';
import { TooltipProvider, UITools } from 'shared';

// types
import { LayoutGuideType } from 'types/design/enums';

describe('LayoutGuideTypeItems behaviors', () => {
  it('should list every layout guide type and report a picked one', () => {
    // mock
    const onSelect = vi.fn();

    // before
    render(
      <TooltipProvider>
        <UITools.Popover open trigger={<button type="button">open</button>}>
          <LayoutGuideTypeItems onSelect={onSelect} selectedType={LayoutGuideType.grid} />
        </UITools.Popover>
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByText('Rows'));

    // result
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledWith(LayoutGuideType.rows);
  });
});
