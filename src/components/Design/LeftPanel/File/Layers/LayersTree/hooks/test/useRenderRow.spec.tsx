import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { render, renderHook, screen } from '@testing-library/react';

// hooks
import { useRenderRow } from '../useRenderRow';

// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TTreeRow } from 'shared/UI/Tree/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useRenderRow', () => {
  let idA: string;

  beforeEach(() => {
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Frame A',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    [idA] = selectActivePage(store.getState()).rootOrder.slice(-1);
  });

  afterEach(() => {
    store.dispatch(deleteNode(idA));
    store.dispatch(setSelection([]));
  });

  it('should render the row for the given tree row', () => {
    // mock
    const node = selectActivePage(store.getState()).nodes[idA];
    const row: TTreeRow<typeof node> = { depth: 0, hasChildren: false, isExpanded: false, item: node, parentItem: null };

    // before
    const { result } = renderHook(() => useRenderRow(), { wrapper });
    render(<Provider store={store}>{result.current(row, vi.fn())}</Provider>);

    // result
    expect(screen.getByText('Frame A')).toBeInTheDocument();
  });

  it('should forward the given onToggleExpand callback to the row', () => {
    // mock
    const node = selectActivePage(store.getState()).nodes[idA];
    const row: TTreeRow<typeof node> = { depth: 0, hasChildren: false, isExpanded: false, item: node, parentItem: null };
    const onToggleExpand = vi.fn();

    // before
    const { result } = renderHook(() => useRenderRow(), { wrapper });
    const rendered = result.current(row, onToggleExpand) as { props: { onToggleExpand: TFunc } };

    // action
    rendered.props.onToggleExpand();

    // result
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });
});
