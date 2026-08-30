// types
import { TTreeDragState } from '../../../types';
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { handleMouseUp } from '../handleMouseUp';

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0, parentItem: TItem | null = null): TTreeRow<TItem> => ({
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem,
});

const buildDragState = (overrides: Partial<TTreeDragState> = {}): TTreeDragState => ({
  armedRef: { current: { depth: 0, indices: [0], startY: 0 } },
  dropDepth: 0,
  insertionIndex: 1,
  setDropDepth: vi.fn(),
  setInsertionIndex: vi.fn(),
  ...overrides,
});

describe('handleMouseUp', () => {
  it('should call onReorder with the resolved target once dropped in a new slot', () => {
    // mock
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: 0 } }, insertionIndex: 2 });

    // action
    handleMouseUp(rows, dragState, onReorder);

    // result
    expect(onReorder).toHaveBeenCalledWith([{ id: 'a' }], null, 1);
  });

  it('should not call onReorder when dropped back in the original slot', () => {
    // mock
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('b')];
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: 0 } }, insertionIndex: 0 });

    // action
    handleMouseUp(rows, dragState, onReorder);

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should no-op when no drag was armed', () => {
    // mock
    const onReorder = vi.fn();
    const dragState = buildDragState({ armedRef: { current: null } });

    // action
    handleMouseUp([buildRow('a')], dragState, onReorder);

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should not treat a same-slot drop as a no-op once the drop depth changed', () => {
    // mock — a nested row dropped roughly back onto its own slot, but shifted out to depth 0
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('b', 1, { id: 'a' })];
    const dragState = buildDragState({
      armedRef: { current: { depth: 1, indices: [1], startY: 0 } },
      dropDepth: 0,
      insertionIndex: 1,
    });

    // action
    handleMouseUp(rows, dragState, onReorder);

    // result
    expect(onReorder).toHaveBeenCalledTimes(1);
  });

  it('should always reset the armed ref and clear the insertion index and drop depth', () => {
    // mock
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: 0 } }, insertionIndex: 0 });

    // action
    handleMouseUp([buildRow('a')], dragState, undefined);

    // result
    expect(dragState.armedRef.current).toBeNull();
    expect(dragState.setInsertionIndex).toHaveBeenCalledWith(null);
    expect(dragState.setDropDepth).toHaveBeenCalledWith(0);
  });
});
