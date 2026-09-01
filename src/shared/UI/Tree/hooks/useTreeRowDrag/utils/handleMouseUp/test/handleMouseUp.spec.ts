// types
import { TTreeDragState } from '../../../types';
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { handleMouseUp } from '../handleMouseUp';

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0, parentItem: TItem | null = null): TTreeRow<TItem> => ({
  canHaveChildren: false,
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem,
});

const buildDragState = (overrides: Partial<TTreeDragState> = {}): TTreeDragState => ({
  armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } },
  dropDepth: 0,
  dropInsideIndex: null,
  insertionIndex: 1,
  onSpringLoadExpandRef: { current: undefined },
  setDropDepth: vi.fn(),
  setDropInsideIndex: vi.fn(),
  setInsertionIndex: vi.fn(),
  springLoadRef: { current: null },
  ...overrides,
});

describe('handleMouseUp', () => {
  it('should call onReorder with the resolved target once dropped in a new slot', () => {
    // mock
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } }, insertionIndex: 2 });

    // action
    handleMouseUp(rows, dragState, onReorder);

    // result
    expect(onReorder).toHaveBeenCalledWith([{ id: 'a' }], null, 1);
  });

  it('should not call onReorder when dropped back in the original slot', () => {
    // mock
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('b')];
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } }, insertionIndex: 0 });

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
      armedRef: { current: { depth: 1, ids: ['b'], indices: [1], startY: 0 } },
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
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } }, insertionIndex: 0 });

    // action
    handleMouseUp([buildRow('a')], dragState, undefined);

    // result
    expect(dragState.armedRef.current).toBeNull();
    expect(dragState.setInsertionIndex).toHaveBeenCalledWith(null);
    expect(dragState.setDropDepth).toHaveBeenCalledWith(0);
    expect(dragState.setDropInsideIndex).toHaveBeenCalledWith(null);
  });

  it('should nest the dragged items as the first child of the drop-inside container', () => {
    // mock
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('g')];
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } },
      dropInsideIndex: 1,
    });

    // action
    handleMouseUp(rows, dragState, onReorder);

    // result
    expect(onReorder).toHaveBeenCalledWith([{ id: 'a' }], { id: 'g' }, 0);
  });

  it('should ignore a drop-inside that resolves to no dragged rows', () => {
    // mock
    const onReorder = vi.fn();
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['gone'], indices: [9], startY: 0 } },
      dropInsideIndex: 1,
    });

    // action
    handleMouseUp([buildRow('a'), buildRow('g')], dragState, onReorder);

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should not call onReorder when the drop cannot be resolved to a single source parent', () => {
    // mock — the dragged indices span two different parents, so resolveTreeDrop bails
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('b', 1, { id: 'a' }), buildRow('c')];
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['a', 'b'], indices: [0, 1], startY: 0 } },
      insertionIndex: 3,
    });

    // action
    handleMouseUp(rows, dragState, onReorder);

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should ignore a drop-inside whose container index is out of range', () => {
    // mock
    const onReorder = vi.fn();
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } },
      dropInsideIndex: 5,
    });

    // action
    handleMouseUp([buildRow('a')], dragState, onReorder);

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should cancel any pending spring-load on release', () => {
    // spy
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } },
      springLoadRef: { current: { itemId: 'g', timerId: 77 } },
    });

    // action
    handleMouseUp([buildRow('a')], dragState, vi.fn());

    // result
    expect(clearTimeoutSpy).toHaveBeenCalledWith(77);
  });
});
