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
    const nodeIdRef = { current: null };
    const candidateShapesRef = { current: [] };
    const dropTargetRef = { current: null };
    const before = Object.keys(selectActivePage(store.getState()).nodes).length;

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      nodeIdRef,
      candidateShapesRef,
      dropTargetRef,
      '#ff0000',
      'Star',
      5,
      0.5,
    );

    // result
    expect(startRef.current).toBeNull();
    expect(nodeIdRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(before);
  });

  it('should create the star immediately at the pointer-down point, select it, and capture the pointer', () => {
    // mock
    store.dispatch(setSelection(['stale-id']));

    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const startRef = { current: null };
    const nodeIdRef: { current: string | null } = { current: null };
    const candidateShapesRef = { current: [] };
    const dropTargetRef = { current: null };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(50, 60),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      nodeIdRef,
      candidateShapesRef,
      dropTargetRef,
      '#ff0000',
      'Star',
      6,
      0.4,
    );

    // result
    const page = selectActivePage(store.getState());

    expect(startRef.current).toEqual({ x: 50, y: 60 });
    expect(nodeIdRef.current).not.toBeNull();
    expect(page.nodes[nodeIdRef.current as string]).toMatchObject({ points: 6, ratio: 0.4, type: NodeType.star, x: 50, y: 60 });
    expect(page.selectedIds).toEqual([nodeIdRef.current]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(refs.drawing.cancelDrawRef.current).not.toBeNull();
  });

  it('should collect every other node — but not the one just created — as an alignment-snap candidate', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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
    const nodeIdRef: { current: string | null } = { current: null };
    const candidateShapesRef = { current: [] };
    const dropTargetRef = { current: null };
    const preexistingCount = Object.keys(selectActivePage(store.getState()).nodes).length;

    // before
    handlePointerDown(
      canvas,
      pointerEvent(50, 60),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      nodeIdRef,
      candidateShapesRef,
      dropTargetRef,
      '#ff0000',
      'Star',
      5,
      0.5,
    );

    // result — the just-created node itself must be excluded from its own snap candidates
    expect(candidateShapesRef.current.length).toBe(preexistingCount);
  });
});
