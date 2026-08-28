// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { resolveVectorMultiSelectBoxHover } from '../resolveVectorMultiSelectBoxHover';

vi.mock('utils/canvas/getRotatedResizeCursorUrl', () => ({ getRotatedResizeCursorUrl: vi.fn(() => 'url(resize.png), auto') }));
vi.mock('utils/canvas/getRotatedRotateCursorUrl', () => ({ getRotatedRotateCursorUrl: vi.fn(() => 'url(rotate.png), auto') }));

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorMultiSelectBoxHover', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when no vector node is open for editing', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(50, 50), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('');
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing when fewer than 2 points/handles are selected, since no box exists', () => {
    // mock
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(0, 0), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('');
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should set a rotated resize cursor when hovering a corner resize handle', () => {
    // mock — bounds are (0,0,100,100); (98,98) sits just inside the 'se' corner's hit radius
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(98, 98), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('url(resize.png), auto');
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should set a rotated rotate cursor when hovering just outside a corner, within the rotate ring', () => {
    // mock — (107,107) sits outside the bounds but within the outer rotate-ring radius of the 'se' corner
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(107, 107), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('url(rotate.png), auto');
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should set the move className when hovering the box interior, away from any handle', () => {
    // mock
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(50, 50), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('');
    expect(setClassName).toHaveBeenCalledWith('move');
  });

  it('should fall back to an empty cursor when no rotated resize cursor image is available yet', () => {
    // mock
    vi.mocked(getRotatedResizeCursorUrl).mockReturnValueOnce(null);

    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(98, 98), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('');
  });

  it('should fall back to an empty cursor when no rotated rotate cursor image is available yet', () => {
    // mock
    vi.mocked(getRotatedRotateCursorUrl).mockReturnValueOnce(null);

    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(107, 107), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('');
  });

  it('should clear both the cursor and the move className when hovering outside the box entirely', () => {
    // mock — bounds are (0,0,100,100); (500,500) is nowhere near the box, its handles, or its rotate ring
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    resolveVectorMultiSelectBoxHover(canvas, pointerEvent(500, 500), canvasRefs, setClassName);

    // result
    expect(canvas.style.cursor).toBe('');
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
