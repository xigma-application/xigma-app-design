import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LineMoreActionsButton from './LineMoreActionsButton';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const handleEditObjectMock = vi.fn();

vi.mock('../../../Common/PanelHeader/hooks/useEditObject', () => ({
  useEditObject: (): TFunc => handleEditObjectMock,
}));

describe('LineMoreActionsButton behaviors', () => {
  it('should enter object editing from Edit object', () => {
    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <LineMoreActionsButton />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // action
    fireEvent.click(screen.getByLabelText('More actions'));
    fireEvent.click(screen.getByText('Edit object'));

    // result
    expect(handleEditObjectMock).toHaveBeenCalledTimes(1);
  });

  it('should show Offset vector as a disabled item and no component items', () => {
    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <LineMoreActionsButton />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Offset vector').closest('[class*="PopoverItem--disabled"]')).not.toBeNull();
    expect(screen.queryByText('Create component')).not.toBeInTheDocument();
  });
});
