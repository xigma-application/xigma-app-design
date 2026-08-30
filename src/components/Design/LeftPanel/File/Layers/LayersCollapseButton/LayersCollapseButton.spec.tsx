import { fireEvent, render, screen } from '@testing-library/react';

// components
import LayersCollapseButton from './LayersCollapseButton';
import { TooltipProvider } from 'shared';

const renderButton = (onCollapseAll = vi.fn()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <LayersCollapseButton onCollapseAll={onCollapseAll} />
    </TooltipProvider>,
  );

describe('LayersCollapseButton', () => {
  it('should render a button labeled "Collapse layers"', () => {
    // before
    renderButton();

    // result
    expect(screen.getByRole('button', { name: 'Collapse layers' })).toBeInTheDocument();
  });

  it('should call onCollapseAll when clicked, without letting the click bubble up to the header', () => {
    // mock
    const onCollapseAll = vi.fn();
    const onHeaderClick = vi.fn();

    // before
    render(
      <TooltipProvider>
        <div onClick={onHeaderClick}>
          <LayersCollapseButton onCollapseAll={onCollapseAll} />
        </div>
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Collapse layers' }));

    // result
    expect(onCollapseAll).toHaveBeenCalledTimes(1);
    expect(onHeaderClick).not.toHaveBeenCalled();
  });
});
