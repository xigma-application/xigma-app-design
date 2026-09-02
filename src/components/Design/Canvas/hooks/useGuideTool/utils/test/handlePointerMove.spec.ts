// store
import { addGuide, setViewport, toggleRulers } from 'store/design/slice';
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    if (!selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it("should live-update a dragging guide's world position and set the resize cursor", () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({ guides: { draggingGuideRef: { current: { axis: 'x', frameId: null, id: null, position: 5 } } } });
    const event = pointerEvent(120, 200);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

    // before
    handlePointerMove(canvas, event, refs);

    // result
    expect(refs.guides.draggingGuideRef.current).toEqual({ axis: 'x', frameId: null, id: null, position: 120 });
    expect(canvas.style.cursor).toBe('col-resize');
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it('should set the row-resize cursor while dragging a horizontal (y-axis) guide', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({ guides: { draggingGuideRef: { current: { axis: 'y', frameId: null, id: null, position: 5 } } } });

    // before
    handlePointerMove(canvas, pointerEvent(0, 90), refs);

    // result
    expect(canvas.style.cursor).toBe('row-resize');
  });

  it('should show the resize cursor while merely hovering the top gutter, without arming anything', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = pointerEvent(100, 5);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

    // before
    handlePointerMove(canvas, event, refs);

    // result
    expect(canvas.style.cursor).toBe('row-resize');
    expect(refs.guides.draggingGuideRef.current).toBeNull();
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it('should show the resize cursor while hovering an existing guide outside the gutter', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 50 }));
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerMove(canvas, pointerEvent(51, 200), refs);

    // result
    expect(canvas.style.cursor).toBe('col-resize');
  });

  it('should leave the cursor untouched and let the event through when nothing guide-related is under the pointer', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = pointerEvent(300, 300);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');

    // before
    handlePointerMove(canvas, event, refs);

    // result
    expect(canvas.style.cursor).toBe('');
    expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
  });
});
