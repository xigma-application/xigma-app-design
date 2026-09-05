// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../handlePointerDown';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should ignore a non-primary button press entirely', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: null };
    const candidateShapesRef = { current: [] };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      candidateShapesRef,
    );

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the selection, snapshot the pointer-down point, and capture the pointer', () => {
    // mock
    store.dispatch(setSelection(['stale-id']));

    const canvas = createCanvas();
    const startRef = { current: null };
    const candidateShapesRef = { current: [] };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(50, 60),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      candidateShapesRef,
    );

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([]);
    expect(startRef.current).toEqual({ x: 50, y: 60 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should collect every other node as an alignment-snap candidate', () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    const canvas = createCanvas();
    const startRef = { current: null };
    const candidateShapesRef = { current: [] };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(50, 60),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      candidateShapesRef,
    );

    // result
    expect(candidateShapesRef.current.length).toBeGreaterThan(0);
  });
});
