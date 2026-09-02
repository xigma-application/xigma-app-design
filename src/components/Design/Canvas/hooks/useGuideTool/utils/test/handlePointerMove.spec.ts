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

  it("should live-update a dragging guide's world position and set the resize-x class name", () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'x', frameId: null, hasMoved: false, id: null, position: 5 } } },
    });
    const event = pointerEvent(120, 200);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');
    const setClassName = vi.fn();

    // before
    handlePointerMove(canvas, event, refs, setClassName);

    // result
    expect(refs.guides.draggingGuideRef.current).toEqual({ axis: 'x', frameId: null, hasMoved: true, id: null, position: 120 });
    expect(setClassName).toHaveBeenCalledWith('resize-x');
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it('should set the resize-y class name while dragging a horizontal (y-axis) guide', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'y', frameId: null, hasMoved: false, id: null, position: 5 } } },
    });
    const setClassName = vi.fn();

    // before
    handlePointerMove(canvas, pointerEvent(0, 90), refs, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('resize-y');
  });

  it('should set the resize-y class name while merely hovering the top gutter, without arming anything', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = pointerEvent(100, 5);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');
    const setClassName = vi.fn();

    // before
    handlePointerMove(canvas, event, refs, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('resize-y');
    expect(refs.guides.draggingGuideRef.current).toBeNull();
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it("should shift the gutter zone past LeftPanel's live width", () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs({ layout: { leftPanelWidthRef: { current: 300 } } });
    const setClassName = vi.fn();

    // before — screen x 5 is under LeftPanel, not the ruler
    handlePointerMove(canvas, pointerEvent(5, 200), refs, setClassName);

    // result
    expect(setClassName).not.toHaveBeenCalled();

    // action — screen x 310 is inside the shifted ruler strip
    handlePointerMove(canvas, pointerEvent(310, 200), refs, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('resize-x');
  });

  it('should set the resize-x class name while hovering an existing guide outside the gutter', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 50 }));
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    handlePointerMove(canvas, pointerEvent(51, 200), refs, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('resize-x');
  });

  it('should leave the class name untouched and let the event through when nothing guide-related is under the pointer', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = pointerEvent(300, 300);
    const stopImmediatePropagationSpy = vi.spyOn(event, 'stopImmediatePropagation');
    const setClassName = vi.fn();

    // before
    handlePointerMove(canvas, event, refs, setClassName);

    // result
    expect(setClassName).not.toHaveBeenCalled();
    expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
  });
});
