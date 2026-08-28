// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorShapeBuilderDrag } from '../disarmVectorShapeBuilderDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const addTriangleVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('disarmVectorShapeBuilderDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no shape-builder drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorShapeBuilderDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should commit the touched faces, clear every shape-builder ref, release pointer capture, and restore the tool cursor', () => {
    // mock — in real usage a node only ever appears in touchedVectorShapeBuilderFacesRef because
    // armVectorShapeBuilderOnPointerDown already gated on it being in vectorEditingNodeIds; set that
    // here too so the open-nodes resolution (§62) finds it
    const nodeId = addTriangleVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({
      shapeBuilder: {
        isVectorShapeBuilderBoxModeRef: { current: true },
        isVectorShapeBuilderSubtractRef: { current: false },
        touchedVectorShapeBuilderFacesRef: { current: { [nodeId]: new Set(['s1,s2,s3']) } },
        vectorShapeBuilderPathRef: { current: [{ x: 50, y: 40 }] },
      },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorShapeBuilderDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, setClassName);

    // result
    expect(canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current).toBeNull();
    expect(canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current).toEqual({});
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current).toBe(false);
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current).toBe(false);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith('add');
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'],
    });
  });

  it('should clear vector selection refs and prune the absorbed node id from vectorEditingNodeIds when the drag genuinely crosses and merges two open nodes', () => {
    // mock — two 150x200 rectangles staggered by (75,100), a proven real-crossing overlap. Segment/
    // vertex ids are prefixed per rectangle — addNode stores them verbatim (only the node's own top-
    // level id is nanoid()-generated), so two literal 's1'/'v1' sets would collide once unioned
    const buildRectangleNode = (prefix: string, offsetX: number, offsetY: number): Parameters<typeof addNode>[0] => ({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        [`${prefix}s1`]: { endId: `${prefix}v2`, id: `${prefix}s1`, startId: `${prefix}v1`, tangentEnd: null, tangentStart: null },
        [`${prefix}s2`]: { endId: `${prefix}v3`, id: `${prefix}s2`, startId: `${prefix}v2`, tangentEnd: null, tangentStart: null },
        [`${prefix}s3`]: { endId: `${prefix}v4`, id: `${prefix}s3`, startId: `${prefix}v3`, tangentEnd: null, tangentStart: null },
        [`${prefix}s4`]: { endId: `${prefix}v1`, id: `${prefix}s4`, startId: `${prefix}v4`, tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        [`${prefix}v1`]: { id: `${prefix}v1`, x: offsetX, y: offsetY },
        [`${prefix}v2`]: { id: `${prefix}v2`, x: offsetX + 150, y: offsetY },
        [`${prefix}v3`]: { id: `${prefix}v3`, x: offsetX + 150, y: offsetY + 200 },
        [`${prefix}v4`]: { id: `${prefix}v4`, x: offsetX, y: offsetY + 200 },
      },
    });

    store.dispatch(addNode(buildRectangleNode('a', 0, 0)));
    const idA =
      store.getState().design.pages[store.getState().design.activePageId].rootOrder[
        store.getState().design.pages[store.getState().design.activePageId].rootOrder.length - 1
      ];

    store.dispatch(addNode(buildRectangleNode('b', 75, 100)));
    const idB =
      store.getState().design.pages[store.getState().design.activePageId].rootOrder[
        store.getState().design.pages[store.getState().design.activePageId].rootOrder.length - 1
      ];

    store.dispatch(setVectorEditingNodeIds([idA, idB]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({
      shapeBuilder: {
        isVectorShapeBuilderBoxModeRef: { current: false },
        isVectorShapeBuilderSubtractRef: { current: false },
        touchedVectorShapeBuilderFacesRef: { current: { [idA]: new Set(['as1,as2,as3,as4']), [idB]: new Set(['bs1,bs2,bs3,bs4']) } },
        vectorShapeBuilderPathRef: {
          current: [
            { x: 25, y: 25 },
            { x: 100, y: 150 },
            { x: 200, y: 250 },
          ],
        },
      },
      vectorEdit: {
        selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 's1' }] },
        selectedVectorSegmentIdsRef: { current: ['s1'] },
        selectedVectorVertexIdsRef: { current: ['v1'] },
      },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorShapeBuilderDrag(canvas, pointerEvent(3), store.dispatch, canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toBeUndefined(); // absorbed node deleted
    expect(store.getState().design.vectorEditingNodeIds).toEqual([idA]); // pruned
  });
});
