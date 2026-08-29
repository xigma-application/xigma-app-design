import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import LayersTree from './LayersTree';

// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

const renderLayersTree = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <LayersTree />
    </Provider>,
  );

describe('LayersTree', () => {
  let idA: string;
  let idB: string;

  beforeEach(() => {
    stubVirtualizerViewport(5000);
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
  });

  afterEach(() => {
    store.dispatch(deleteNode(idA));
    store.dispatch(deleteNode(idB));
    store.dispatch(setSelection([]));
    vi.restoreAllMocks();
  });

  it('should render one row per node in the active page', () => {
    // before
    renderLayersTree();

    // result
    expect(screen.getByText('Frame A')).toBeInTheDocument();
    expect(screen.getByText('Frame B')).toBeInTheDocument();
  });

  it('should reorder the active page rootOrder when a row is dragged past another', () => {
    // before
    renderLayersTree();
    const rowA = screen.getByText('Frame A').closest('[class*="Tree__row"]')!;
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    const indexA = rootOrderBefore.indexOf(idA);

    // action — drag row A down past row B
    fireEvent.mouseDown(rowA, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 100 });
    fireEvent.mouseUp(document);

    // result
    expect(selectActivePage(store.getState()).rootOrder.indexOf(idA)).not.toBe(indexA);
  });
});
