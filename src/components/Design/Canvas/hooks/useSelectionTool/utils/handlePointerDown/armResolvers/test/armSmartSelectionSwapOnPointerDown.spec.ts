// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

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

  it('should look up the current nodes-by-id map and forward it to the hit test', () => {
    // mock
    getSmartSelectionSwapHandleAtPointMock.mockReturnValue(null);

    // before
    armSmartSelectionSwapOnPointerDown({ canvas, canvasRefs, event, point, smartSelectionNodes, viewport } as never);

    // result
    expect(getSmartSelectionSwapHandleAtPointMock).toHaveBeenCalledWith(
      point,
      smartSelectionNodes,
      viewport,
      selectNodes(store.getState()),
    );
  });
});
