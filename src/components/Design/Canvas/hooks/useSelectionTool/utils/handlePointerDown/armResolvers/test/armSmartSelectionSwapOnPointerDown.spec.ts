// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { armSmartSelectionSwapOnPointerDown } from '../armSmartSelectionSwapOnPointerDown';

const getSmartSelectionSwapHandleAtPointMock = vi.fn();
const armSmartSelectionSwapDragMock = vi.fn();

vi.mock('../../../../../../utils/getSmartSelectionSwapHandleAtPoint', () => ({
  getSmartSelectionSwapHandleAtPoint: (...args: unknown[]): unknown => getSmartSelectionSwapHandleAtPointMock(...args),
}));
vi.mock('../../armSmartSelectionSwapDrag', () => ({
  armSmartSelectionSwapDrag: (...args: unknown[]): void => armSmartSelectionSwapDragMock(...args),
}));

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const canvasRefs = { smartSelection: { swapDragRef: { current: null } } };
const point = { x: 10, y: 20 };
const smartSelectionNodes = [] as never[];
const viewport = { x: 0, y: 0, zoom: 1 };

describe('armSmartSelectionSwapOnPointerDown', () => {
  beforeEach(() => {
    getSmartSelectionSwapHandleAtPointMock.mockReset();
    armSmartSelectionSwapDragMock.mockClear();
  });

  it('should arm the swap drag with the hit layout and slot index, and return true, when a swap handle is hit', () => {
    // mock
    const layout = { gaps: [], nodes: [], type: 'row' };

    getSmartSelectionSwapHandleAtPointMock.mockReturnValue({ center: { x: 25, y: 25 }, index: 2, layout });

    // before
    const result = armSmartSelectionSwapOnPointerDown({ canvas, canvasRefs, event, point, smartSelectionNodes, viewport } as never);

    // result
    expect(result).toBe(true);
    expect(armSmartSelectionSwapDragMock).toHaveBeenCalledWith(canvas, event, canvasRefs.smartSelection.swapDragRef, layout, 2, point);
  });

  it('should return undefined and not arm anything when no swap handle is hit', () => {
    // mock
    getSmartSelectionSwapHandleAtPointMock.mockReturnValue(null);

    // before
    const result = armSmartSelectionSwapOnPointerDown({ canvas, canvasRefs, event, point, smartSelectionNodes, viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(armSmartSelectionSwapDragMock).not.toHaveBeenCalled();
  });

  it('should never hit-test or arm a swap drag for a selection that belongs to an auto-layout frame, even where a swap handle would otherwise land', () => {
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

    getSmartSelectionSwapHandleAtPointMock.mockReturnValue({
      center: { x: 25, y: 25 },
      index: 0,
      layout: { gaps: [], nodes: [], type: 'row' },
    });

    // action
    const result = armSmartSelectionSwapOnPointerDown({
      canvas,
      canvasRefs,
      event,
      point,
      smartSelectionNodes: [rect],
      viewport,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(getSmartSelectionSwapHandleAtPointMock).not.toHaveBeenCalled();
    expect(armSmartSelectionSwapDragMock).not.toHaveBeenCalled();

    // cleanup
    store.dispatch(deleteNode(frameId));
  });
});
