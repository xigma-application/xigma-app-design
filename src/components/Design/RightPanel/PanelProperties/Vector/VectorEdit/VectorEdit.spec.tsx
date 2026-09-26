import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEdit from './VectorEdit';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const renderVectorEdit = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <VectorEdit />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'edit-panel-vector' })], rootIds: ['edit-panel-vector'] }));
  store.dispatch(setSelection(['edit-panel-vector']));
  store.dispatch(setVectorEditingNodeIds(['edit-panel-vector']));
});

describe('VectorEdit snapshots', () => {
  it('should render the Vector section, fill and stroke', () => {
    // before
    const { asFragment } = renderVectorEdit();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorEdit behaviors', () => {
  it('should render alignment, position, mirroring and corner radius under the Vector title', () => {
    // before
    renderVectorEdit();

    // result
    expect(screen.getByText('Vector')).toBeInTheDocument();
    expect(screen.getByText('Alignment')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'X position' })).toBeInTheDocument();
    expect(screen.getByText('Mirroring')).toBeInTheDocument();
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
  });

  it('should render the fill and stroke sections and nothing after them', () => {
    // before
    renderVectorEdit();

    // result
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(screen.queryByText('Export')).not.toBeInTheDocument();
    expect(screen.queryByText('Effects')).not.toBeInTheDocument();
  });
});
