// store
import { addGuide, setViewport, toggleRulers } from 'store/design/slice';
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent('pointerdown', { button, clientX: x, clientY: y, pointerId: 1 });

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    if (!selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should arm a page guide drag-out from the top gutter and stop propagation', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = pointerEvent(100, 5);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

    // before
    handlePointerDown(canvas, event, store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toEqual({ axis: 'y', frameId: null, hasMoved: false, id: null, position: 5 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it('should arm a page guide drag-out from the left gutter', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerDown(canvas, pointerEvent(5, 200), store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toEqual({ axis: 'x', frameId: null, hasMoved: false, id: null, position: 5 });
  });

  it('should account for pan/zoom when computing the drag-out world position', () => {
    // mock
    store.dispatch(setViewport({ x: 20, y: 0, zoom: 2 }));
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before — screen x 5 is inside the left gutter; world x = (5 - 20) / 2 = -7.5
    handlePointerDown(canvas, pointerEvent(5, 200), store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toEqual({ axis: 'x', frameId: null, hasMoved: false, id: null, position: -7.5 });
  });

  it("should shift the left gutter past LeftPanel's live width instead of the true screen edge", () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({ layout: { leftPanelWidthRef: { current: 300 } } });

    // before — screen x 5 is now under LeftPanel, not the ruler; screen x 310 is inside it
    handlePointerDown(canvas, pointerEvent(5, 200), store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toBeNull();

    // action
    handlePointerDown(canvas, pointerEvent(310, 200), store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toEqual({ axis: 'x', frameId: null, hasMoved: false, id: null, position: 310 });
  });

  it('should not arm a drag-out from the gutter while rulers are hidden', () => {
    // mock
    store.dispatch(toggleRulers());
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerDown(canvas, pointerEvent(5, 200), store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should arm a move of an existing guide hit outside the gutter', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 50 }));
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerDown(canvas, pointerEvent(51, 200), store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toMatchObject({ axis: 'x', frameId: null, position: 50 });
    expect(refs.guides.draggingGuideRef.current?.id).toEqual(expect.any(String));
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should ignore a non-primary button press, even inside the gutter', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerDown(canvas, pointerEvent(5, 200, 2), store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should not arm anything when the pointer is neither in a gutter nor on a guide', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = pointerEvent(300, 300);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

    // before
    handlePointerDown(canvas, event, store.dispatch, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
  });
});
