import { RefObject } from 'react';

// store
import { setSelection, setViewport } from 'store/design/slice';
import { store } from 'store';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';

// types
import { NodeType } from 'types/design/enums';
import { TArmedMedia } from '../../loadArmedMedia';
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
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
    const before = Object.keys(selectActivePage(store.getState()).nodes).length;

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, 1),
      store.dispatch,
      store,
      createCanvasRefs(),
      createArmedRef(armed),
      startRef,
      { current: null },
      { current: null },
      { current: [] },
      'Image',
    );

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(before);
  });

  it('should do nothing when no file is armed', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();
    const before = Object.keys(selectActivePage(store.getState()).nodes).length;

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      createCanvasRefs(),
      createArmedRef(null),
      startRef,
      { current: null },
      { current: null },
      { current: [] },
      'Image',
    );

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(before);
  });

  it('should place the media at its natural size centered on the pointer-down point, appending it to the selection', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const startRef = createStartRef();
    const nodeIdRef: { current: string | null } = { current: null };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      refs,
      createArmedRef(armed),
      startRef,
      nodeIdRef,
      { current: null },
      {
        current: [],
      },
      'Image',
    );

    // result — a prior file placed earlier in the same multi-file queue stays selected too
    const page = selectActivePage(store.getState());

    expect(nodeIdRef.current).not.toBeNull();
    expect(page.nodes[nodeIdRef.current as string]).toMatchObject({ height: 100, src: 'blob:mock-url', type: NodeType.media, width: 200 });
    expect(selectSelectedIds(store.getState())).toEqual(['already-placed', nodeIdRef.current]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(startRef.current).toEqual({ x: 10, y: 10 });
    expect(refs.drawing.cancelDrawRef.current).not.toBeNull();
  });

  it('should convert the pointer position through the current viewport, not a stale one', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createStartRef();

    store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 }));

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      createCanvasRefs(),
      createArmedRef(armed),
      startRef,
      { current: null },
      { current: null },
      { current: [] },
      'Image',
    );

    // result — screen (10,10) under viewport {x:150,y:90} is world (-140,-80)
    expect(startRef.current).toEqual({ x: -140, y: -80 });
  });
});
