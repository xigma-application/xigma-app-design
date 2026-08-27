// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorEraseDragState } from 'types/design/selectionTool/types';

// utils
import { continueVectorEraseDrag } from '../continueVectorEraseDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const move = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, ...options });

describe('continueVectorEraseDrag', () => {
  beforeEach(() => store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 })));

  it('should do nothing when no erase drag is armed', () => {
    // mock
    const strokeRef: { current: TPoint[] | null } = { current: null };

    // action
    continueVectorEraseDrag(createCanvas(), move(50, 0), { current: null }, strokeRef);

    // result
    expect(strokeRef.current).toBeNull();
  });

  it('should append the pointer position to the brush path and advance lastPoint, without touching geometry', () => {
    // mock
    const dragRef: { current: TVectorEraseDragState | null } = {
      current: { axisLock: null, lastPoint: { x: 10, y: 0 }, shiftAnchor: null },
    };
    const strokeRef: { current: TPoint[] | null } = { current: [{ x: 10, y: 0 }] };

    // action
    continueVectorEraseDrag(createCanvas(), move(40, 5), dragRef, strokeRef);
    continueVectorEraseDrag(createCanvas(), move(70, 5), dragRef, strokeRef);

    // result
    expect(strokeRef.current).toEqual([
      { x: 10, y: 0 },
      { x: 40, y: 5 },
      { x: 70, y: 5 },
    ]);
    expect(dragRef.current?.lastPoint).toEqual({ x: 70, y: 5 });
  });

  it('should follow the real pointer position while Shift is held but movement has not yet cleared the lock threshold', () => {
    // mock — anchor at (10, 0), a 2px nudge stays under the 4px threshold at zoom 1
    const dragRef: { current: TVectorEraseDragState | null } = {
      current: { axisLock: null, lastPoint: { x: 10, y: 0 }, shiftAnchor: null },
    };
    const strokeRef: { current: TPoint[] | null } = { current: [{ x: 10, y: 0 }] };

    // action
    continueVectorEraseDrag(createCanvas(), move(12, 1, { shiftKey: true }), dragRef, strokeRef);

    // result — no axis chosen yet, so the raw point is used as-is
    expect(strokeRef.current).toEqual([
      { x: 10, y: 0 },
      { x: 12, y: 1 },
    ]);
    expect(dragRef.current).toEqual({ axisLock: null, lastPoint: { x: 12, y: 1 }, shiftAnchor: { x: 10, y: 0 } });
  });

  it('should lock the brush path to the dominant axis once movement clears the threshold while Shift is held', () => {
    // mock — anchor at (10, 0), moving mostly horizontally while holding Shift
    const dragRef: { current: TVectorEraseDragState | null } = {
      current: { axisLock: null, lastPoint: { x: 10, y: 0 }, shiftAnchor: null },
    };
    const strokeRef: { current: TPoint[] | null } = { current: [{ x: 10, y: 0 }] };

    // action
    continueVectorEraseDrag(createCanvas(), move(40, 6, { shiftKey: true }), dragRef, strokeRef);

    // result — y snaps back to the anchor's 0
    expect(strokeRef.current).toEqual([
      { x: 10, y: 0 },
      { x: 40, y: 0 },
    ]);
    expect(dragRef.current).toEqual({ axisLock: 'x', lastPoint: { x: 40, y: 0 }, shiftAnchor: { x: 10, y: 0 } });
  });

  it('should keep the axis locked even if the pointer later drifts more in the other direction', () => {
    // mock — already locked to x from a previous move
    const dragRef: { current: TVectorEraseDragState | null } = {
      current: { axisLock: 'x', lastPoint: { x: 40, y: 0 }, shiftAnchor: { x: 10, y: 0 } },
    };
    const strokeRef: { current: TPoint[] | null } = {
      current: [
        { x: 10, y: 0 },
        { x: 40, y: 0 },
      ],
    };

    // action — moves further, mostly vertically this time
    continueVectorEraseDrag(createCanvas(), move(45, 30, { shiftKey: true }), dragRef, strokeRef);

    // result — still locked to x, so y stays pinned to the anchor
    expect(strokeRef.current).toEqual([
      { x: 10, y: 0 },
      { x: 40, y: 0 },
      { x: 45, y: 0 },
    ]);
    expect(dragRef.current?.axisLock).toBe('x');
  });

  it('should resume unlocked freehand movement as soon as Shift is released', () => {
    // mock — locked to x from a previous move
    const dragRef: { current: TVectorEraseDragState | null } = {
      current: { axisLock: 'x', lastPoint: { x: 40, y: 0 }, shiftAnchor: { x: 10, y: 0 } },
    };
    const strokeRef: { current: TPoint[] | null } = {
      current: [
        { x: 10, y: 0 },
        { x: 40, y: 0 },
      ],
    };

    // action — Shift no longer held
    continueVectorEraseDrag(createCanvas(), move(50, 25), dragRef, strokeRef);

    // result — the real pointer position is used, and the lock clears
    expect(strokeRef.current).toEqual([
      { x: 10, y: 0 },
      { x: 40, y: 0 },
      { x: 50, y: 25 },
    ]);
    expect(dragRef.current).toEqual({ axisLock: null, lastPoint: { x: 50, y: 25 }, shiftAnchor: null });
  });
});
