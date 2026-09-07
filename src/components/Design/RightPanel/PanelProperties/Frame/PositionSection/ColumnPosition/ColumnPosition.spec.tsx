import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnPosition from './ColumnPosition';
import { TooltipProvider } from 'shared';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical, LayoutMode, NodeType } from 'types/design/enums';

const renderColumnPosition = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnPosition />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnPosition snapshots', () => {
  it('should render the X and Y fields', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    const { asFragment } = renderColumnPosition();

    // result
    expect(asFragment()).toMatchSnapshot();

    // cleanup
    store.dispatch(setSelection([]));
  });
});

describe('ColumnPosition behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the row label', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnPosition();

    // result
    expect(screen.getByText('Position')).toBeInTheDocument();
  });

  it('should show the current x and y values', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnPosition();

    // result
    expect(screen.getByLabelText('X position')).toHaveValue(-1010);
    expect(screen.getByLabelText('Y position')).toHaveValue(-810);
  });

  it('should update the frame x when the X field is committed', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnPosition();
    const input = screen.getByLabelText('X position');

    // action
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.blur(input);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ x: 42 });
  });

  it('should disable both inputs when the selected frame sits in a managed-layout parent', () => {
    // mock
    const parentId = addFrameNode(0, 0);

    store.dispatch(updateNode({ changes: { height: 300, layoutMode: LayoutMode.vertical, width: 400 }, id: parentId }));

    const childId = addFrameNode(20, 20);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    // before
    renderColumnPosition();

    // result
    expect(screen.getByLabelText('X position')).toBeDisabled();
    expect(screen.getByLabelText('Y position')).toBeDisabled();
  });

  const nestSelectedChild = (): string => {
    const parentId = addFrameNode(0, 0);
    const childId = addFrameNode(20, 20);

    store.dispatch(updateNode({ changes: { height: 300, width: 400 }, id: parentId }));
    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    return childId;
  };

  it('should not render the constraints toggle for a root frame with no parent', () => {
    const frameId = addFrameNode(0, 0);

    store.dispatch(setSelection([frameId]));
    renderColumnPosition();

    expect(screen.queryByLabelText('Constraints')).not.toBeInTheDocument();
  });

  it('should reveal the constraints panel when the toggle is clicked', () => {
    nestSelectedChild();
    renderColumnPosition();

    expect(screen.queryByText('Constraints')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Constraints'));

    expect(screen.getByText('Constraints')).toBeInTheDocument();
  });

  it('should keep showing the real coordinate but disable an axis input once a constraint is set on it', () => {
    const childId = nestSelectedChild();

    store.dispatch(
      updateNode({
        changes: { alignment: { horizontal: AlignmentHorizontal.center, vertical: AlignmentVertical.top } },
        id: childId,
      }),
    );
    renderColumnPosition();

    const xInput = screen.getByLabelText('X position');
    const yInput = screen.getByLabelText('Y position');

    // setting the constraint alone never moves the child — still its original local position
    expect(xInput).toHaveValue(20);
    expect(xInput).toBeDisabled();
    expect(yInput).toHaveValue(20);
    expect(yInput).toBeDisabled();
  });
});
