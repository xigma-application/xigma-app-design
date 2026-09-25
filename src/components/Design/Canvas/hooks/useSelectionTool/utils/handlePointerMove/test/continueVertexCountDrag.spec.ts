// store
import { updateNode } from 'store/design/slice';

// utils
import { continueVertexCountDrag } from '../continueVertexCountDrag';

const countMock = vi.fn(() => 6);

vi.mock('utils/math/pointer/getPointerPosition', () => ({ getPointerPosition: (): unknown => ({ x: 10, y: 20 }) }));
vi.mock('utils/canvas/vertexCount/getVertexCountFromLocalPoint', () => ({
  getVertexCountFromLocalPoint: (...args: unknown[]): unknown => countMock(...(args as [])),
}));

const dragRef = (): {
  current: {
    bounds: { height: number; width: number; x: number; y: number };
    flipX: boolean;
    flipY: boolean;
    nodeId: string;
    rotation: number;
  };
} => ({
  current: { bounds: { height: 100, width: 100, x: 0, y: 0 }, flipX: true, flipY: false, nodeId: 'n', rotation: 0 },
});

describe('continueVertexCountDrag', () => {
  it('should set the polygon sides from the pointer in the local, flipped space', () => {
    // mock
    const dispatch = vi.fn();

    // before
    continueVertexCountDrag({} as HTMLCanvasElement, {} as PointerEvent, dispatch, dragRef(), 3, 12, 'sides');

    // result
    expect(countMock).toHaveBeenCalledWith({ x: 90, y: 20 }, { x: 50, y: 50 }, 3, 12);
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { sides: 6 }, id: 'n' }));
  });

  it('should set the star points', () => {
    // mock
    const dispatch = vi.fn();

    // before
    continueVertexCountDrag({} as HTMLCanvasElement, {} as PointerEvent, dispatch, dragRef(), 3, 12, 'points');

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { points: 6 }, id: 'n' }));
  });

  it('should do nothing without a drag in progress', () => {
    // mock
    const dispatch = vi.fn();

    // before
    continueVertexCountDrag({} as HTMLCanvasElement, {} as PointerEvent, dispatch, { current: null }, 3, 12, 'sides');

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
