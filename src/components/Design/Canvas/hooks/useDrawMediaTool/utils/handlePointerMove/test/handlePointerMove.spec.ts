import { RefObject } from 'react';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TArmedMedia } from '../../loadArmedMedia';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1 });

const createArmedRef = (armed: TArmedMedia | null = null): RefObject<TArmedMedia | null> => ({ current: armed });
const createStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createDraftRef = (): RefObject<TDraftEntity | null> => ({ current: null });

const armed: TArmedMedia = { naturalHeight: 100, naturalWidth: 200, src: 'blob:mock-url' };

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no file is armed', () => {
    // mock
    const canvas = createCanvas();
    const draftRef = createDraftRef();

    // before
    handlePointerMove(canvas, pointerEvent(50, 50), store, createArmedRef(null), createStartRef({ x: 0, y: 0 }), draftRef);

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should do nothing when the drag has not started', () => {
    // mock
    const canvas = createCanvas();
    const draftRef = createDraftRef();

    // before
    handlePointerMove(canvas, pointerEvent(50, 50), store, createArmedRef(armed), createStartRef(null), draftRef);

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should show a live aspect-ratio-locked draft while dragging', () => {
    // mock
    const canvas = createCanvas();
    const draftRef = createDraftRef();

    // before
    handlePointerMove(canvas, pointerEvent(50, 50), store, createArmedRef(armed), createStartRef({ x: 0, y: 0 }), draftRef);

    // result — raw 50x50 drag locked to the armed file's 2:1 ratio, driven by the taller raw axis
    expect(draftRef.current).toEqual({ height: 50, src: 'blob:mock-url', type: NodeType.media, width: 100, x: 0, y: 0 });
  });

  it('should convert the pointer position through the current viewport, not a stale one', () => {
    // mock
    const canvas = createCanvas();
    const draftRef = createDraftRef();

    store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 }));

    // before
    handlePointerMove(canvas, pointerEvent(150, 90), store, createArmedRef(armed), createStartRef({ x: 0, y: 0 }), draftRef);

    // result — screen (150,90) under viewport {x:150,y:90} is world (0,0), same as the start point
    expect(draftRef.current).toMatchObject({ x: 0, y: 0 });
  });
});
