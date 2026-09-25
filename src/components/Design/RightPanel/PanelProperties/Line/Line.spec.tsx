import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Line from './Line';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

const line: TLineNode = {
  endPoint: LineEndpoint.triangleArrow,
  height: 0,
  id: 'panelLine',
  name: 'Line',
  parentId: null,
  rotation: 0,
  startPoint: LineEndpoint.none,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 120,
  x: 10,
  y: 20,
};

describe('Line behaviors', () => {
  it('should show the line sections with the endpoints, a locked height and no fill or corner radius', () => {
    // mock
    store.dispatch(addNodes({ nodes: [line], rootIds: [line.id] }));
    store.dispatch(setSelection([line.id]));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <Line />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByLabelText('Height')).toBeDisabled();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.queryByText('Corner radius')).not.toBeInTheDocument();
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(screen.getByText('Triangle arrow')).toBeInTheDocument();
    expect(screen.getByText('Effects')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();
  });
});
