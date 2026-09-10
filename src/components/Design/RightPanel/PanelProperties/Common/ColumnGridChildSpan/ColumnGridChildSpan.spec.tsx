import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnGridChildSpan from './ColumnGridChildSpan';
import { TooltipProvider } from 'shared';

// store
import { addNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderColumnGridChildSpan = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnGridChildSpan />
      </TooltipProvider>
    </Provider>,
  );

const addFrame = (layoutMode?: LayoutMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 200,
      layoutMode,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangle = (): string => {
  store.dispatch(
    addNode({
      fill: '#00ff00',
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const selectGridChild = (): void => {
  const frameId = addFrame(LayoutMode.grid);
  const rectangleId = addRectangle();

  store.dispatch(moveNodes({ nodeIds: [rectangleId], targetIndex: 0, targetParentId: frameId }));
  store.dispatch(setSelection([rectangleId]));
};

describe('ColumnGridChildSpan snapshots', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the column and row span fields for a grid child', () => {
    // mock
    selectGridChild();

    // before
    const { asFragment } = renderColumnGridChildSpan();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnGridChildSpan behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render nothing when the selection is not a grid child', () => {
    // before
    const { container } = renderColumnGridChildSpan();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the Column span and Row span fields for a grid child', () => {
    // mock
    selectGridChild();

    // before
    renderColumnGridChildSpan();

    // result
    expect(screen.getByText('Column span')).toBeInTheDocument();
    expect(screen.getByText('Row span')).toBeInTheDocument();
    expect(screen.getByLabelText('Column span')).toBeInTheDocument();
    expect(screen.getByLabelText('Row span')).toBeInTheDocument();
  });
});
