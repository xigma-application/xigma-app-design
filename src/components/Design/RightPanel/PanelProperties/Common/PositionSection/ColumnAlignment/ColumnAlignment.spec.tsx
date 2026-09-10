import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnAlignment from './ColumnAlignment';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderColumnAlignment = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnAlignment />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (parentId: string | null): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnAlignment snapshots', () => {
  it('should render the horizontal and vertical alignment button groups', () => {
    // before
    const { asFragment } = renderColumnAlignment();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnAlignment behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the row label', () => {
    // before
    renderColumnAlignment();

    // result
    expect(screen.getByText('Alignment')).toBeInTheDocument();
  });

  it('should render every horizontal and vertical alignment button', () => {
    // before
    renderColumnAlignment();

    // result
    expect(screen.getByLabelText('Align left')).toBeInTheDocument();
    expect(screen.getByLabelText('Align horizontal centers')).toBeInTheDocument();
    expect(screen.getByLabelText('Align right')).toBeInTheDocument();
    expect(screen.getByLabelText('Align top')).toBeInTheDocument();
    expect(screen.getByLabelText('Align vertical centers')).toBeInTheDocument();
    expect(screen.getByLabelText('Align bottom')).toBeInTheDocument();
  });

  it('should disable every button when the selected frame has no parent', () => {
    // mock
    const frameId = addFrameNode(null);
    store.dispatch(setSelection([frameId]));

    // before
    renderColumnAlignment();

    // result
    expect(screen.getByLabelText('Align left')).toBeDisabled();
  });

  it('should enable every button when the selected frame has a parent', () => {
    // mock
    const parentId = addFrameNode(null);
    const childId = addFrameNode(parentId);
    store.dispatch(setSelection([childId]));

    // before
    renderColumnAlignment();

    // result
    expect(screen.getByLabelText('Align left')).not.toBeDisabled();
  });

  it('should write the alignment axis to the store when a button is clicked', () => {
    // mock
    const parentId = addFrameNode(null);
    const childId = addFrameNode(parentId);
    store.dispatch(setSelection([childId]));

    // before
    renderColumnAlignment();
    fireEvent.click(screen.getByLabelText('Align horizontal centers'));

    // result
    expect((selectActivePage(store.getState()).nodes[childId] as { alignment?: unknown }).alignment).toEqual({ horizontal: 'center' });
  });

  it('should mark the active alignment button as pressed and stay set on a repeated click', () => {
    // mock
    const parentId = addFrameNode(null);
    const childId = addFrameNode(parentId);
    store.dispatch(setSelection([childId]));

    // before
    renderColumnAlignment();
    fireEvent.click(screen.getByLabelText('Align right'));

    // result
    expect(screen.getByLabelText('Align right')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByLabelText('Align right'));
    expect((selectActivePage(store.getState()).nodes[childId] as { alignment?: unknown }).alignment).toEqual({ horizontal: 'right' });
  });

  it('should move the child to the anchor position when a button is clicked', () => {
    // mock
    const parentId = addFrameNode(null);

    store.dispatch(updateNode({ changes: { height: 200, width: 200 }, id: parentId }));

    const childId = addFrameNode(parentId);

    store.dispatch(setSelection([childId]));

    // before
    renderColumnAlignment();
    fireEvent.click(screen.getByLabelText('Align right'));

    // result — 200 (parent width) - 20 (child width)
    expect((selectActivePage(store.getState()).nodes[childId] as { x: number }).x).toBe(180);
  });
});
