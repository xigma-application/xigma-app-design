import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEndpointDragState } from 'types/design/selectionTool/types';

// utils
import { continueEndpointDrag } from '../continueEndpointDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createEndpointDragRef = (endpointDragState: TEndpointDragState | null = null): RefObject<TEndpointDragState | null> => ({
  current: endpointDragState,
});

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueEndpointDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no endpoint drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueEndpointDrag(canvas, pointerEvent(10, 10), store.dispatch, createEndpointDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should move the "a" endpoint to the pointer position', () => {
    // mock
    const idA = addLineNode(100, 100, 200, 100);
    const canvas = createCanvas();
    const endpointDragRef = createEndpointDragRef({ endpoint: 'a', nodeId: idA });

    // before
    continueEndpointDrag(canvas, pointerEvent(50, 60), store.dispatch, endpointDragRef);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ x1: 50, x2: 200, y1: 60, y2: 100 });
  });

  it('should move the "b" endpoint to the pointer position', () => {
    // mock
    const idA = addLineNode(100, 100, 200, 100);
    const canvas = createCanvas();
    const endpointDragRef = createEndpointDragRef({ endpoint: 'b', nodeId: idA });

    // before
    continueEndpointDrag(canvas, pointerEvent(250, 260), store.dispatch, endpointDragRef);

    // result
    const node = store.getState().design.nodes[idA];

    expect(node).toMatchObject({ x1: 100, x2: 250, y1: 100, y2: 260 });
  });
});
