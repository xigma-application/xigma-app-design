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
const selectedNodes = [] as never[];
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
    const result = armSmartSelectionGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes, viewport } as never);

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
    const result = armSmartSelectionGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes, viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(armSmartSelectionGapDragMock).not.toHaveBeenCalled();
  });
});
