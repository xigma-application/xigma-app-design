import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import StrokeSettingsRow from './StrokeSettingsRow';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeAlign, StrokeMode, StrokeSides } from 'types/design/enums';

describe('StrokeSettingsRow', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the position, weight and the two settings buttons for the selected node', () => {
    // before
    store.dispatch(
      addNode({
        fills: [],
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        strokeAlign: StrokeAlign.center,
        strokeWidth: 3,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // action
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <StrokeSettingsRow />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
    expect(screen.getByLabelText('Stroke weight')).toHaveValue('3');
    expect(screen.getByLabelText('Advanced stroke settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Individual strokes')).toBeInTheDocument();
  });

  it('should show the four side fields and Mixed in the weight field for custom sides that differ', () => {
    // before
    store.dispatch(
      addNode({
        fills: [],
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        strokeBottomWidth: 4,
        strokeLeftWidth: 1,
        strokeRightWidth: 3,
        strokeSides: StrokeSides.custom,
        strokeTopWidth: 2,
        strokeWidth: 4,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // action
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <StrokeSettingsRow />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByLabelText('Stroke weight')).toHaveValue('Mixed');
    expect(screen.getByLabelText('Stroke left weight')).toHaveValue('1');
    expect(screen.getByLabelText('Stroke top weight')).toHaveValue('2');
    expect(screen.getByLabelText('Stroke right weight')).toHaveValue('3');
    expect(screen.getByLabelText('Stroke bottom weight')).toHaveValue('4');
  });

  it('should disable Position showing Center and hide (keep in the DOM) the individual strokes button for a dynamic or brush stroke', () => {
    // before
    store.dispatch(
      addNode({
        fills: [],
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        strokeAlign: StrokeAlign.outside,
        strokeMode: StrokeMode.dynamic,
        strokeWidth: 3,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

    // action
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <StrokeSettingsRow />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Center').closest('button')).toBeDisabled();
    expect(screen.getByLabelText('Individual strokes', { selector: '[aria-hidden="true"]' })).toBeDisabled();
    expect(screen.getByLabelText('Advanced stroke settings')).toBeInTheDocument();
  });
});
