// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { armSmartSelectionGapOnPointerDown } from '../armSmartSelectionGapOnPointerDown';

const getSmartSelectionGapHandleAtPointMock = vi.fn();
const armSmartSelectionGapDragMock = vi.fn();

vi.mock('../../../../../../utils/getSmartSelectionGapHandleAtPoint', () => ({
  getSmartSelectionGapHandleAtPoint: (...args: unknown[]): unknown => getSmartSelectionGapHandleAtPointMock(...args),
}));
vi.mock('../../armSmartSelectionGapDrag', () => ({
  armSmartSelectionGapDrag: (...args: unknown[]): void => armSmartSelectionGapDragMock(...args),
}));

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const canvasRefs = { smartSelection: { gapDragRef: { current: null } } };
const point = { x: 10, y: 20 };
const smartSelectionNodes = [] as never[];
const viewport = { x: 0, y: 0, zoom: 1 };

describe('armSmartSelectionGapOnPointerDown', () => {
  beforeEach(() => {
    getSmartSelectionGapHandleAtPointMock.mockReset();
    armSmartSelectionGapDragMock.mockClear();
  });

  it('should arm the drag and return true when a gap handle is hit', () => {
    // mock
    const layout = { gaps: [], nodes: [], type: 'row' };
    const midpoint = { x: 75, y: 25 };

    getSmartSelectionGapHandleAtPointMock.mockReturnValue({ axis: 'x', gapIndex: 1, gapValue: 50, layout, midpoint });

    // before
    const result = armSmartSelectionGapOnPointerDown({ canvas, canvasRefs, event, point, smartSelectionNodes, viewport } as never);

    // result
    expect(result).toBe(true);
    expect(armSmartSelectionGapDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.smartSelection.gapDragRef,
      layout,
      'x',
      1,
      50,
      point,
    );
  });

  it('should return undefined and not arm anything when no gap handle is hit', () => {
    // mock
    getSmartSelectionGapHandleAtPointMock.mockReturnValue(null);

    // before
    const result = armSmartSelectionGapOnPointerDown({ canvas, canvasRefs, event, point, smartSelectionNodes, viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(armSmartSelectionGapDragMock).not.toHaveBeenCalled();
  });

  it('should never hit-test or arm a gap drag for a selection that belongs to an auto-layout frame, even where a gap handle would otherwise land', () => {
    // mock — a real auto-layout frame with one real child, so the resolver's own store lookup of
    // the child's parent resolves to something genuinely auto-layout
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#fff',
        height: 100,
        layoutMode: LayoutMode.vertical,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const frameId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    store.dispatch(
      addNode({
        fill: '#000',
        height: 20,
        name: 'Rectangle',
        parentId: frameId,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const rectId = selectActivePage(store.getState()).rootOrder.at(-1) as string;
    const rect = selectActivePage(store.getState()).nodes[rectId];

    getSmartSelectionGapHandleAtPointMock.mockReturnValue({
      axis: 'x',
      gapIndex: 1,
      gapValue: 50,
      layout: { gaps: [], nodes: [], type: 'row' },
      midpoint: { x: 75, y: 25 },
    });

    // action
    const result = armSmartSelectionGapOnPointerDown({
      canvas,
      canvasRefs,
      event,
      point,
      smartSelectionNodes: [rect],
      viewport,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(getSmartSelectionGapHandleAtPointMock).not.toHaveBeenCalled();
    expect(armSmartSelectionGapDragMock).not.toHaveBeenCalled();

    // cleanup
    store.dispatch(deleteNode(frameId));
  });
});
