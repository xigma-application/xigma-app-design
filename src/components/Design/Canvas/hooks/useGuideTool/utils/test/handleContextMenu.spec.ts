// store
import { addGuide, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
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
  });

  it('should select the hit guide and suppress the browser menu when right-clicking on it', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 40 }));
    const [guide] = selectActivePage(store.getState()).guides.filter((candidate) => candidate.position === 40);
    const canvas = createCanvas();
    const event = contextMenuEvent(40, 200);
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
    const setSelectedGuide = vi.fn();

    // before
    handleContextMenu(canvas, event, setSelectedGuide);

    // result
    expect(setSelectedGuide).toHaveBeenCalledWith({ frameId: null, id: guide.id, worldPoint: { x: 40, y: 200 } });
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should leave the browser menu alone when right-clicking away from any guide', () => {
    // mock
    const canvas = createCanvas();
    const event = contextMenuEvent(300, 300);
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const setSelectedGuide = vi.fn();

    // before
    handleContextMenu(canvas, event, setSelectedGuide);

    // result
    expect(setSelectedGuide).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
