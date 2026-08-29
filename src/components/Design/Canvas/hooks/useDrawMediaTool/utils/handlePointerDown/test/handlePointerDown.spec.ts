import { RefObject } from 'react';

// store
import { setSelection, setViewport } from 'store/design/slice';
import { store } from 'store';
import { selectSelectedIds } from 'store/design/selectors';

// types
import { TArmedMedia } from '../../loadArmedMedia';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent('pointerdown', { button, clientX: x, clientY: y, pointerId: 1 });

const createArmedRef = (armed: TArmedMedia | null = null): RefObject<TArmedMedia | null> => ({ current: armed });
const createStartRef = (): RefObject<TPoint | null> => ({ current: null });

const armed: TArmedMedia = { naturalHeight: 100, naturalWidth: 200, src: 'blob:mock-url' };

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection(['already-placed']));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10, 1), store, createArmedRef(armed), startRef);

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should do nothing when no file is armed', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10), store, createArmedRef(null), startRef);

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should capture the pointer and record the world-space start point once armed, without touching the current selection', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10), store, createArmedRef(armed), startRef);

    // result — a prior file placed earlier in the same multi-file queue must stay selected
    expect(selectSelectedIds(store.getState())).toEqual(['already-placed']);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(startRef.current).toEqual({ x: 10, y: 10 });
  });

  it('should convert the pointer position through the current viewport, not a stale one', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 }));

    // before
    handlePointerDown(canvas, pointerEvent(10, 10), store, createArmedRef(armed), startRef);

    // result — screen (10,10) under viewport {x:150,y:90} is world (-140,-80)
    expect(startRef.current).toEqual({ x: -140, y: -80 });
  });
});
