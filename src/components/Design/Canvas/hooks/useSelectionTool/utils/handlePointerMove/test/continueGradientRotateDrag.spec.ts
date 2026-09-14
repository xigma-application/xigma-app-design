import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGradientRotateDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueGradientRotateDrag } from '../continueGradientRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createGradientRotateDragRef = (
  dragState: TGradientRotateDragState | null = null,
): RefObject<TGradientRotateDragState | null> => ({ current: dragState });

const addGradientRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [
        {
          end: { x: 1, y: 0.5 },
          opacity: 100,
          start: { x: 0, y: 0.5 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-linear',
        },
      ],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const getGradientPoints = (nodeId: string): { end: TPoint; start: TPoint } | null => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;
  const paint = node.fills[0];

  return paint.type === 'gradient-linear' ? { end: paint.end, start: paint.start } : null;
};

const expectPointCloseTo = (point: TPoint, expected: TPoint): void => {
  expect(point.x).toBeCloseTo(expected.x, 5);
  expect(point.y).toBeCloseTo(expected.y, 5);
};

describe('continueGradientRotateDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no gradient rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueGradientRotateDrag(canvas, pointerEvent(30, 50), store.dispatch, createGradientRotateDragRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should rotate both points so the dragged start endpoint follows the pointer', () => {
    // mock — square bounds (0,0)-(100,100), center (50,50); pointer at world (100,0) is the top-right corner
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({ draggedEndpoint: 'start', nodeId, paintIndex: 0, pointerPosition: { x: 0, y: 0 } });

    // before
    continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef);

    // result
    const points = getGradientPoints(nodeId);

    expectPointCloseTo(points!.start, { x: 1, y: 0 });
    expectPointCloseTo(points!.end, { x: 0, y: 1 });
  });

  it('should keep the un-dragged end fixed at the opposite side when dragging the end endpoint toward the same pointer position', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({ draggedEndpoint: 'end', nodeId, paintIndex: 0, pointerPosition: { x: 0, y: 0 } });

    // before
    continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef);

    // result — the dragged endpoint (end) follows the pointer this time, so start/end are swapped vs. the 'start' case
    const points = getGradientPoints(nodeId);

    expectPointCloseTo(points!.end, { x: 1, y: 0 });
    expectPointCloseTo(points!.start, { x: 0, y: 1 });
  });

  it('should update the drag state pointer position for the following angle label', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({ draggedEndpoint: 'start', nodeId, paintIndex: 0, pointerPosition: { x: 0, y: 0 } });

    // before
    continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef);

    // result
    expectPointCloseTo(dragRef.current!.pointerPosition, { x: 100, y: 0 });
  });

  it('should do nothing when the targeted paint is no longer a linear gradient', () => {
    // mock — the fill was switched to solid since the drag started
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({ draggedEndpoint: 'start', nodeId, paintIndex: 0, pointerPosition: { x: 0, y: 0 } });

    // before / result — no crash, and the solid fill is left untouched
    expect(() => continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef)).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
