import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Slice from './Slice';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSliceNode } from 'types/design/types';

const slice: TSliceNode = {
  height: 100,
  id: 'panelSlice',
  name: 'Slice (1)',
  parentId: null,
  rotation: 0,
  type: NodeType.slice,
  width: 200,
  x: 10,
  y: 20,
};

describe('Slice behaviors', () => {
  it('should show position, dimensions and an export row ready for the slice, without paint sections', () => {
    // mock
    store.dispatch(addNodes({ nodes: [slice], rootIds: [slice.id] }));
    store.dispatch(setSelection([slice.id]));

    // before
    render(
      <Provider store={store}>
        <CanvasRefsProvider>
          <TooltipProvider>
            <Slice />
          </TooltipProvider>
        </CanvasRefsProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Rotation')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Export Slice (1)')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();
    expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
  });
});
