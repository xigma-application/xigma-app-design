// store
import { updateNode } from 'store/design/slice';

// utils
import { continueShapeCornerRadiusDrag } from '../continueShapeCornerRadiusDrag';

const pointerMock = vi.fn();

vi.mock('utils/math/pointer/getPointerPosition', () => ({ getPointerPosition: (...args: unknown[]): unknown => pointerMock(...args) }));
vi.mock('utils/canvas/cornerRadius/getCornerRadiusHandleSetbackMultiplier', () => ({
  getCornerRadiusHandleSetbackMultiplier: (): number => 1,
}));

type TState = {
  bounds: { height: number; width: number; x: number; y: number };
  flipX: boolean;
  flipY: boolean;
  hasMoved: boolean;
  nodeId: string;
  rotation: number;
};

const triangle = [
  { x: 50, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const drag = (point: { x: number; y: number }, extra: Partial<TState> = {}): { dispatch: TFunc; state: TState } => {
  const dispatch = vi.fn();
  const state: TState = {
    bounds: { height: 100, width: 100, x: 0, y: 0 },
    flipX: false,
    flipY: false,
    hasMoved: false,
    nodeId: 'n',
    rotation: 0,
    ...extra,
  };
  pointerMock.mockReturnValue(point);

  continueShapeCornerRadiusDrag(
    {} as HTMLCanvasElement,
    {} as PointerEvent,
    dispatch,
    { current: state },
    () => triangle,
    () => 30,
  );

  return { dispatch, state };
};

describe('continueShapeCornerRadiusDrag', () => {
  it('should set the corner radius from how far the pointer is dragged toward the center', () => {
    // before
    const { dispatch, state } = drag({ x: 50, y: 20 });

    // result
    expect(state.hasMoved).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerRadius: 20 }, id: 'n' }));
  });

  it('should clamp the radius between zero and the maximum', () => {
    // result
    expect(drag({ x: 50, y: -20 }).dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerRadius: 0 }, id: 'n' }));
    expect(drag({ x: 50, y: 90 }).dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerRadius: 30 }, id: 'n' }));
  });

  it('should read the pointer in the local space of a flipped shape', () => {
    // result
    expect(drag({ x: 50, y: 80 }, { flipY: true }).dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerRadius: 20 }, id: 'n' }));
  });

  it('should do nothing without a drag in progress', () => {
    // mock
    const dispatch = vi.fn();

    // before
    continueShapeCornerRadiusDrag(
      {} as HTMLCanvasElement,
      {} as PointerEvent,
      dispatch,
      { current: null },
      () => triangle,
      () => 30,
    );

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
