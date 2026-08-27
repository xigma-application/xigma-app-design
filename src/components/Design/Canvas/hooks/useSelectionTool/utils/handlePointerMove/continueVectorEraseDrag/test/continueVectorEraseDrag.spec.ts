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

const move = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

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
    const dragRef: { current: TVectorEraseDragState | null } = { current: { lastPoint: { x: 10, y: 0 } } };
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
});
