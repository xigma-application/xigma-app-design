// store
import { addGuide, setViewport, toggleRulers } from 'store/design/slice';
import { selectActivePage, selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleContextMenu } from '../handleContextMenu';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const contextMenuEvent = (x: number, y: number): MouseEvent => new MouseEvent('contextmenu', { clientX: x, clientY: y });

describe('handleContextMenu', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    if (!selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should open the ruler menu for the vertical-guide axis when right-clicking the top gutter', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = contextMenuEvent(100, 5);
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
    const openMenuAt = vi.fn();
    const setRulerMenu = vi.fn();
    const setSelectedGuide = vi.fn();

    // before
    handleContextMenu(canvas, event, refs, openMenuAt, setRulerMenu, setSelectedGuide);

    // result
    expect(setSelectedGuide).toHaveBeenCalledWith(null);
    expect(setRulerMenu).toHaveBeenCalledWith({ axis: 'x' });
    expect(openMenuAt).toHaveBeenCalledWith({ x: 100, y: 5 });
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should open the ruler menu for the horizontal-guide axis when right-clicking the left gutter', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = contextMenuEvent(5, 200);
    const openMenuAt = vi.fn();
    const setRulerMenu = vi.fn();
    const setSelectedGuide = vi.fn();

    // before
    handleContextMenu(canvas, event, refs, openMenuAt, setRulerMenu, setSelectedGuide);

    // result
    expect(setRulerMenu).toHaveBeenCalledWith({ axis: 'y' });
  });

  it('should select the hit guide and suppress the browser menu when right-clicking on it', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 40 }));
    const [guide] = selectActivePage(store.getState()).guides.filter((candidate) => candidate.position === 40);
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = contextMenuEvent(40, 200);
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
    const openMenuAt = vi.fn();
    const setRulerMenu = vi.fn();
    const setSelectedGuide = vi.fn();

    // before
    handleContextMenu(canvas, event, refs, openMenuAt, setRulerMenu, setSelectedGuide);

    // result
    expect(setRulerMenu).toHaveBeenCalledWith(null);
    expect(setSelectedGuide).toHaveBeenCalledWith({ frameId: null, id: guide.id });
    expect(openMenuAt).toHaveBeenCalledWith({ x: 40, y: 200 });
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should leave the browser menu alone when right-clicking away from any guide or gutter', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const event = contextMenuEvent(300, 300);
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const openMenuAt = vi.fn();
    const setRulerMenu = vi.fn();
    const setSelectedGuide = vi.fn();

    // before
    handleContextMenu(canvas, event, refs, openMenuAt, setRulerMenu, setSelectedGuide);

    // result
    expect(openMenuAt).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
