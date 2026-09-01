import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useLayersExpansion } from '../useLayersExpansion';

// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useLayersExpansion', () => {
  it('should start with an empty set and hasExpanded false', () => {
    // before
    const { result } = renderHook(() => useLayersExpansion(), { wrapper });

    // result
    expect(result.current.expandedIds.size).toBe(0);
    expect(result.current.hasExpanded).toBe(false);
  });

  it('should report hasExpanded true once onExpandedIdsChange receives a non-empty set', () => {
    // before
    const { rerender, result } = renderHook(() => useLayersExpansion(), { wrapper });

    // action
    act(() => result.current.onExpandedIdsChange(new Set(['group-1'])));
    rerender();

    // result
    expect([...result.current.expandedIds]).toEqual(['group-1']);
    expect(result.current.hasExpanded).toBe(true);
  });

  it('should reset expandedIds to empty when collapseAll is called', () => {
    // before
    const { rerender, result } = renderHook(() => useLayersExpansion(), { wrapper });
    act(() => result.current.onExpandedIdsChange(new Set(['group-1', 'group-2'])));
    rerender();

    // action
    act(() => result.current.collapseAll());
    rerender();

    // result
    expect(result.current.expandedIds.size).toBe(0);
    expect(result.current.hasExpanded).toBe(false);
  });

  it('should drop an expanded node from expandedIds once it gets deleted from the scene, so a fully emptied tree reports hasExpanded false', () => {
    // mock
    act(() => {
      store.dispatch(
        addNode({ childIds: [], height: 10, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }),
      );
    });
    const [groupId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    // before
    const { rerender, result } = renderHook(() => useLayersExpansion(), { wrapper });
    act(() => result.current.onExpandedIdsChange(new Set([groupId])));
    rerender();
    expect(result.current.hasExpanded).toBe(true);

    // action — delete the expanded group itself
    act(() => store.dispatch(deleteNode(groupId)));
    rerender();

    // result
    expect(result.current.expandedIds.size).toBe(0);
    expect(result.current.hasExpanded).toBe(false);

    // after
    store.dispatch(setSelection([]));
  });
});
