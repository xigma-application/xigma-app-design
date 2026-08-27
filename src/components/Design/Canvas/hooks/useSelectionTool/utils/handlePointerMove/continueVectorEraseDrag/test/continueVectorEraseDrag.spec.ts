// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorEraseDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { continueVectorEraseDrag } from '../continueVectorEraseDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const move = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#000000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const currentNode = (id: string): TVectorNode => store.getState().design.nodes[id] as TVectorNode;

describe('continueVectorEraseDrag', () => {
  afterEach(() => store.dispatch(setVectorEditingNodeIds([])));

  it('should do nothing when no erase drag is armed', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const before = currentNode(nodeId).segments;

    // action
    continueVectorEraseDrag(createCanvas(), move(50, 0), store.dispatch, { current: null }, { current: 10 });

    // result
    expect(currentNode(nodeId).segments).toBe(before);
  });

  it('should erase along the capsule from the last point to the pointer and advance lastPoint', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const dragRef: { current: TVectorEraseDragState | null } = { current: { lastPoint: { x: 40, y: 0 } } };

    // action
    continueVectorEraseDrag(createCanvas(), move(60, 0), store.dispatch, dragRef, { current: 12 });

    // result — the [40, 60] stretch is gone, leaving two stubs; lastPoint moved to the pointer
    expect(Object.keys(currentNode(nodeId).segments)).toHaveLength(2);
    expect(dragRef.current?.lastPoint).toEqual({ x: 60, y: 0 });
  });
});
