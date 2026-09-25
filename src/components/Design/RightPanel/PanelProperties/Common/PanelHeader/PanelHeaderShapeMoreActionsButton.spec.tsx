import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderShapeMoreActionsButton from './PanelHeaderShapeMoreActionsButton';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { selectOffsetVector } from 'store/design/selectors';
import { addNodes, setOffsetVector, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const handleEditObjectMock = vi.fn();

vi.mock('./hooks/useEditObject', () => ({
  useEditObject: (): TFunc => handleEditObjectMock,
}));

describe('PanelHeaderShapeMoreActionsButton behaviors', () => {
  it('should enter object editing from Edit object', () => {
    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <PanelHeaderShapeMoreActionsButton />
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
            <PanelHeaderShapeMoreActionsButton />
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

  it('should start offsetting the one selected line from Offset vector', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [{ height: 0, id: 'menuLine', name: 'Line', parentId: null, rotation: 0, strokes: [], type: NodeType.line, width: 10, x: 0, y: 0 }],
        rootIds: ['menuLine'],
      }),
    );
    store.dispatch(setSelection(['menuLine']));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <PanelHeaderShapeMoreActionsButton />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // action
    fireEvent.click(screen.getByLabelText('More actions'));
    fireEvent.click(screen.getByText('Offset vector'));

    // result
    expect(selectOffsetVector(store.getState())?.nodeId).toBe('menuLine');

    store.dispatch(setOffsetVector(null));
    store.dispatch(setSelection([]));
  });
});
