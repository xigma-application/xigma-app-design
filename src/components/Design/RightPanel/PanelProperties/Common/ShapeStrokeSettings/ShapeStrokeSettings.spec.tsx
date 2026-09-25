import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ShapeStrokeSettings from './ShapeStrokeSettings';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

describe('ShapeStrokeSettings behaviors', () => {
  it('should show the position and weight of the stroke with the settings button', () => {
    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <ShapeStrokeSettings type={NodeType.ellipse} />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByLabelText('Advanced stroke settings')).toBeInTheDocument();
  });

  it('should show Mixed for different weights', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [],
            height: 10,
            id: 'mixedStrokeA',
            name: 'A',
            parentId: null,
            rotation: 0,
            strokeWidth: 1,
            type: NodeType.ellipse,
            width: 10,
            x: 0,
            y: 0,
          },
          {
            fills: [],
            height: 10,
            id: 'mixedStrokeB',
            name: 'B',
            parentId: null,
            rotation: 0,
            strokeWidth: 4,
            type: NodeType.ellipse,
            width: 10,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['mixedStrokeA', 'mixedStrokeB'],
      }),
    );
    store.dispatch(setSelection(['mixedStrokeA', 'mixedStrokeB']));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <ShapeStrokeSettings type={NodeType.ellipse} />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByDisplayValue('Mixed')).toBeInTheDocument();
  });

  it('should show the shared weight of one selected ellipse', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [],
            height: 10,
            id: 'singleStroke',
            name: 'A',
            parentId: null,
            rotation: 0,
            strokeWidth: 3,
            type: NodeType.ellipse,
            width: 10,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['singleStroke'],
      }),
    );
    store.dispatch(setSelection(['singleStroke']));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <ShapeStrokeSettings type={NodeType.ellipse} />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });
});
