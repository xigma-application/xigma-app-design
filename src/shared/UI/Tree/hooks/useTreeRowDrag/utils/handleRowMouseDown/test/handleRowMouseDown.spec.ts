import { MouseEvent as ReactMouseEvent } from 'react';

// types
import { TArmedRowDrag, TTreeDragState } from '../../../types';
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { handleRowMouseDown } from '../handleRowMouseDown';

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0): TTreeRow<TItem> => ({
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem: null,
});

const buildDragState = (): TTreeDragState => ({
  armedRef: { current: null },
  dropDepth: 0,
  insertionIndex: null,
  setDropDepth: vi.fn(),
  setInsertionIndex: vi.fn(),
});

const mouseDownEvent = (button: number, clientY: number): ReactMouseEvent<HTMLElement> =>
  ({ button, clientY }) as ReactMouseEvent<HTMLElement>;

describe('handleRowMouseDown', () => {
  it('should arm the drag with the row depth, dragged indices and start Y on a primary-button press', () => {
    // mock
    const rows = [buildRow('a', 1), buildRow('b')];
    const dragState = buildDragState();

    // action
    handleRowMouseDown(0, mouseDownEvent(0, 42), rows, undefined, dragState);

    // result
    expect(dragState.armedRef.current).toEqual<TArmedRowDrag>({ depth: 1, indices: [0], startY: 42 });
  });

  it('should not arm the drag on a non-primary mouse button', () => {
    // mock
    const rows = [buildRow('a')];
    const dragState = buildDragState();

    // action
    handleRowMouseDown(0, mouseDownEvent(2, 0), rows, undefined, dragState);

    // result
    expect(dragState.armedRef.current).toBeNull();
  });

  it('should arm every selected row together when starting the drag on a row that is part of the current multi-selection', () => {
    // mock
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];
    const isRowSelected = (item: TItem): boolean => item.id === 'a' || item.id === 'b';
    const dragState = buildDragState();

    // action
    handleRowMouseDown(0, mouseDownEvent(0, 0), rows, isRowSelected, dragState);

    // result
    expect(dragState.armedRef.current?.indices).toEqual([0, 1]);
  });
});
