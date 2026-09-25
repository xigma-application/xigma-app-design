import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LineStrokeSettings from './LineStrokeSettings';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LineEndpoint, NodeType, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

const line: TLineNode = {
  endPoint: LineEndpoint.lineArrow,
  height: 0,
  id: 'settingsLine',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokeWidth: 3,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

describe('LineStrokeSettings behaviors', () => {
  it('should show a centered position by default, the weight and both endpoints', () => {
    // mock
    store.dispatch(addNodes({ nodes: [line], rootIds: [line.id] }));
    store.dispatch(setSelection([line.id]));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <LineStrokeSettings />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Center').closest('button')).not.toBeDisabled();
    expect(screen.getByLabelText('Stroke weight')).toHaveValue('3');
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Line arrow')).toBeInTheDocument();
  });

  it('should show Mixed for lines of different weights', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          { ...line, id: 'settingsLineMixedA' },
          { ...line, id: 'settingsLineMixedB', strokeWidth: 6 },
        ],
        rootIds: ['settingsLineMixedA', 'settingsLineMixedB'],
      }),
    );
    store.dispatch(setSelection(['settingsLineMixedA', 'settingsLineMixedB']));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <LineStrokeSettings />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByLabelText('Stroke weight')).toHaveValue('Mixed');
  });

  it('should set the start point picked from its dropdown', () => {
    // mock
    store.dispatch(addNodes({ nodes: [{ ...line, id: 'settingsLinePick' }], rootIds: ['settingsLinePick'] }));
    store.dispatch(setSelection(['settingsLinePick']));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <LineStrokeSettings />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // action
    fireEvent.click(screen.getByText('None'));
    fireEvent.click(screen.getByText('Round'));

    // result
    expect((selectActivePage(store.getState()).nodes.settingsLinePick as TLineNode).startPoint).toBe(LineEndpoint.round);
  });

  it('should move the stroke to the side picked in Position', () => {
    // mock
    store.dispatch(addNodes({ nodes: [{ ...line, id: 'settingsLineAlign' }], rootIds: ['settingsLineAlign'] }));
    store.dispatch(setSelection(['settingsLineAlign']));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <LineStrokeSettings />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // action
    fireEvent.click(screen.getByText('Center'));
    fireEvent.click(screen.getByText('Inside'));

    // result
    expect((selectActivePage(store.getState()).nodes.settingsLineAlign as TLineNode).strokeAlign).toBe(StrokeAlign.inside);
  });

  it('should hide the endpoints and lock the position of a brush stroke', () => {
    // mock
    store.dispatch(
      addNodes({ nodes: [{ ...line, id: 'settingsLineBrush', strokeMode: StrokeMode.brush }], rootIds: ['settingsLineBrush'] }),
    );
    store.dispatch(setSelection(['settingsLineBrush']));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <LineStrokeSettings />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.queryByText('Start point')).not.toBeInTheDocument();
    expect(screen.getByText('Center').closest('button')).toBeDisabled();
  });
});
