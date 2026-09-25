import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LineHeader from './LineHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderHeader = (): void => {
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <LineHeader />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );
};

const addLines = (ids: string[]): void => {
  store.dispatch(
    addNodes({
      nodes: ids.map((id) => ({
        height: 0,
        id,
        name: id,
        parentId: null,
        rotation: 0,
        strokes: [],
        type: NodeType.line,
        width: 10,
        x: 0,
        y: 0,
      })),
      rootIds: ids,
    }),
  );
};

describe('LineHeader behaviors', () => {
  it('should render the Line label with the component button and the more actions menu', () => {
    // mock
    addLines(['headerLine']);
    store.dispatch(setSelection(['headerLine']));

    // before
    renderHeader();

    // result
    expect(screen.getByText('Line')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
  });

  it('should hide the component button for several lines', () => {
    // mock
    addLines(['headerLineA', 'headerLineB']);
    store.dispatch(setSelection(['headerLineA', 'headerLineB']));

    // before
    renderHeader();

    // result
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
  });
});
