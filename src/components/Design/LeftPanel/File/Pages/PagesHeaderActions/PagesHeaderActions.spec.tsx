import { fireEvent, render, screen } from '@testing-library/react';

// components
import PagesHeaderActions from './PagesHeaderActions';
import { TooltipProvider } from 'shared';

const renderActions = (onAddPage = vi.fn(), onStopPropagation = vi.fn()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PagesHeaderActions onAddPage={onAddPage} onStopPropagation={onStopPropagation} />
    </TooltipProvider>,
  );

describe('PagesHeaderActions', () => {
  it('should render the search and add-page buttons', () => {
    // before
    renderActions();

    // result
    expect(screen.getByRole('button', { name: 'Find' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add new page' })).toBeInTheDocument();
  });

  it('should call onAddPage when the add button is clicked', () => {
    // mock
    const onAddPage = vi.fn();

    // before
    renderActions(onAddPage);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Add new page' }));

    // result
    expect(onAddPage).toHaveBeenCalledTimes(1);
  });

  it('should stop click propagation from the action group', () => {
    // mock
    const onStopPropagation = vi.fn();

    // before
    renderActions(vi.fn(), onStopPropagation);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Find' }));

    // result
    expect(onStopPropagation).toHaveBeenCalled();
  });
});
