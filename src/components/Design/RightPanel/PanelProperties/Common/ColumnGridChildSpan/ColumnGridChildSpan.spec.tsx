import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnGridChildSpan from './ColumnGridChildSpan';
import { TooltipProvider } from 'shared';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

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

const readChild = (id: string): TBoxSceneNode => selectActivePage(store.getState()).nodes[id] as TBoxSceneNode;

let gridChildId = '';

const selectGridChild = (): void => {
  const frameId = addFrame(LayoutMode.grid);
  const rectangleId = addRectangle();

  store.dispatch(moveNodes({ nodeIds: [rectangleId], targetIndex: 0, targetParentId: frameId }));
  store.dispatch(updateNode({ changes: { gridColumnCount: 3, gridRowCount: 3 }, id: frameId }));
  store.dispatch(setSelection([rectangleId]));

  gridChildId = rectangleId;
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

  it('should commit a typed span on blur', () => {
    // mock
    selectGridChild();
    renderColumnGridChildSpan();

    // action
    const input = screen.getByLabelText('Column span');

    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.blur(input);

    // result
    expect(readChild(gridChildId).gridColumnSpan).toBe(2);
  });

  it('should revert the field and skip the commit for a span past the current grid', () => {
    // mock
    selectGridChild();
    renderColumnGridChildSpan();

    // action
    const input = screen.getByLabelText('Row span');

    fireEvent.change(input, { target: { value: '9' } });
    fireEvent.blur(input);

    // result
    expect(readChild(gridChildId).gridRowSpan).toBeUndefined();
    expect(screen.getByLabelText('Row span')).toHaveValue('1');
  });

  it('should commit a typed Row span on blur', () => {
    // mock
    selectGridChild();
    renderColumnGridChildSpan();

    // action
    const input = screen.getByLabelText('Row span');

    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.blur(input);

    // result
    expect(readChild(gridChildId).gridRowSpan).toBe(2);
  });

  it('should revert the Column span field when the typed value overshoots the grid', () => {
    // mock
    selectGridChild();
    renderColumnGridChildSpan();

    // action
    const input = screen.getByLabelText('Column span');

    fireEvent.change(input, { target: { value: '9' } });
    fireEvent.blur(input);

    // result
    expect(readChild(gridChildId).gridColumnSpan).toBeUndefined();
    expect(screen.getByLabelText('Column span')).toHaveValue('1');
  });

  it('should commit each step of a Column span scrub drag', () => {
    // mock
    selectGridChild();
    const { container } = renderColumnGridChildSpan();

    // action — the first scrubber is the Column span icon
    const scrubber = container.querySelectorAll('[class*="ScrubbableInput"]')[0] as HTMLElement;
    const move = new MouseEvent('mousemove', { bubbles: true, cancelable: true });

    Object.defineProperty(move, 'movementX', { value: 60 });
    fireEvent.mouseDown(scrubber, { clientX: 0, clientY: 0 });
    window.dispatchEvent(move);
    fireEvent.mouseUp(scrubber);

    // result — dragged right, so the span grew (clamped to the 3-column grid)
    expect(readChild(gridChildId).gridColumnSpan).toBeGreaterThan(1);
  });

  it('should commit a Row span scrub drag', () => {
    // mock — a 3x3 grid so the row scrubber has room to move
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    store.dispatch(moveNodes({ nodeIds: [rectangleId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(updateNode({ changes: { gridColumnCount: 3, gridRowCount: 3 }, id: frameId }));
    store.dispatch(setSelection([rectangleId]));

    const { container } = renderColumnGridChildSpan();

    // action — the second scrubber is the Row span icon
    const scrubber = container.querySelectorAll('[class*="ScrubbableInput"]')[1] as HTMLElement;
    const move = new MouseEvent('mousemove', { bubbles: true, cancelable: true });

    Object.defineProperty(move, 'movementX', { value: 80 });
    fireEvent.mouseDown(scrubber, { clientX: 0, clientY: 0 });
    window.dispatchEvent(move);
    fireEvent.mouseUp(scrubber);

    // result
    expect(readChild(rectangleId).gridRowSpan).toBeGreaterThan(1);
  });

  it('should not dispatch when a blur re-commits the span value unchanged', () => {
    // mock
    selectGridChild();
    renderColumnGridChildSpan();

    const before = readChild(gridChildId);
    const input = screen.getByLabelText('Column span');

    // action — commit the value the field already shows
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.blur(input);

    // result — still no explicit span written
    expect(readChild(gridChildId).gridColumnSpan).toBe(before.gridColumnSpan);
  });
});
