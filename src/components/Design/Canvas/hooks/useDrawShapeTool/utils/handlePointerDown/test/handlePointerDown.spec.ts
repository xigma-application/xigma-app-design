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
    const nodesBefore = Object.keys(selectActivePage(store.getState()).nodes).length;

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
      'Rectangle',
      NodeType.rectangle,
    );

    // result
    expect(startRef.current).toBeNull();
    expect(nodeIdRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(nodesBefore);
  });

  it('should create the node immediately at the pointer-down point, select it, and capture the pointer', () => {
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
      'Rectangle',
      NodeType.rectangle,
    );

    // result
    const page = selectActivePage(store.getState());

    expect(startRef.current).toEqual({ x: 50, y: 60 });
    expect(nodeIdRef.current).not.toBeNull();
    expect(page.nodes[nodeIdRef.current as string]).toMatchObject({ type: NodeType.rectangle, x: 50, y: 60 });
    expect(page.selectedIds).toEqual([nodeIdRef.current]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    // Escape should be able to cancel this in-progress node via the shared cancel-draw ref
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
      'Rectangle',
      NodeType.rectangle,
    );

    // result — the just-created node itself must be excluded from its own snap candidates
    expect(candidateShapesRef.current.length).toBe(preexistingCount);
  });

  it('should resolve and remember the frame under the cursor for a non-section shape, and parent the new node into it', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 400,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 400,
        x: 0,
        y: 0,
      }),
    );

    const canvas = createCanvas();
    const startRef = { current: null };
    const nodeIdRef: { current: string | null } = { current: null };
    const candidateShapesRef = { current: [] };
    const dropTargetRef: { current: { parentId: string | null; targetIndex: number } | null } = { current: null };
    const frameId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

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
      'Rectangle',
      NodeType.rectangle,
    );

    // result
    expect(dropTargetRef.current).toEqual({ parentId: frameId, targetIndex: 0 });

    const page = selectActivePage(store.getState());

    expect(page.nodes[nodeIdRef.current as string].parentId).toBe(frameId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toContain(nodeIdRef.current);
  });

  it('should never resolve a frame target for a section', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 400,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 400,
        x: 0,
        y: 0,
      }),
    );

    const canvas = createCanvas();
    const startRef = { current: null };
    const nodeIdRef: { current: string | null } = { current: null };
    const candidateShapesRef = { current: [] };
    const dropTargetRef: { current: { parentId: string | null; targetIndex: number } | null } = { current: null };

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
      '#444444',
      'Section',
      NodeType.section,
    );

    // result
    expect(dropTargetRef.current).toBeNull();

    const page = selectActivePage(store.getState());

    expect(page.nodes[nodeIdRef.current as string].parentId).toBeNull();
  });
});
