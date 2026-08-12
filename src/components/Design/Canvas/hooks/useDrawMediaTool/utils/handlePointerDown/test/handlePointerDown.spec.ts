import { RefObject } from 'react';

// store
import { setSelection, setViewport } from 'store/design/slice';
import { store } from 'store';

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
    store.dispatch(setSelection(['stale']));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10, 1), store.dispatch, store, createArmedRef(armed), startRef);

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(store.getState().design.selectedIds).toEqual(['stale']);
  });

  it('should do nothing when no file is armed', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10), store.dispatch, store, createArmedRef(null), startRef);

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(store.getState().design.selectedIds).toEqual(['stale']);
  });

  it('should clear the selection, capture the pointer, and record the world-space start point once armed', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    // before
    handlePointerDown(canvas, pointerEvent(10, 10), store.dispatch, store, createArmedRef(armed), startRef);

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(startRef.current).toEqual({ x: 10, y: 10 });
  });

  it('should convert the pointer position through the current viewport, not a stale one', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 }));

    // before
    handlePointerDown(canvas, pointerEvent(10, 10), store.dispatch, store, createArmedRef(armed), startRef);

    // result — screen (10,10) under viewport {x:150,y:90} is world (-140,-80)
    expect(startRef.current).toEqual({ x: -140, y: -80 });
  });
});
