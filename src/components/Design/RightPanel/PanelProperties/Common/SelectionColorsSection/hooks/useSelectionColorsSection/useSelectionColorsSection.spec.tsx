import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useSelectionColorsSection } from './useSelectionColorsSection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 100,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [],
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useSelectionColorsSection', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should return no groups and no open group key when nothing is selected', () => {
    // before
    const { result } = renderHook(() => useSelectionColorsSection(), { wrapper });

    // result
    expect(result.current.groups).toEqual([]);
    expect(result.current.openGroupKey).toBeNull();
  });

  it('should track which group key is open and clear it when told it closed', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderHook(() => useSelectionColorsSection(), { wrapper });
    const group = result.current.groups[0];

    // action
    act(() => result.current.onOpenChange(group, true));

    // result
    expect(result.current.openGroupKey).toBe(group.key);

    // action
    act(() => result.current.onOpenChange(group, false));

    // result
    expect(result.current.openGroupKey).toBeNull();
  });

  it('should not clear the open group key when a different, already-closed group reports closing', () => {
    // mock
    const childId = addFrameNode();

    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderHook(() => useSelectionColorsSection(), { wrapper });
    const group = result.current.groups[0];

    // action
    act(() => result.current.onOpenChange(group, true));
    act(() => result.current.onOpenChange({ ...group, key: 'unrelated-key' }, false));

    // result
    expect(result.current.openGroupKey).toBe(group.key);
  });

  it('should keep a color edited live while its row is open from merging into a matching row, until it closes', () => {
    // mock — a red frame fill and a blue child fill; editing the frame's fill to blue live would otherwise merge them instantly
    const childId = addRectangleNode({ fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }] });
    const frameId = addFrameNode({ childIds: [childId] });

    store.dispatch(setSelection([frameId]));

    // before
    const { rerender, result } = renderHook(() => useSelectionColorsSection(), { wrapper });
    const redGroup = result.current.groups.find((group) => group.paint.type === 'solid' && group.paint.color === '#ff0000')!;

    act(() => result.current.onOpenChange(redGroup, true));

    // action — commit a matching blue value live, from inside the still-open red row
    act(() => result.current.onChange(redGroup.occurrences, { color: '#0000ff', opacity: 100, type: 'solid' }));
    rerender();

    // result — the store already reflects the live edit, but the list keeps it as its own row under the frozen open key
    expect(result.current.groups).toHaveLength(2);
    const stillOpenGroup = result.current.groups.find((group) => group.key === redGroup.key)!;

    expect(stillOpenGroup.paint).toEqual({ color: '#0000ff', opacity: 100, type: 'solid' });

    // action — closing releases the freeze and the two rows merge, since they now share the exact same color
    act(() => result.current.onOpenChange(stillOpenGroup, false));
    rerender();

    expect(result.current.openGroupKey).toBeNull();
    expect(result.current.groups).toHaveLength(1);
  });
});
