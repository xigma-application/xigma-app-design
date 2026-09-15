import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGradientEndpointMoveDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueGradientEndpointMoveDrag } from '../continueGradientEndpointMoveDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createGradientEndpointMoveDragRef = (
  dragState: TGradientEndpointMoveDragState | null = null,
): RefObject<TGradientEndpointMoveDragState | null> => ({ current: dragState });

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

describe('continueGradientEndpointMoveDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no gradient endpoint move drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueGradientEndpointMoveDrag(canvas, pointerEvent(30, 50), store.dispatch, createGradientEndpointMoveDragRef(), createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should move the dragged endpoint freely to the raw cursor position, leaving the other endpoint untouched', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientEndpointMoveDragRef({ endpoint: 'start', nodeId, paintIndex: 0 });

    // before
    continueGradientEndpointMoveDrag(canvas, pointerEvent(30, 40), store.dispatch, dragRef, createCanvasRefs());

    // result
    const points = getGradientPoints(nodeId);

    expect(points!.start).toEqual({ x: 0.3, y: 0.4 });
    expect(points!.end).toEqual({ x: 1, y: 0.5 });
  });

  it('should let the point travel outside the shape bounds, unclamped, like Figma', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientEndpointMoveDragRef({ endpoint: 'start', nodeId, paintIndex: 0 });

    // before — world (150, 40) is past the right edge (bounds are 0..100)
    continueGradientEndpointMoveDrag(canvas, pointerEvent(150, 40), store.dispatch, dragRef, createCanvasRefs());

    // result
    const points = getGradientPoints(nodeId);

    expect(points!.start.x).toBeCloseTo(1.5, 5);
    expect(points!.start.y).toBeCloseTo(0.4, 5);
  });

  it('should snap onto a corner and set both alignment guide axes when close to it', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientEndpointMoveDragRef({ endpoint: 'start', nodeId, paintIndex: 0 });
    const canvasRefs = createCanvasRefs();

    // before — world (2, 2) is close to the top-left corner (0,0)
    continueGradientEndpointMoveDrag(canvas, pointerEvent(2, 2), store.dispatch, dragRef, canvasRefs);

    // result
    const points = getGradientPoints(nodeId);

    expect(points!.start).toEqual({ x: 0, y: 0 });
    expect(canvasRefs.transform.alignmentGuideRef.current?.horizontal).not.toBeNull();
    expect(canvasRefs.transform.alignmentGuideRef.current?.vertical).not.toBeNull();
  });

  it('should clear the alignment guide when nowhere near a snap landmark', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientEndpointMoveDragRef({ endpoint: 'start', nodeId, paintIndex: 0 });
    const canvasRefs = createCanvasRefs();

    // before
    continueGradientEndpointMoveDrag(canvas, pointerEvent(30, 40), store.dispatch, dragRef, canvasRefs);

    // result
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });

  it('should move the end endpoint when that is the dragged one, leaving start untouched', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientEndpointMoveDragRef({ endpoint: 'end', nodeId, paintIndex: 0 });

    // before
    continueGradientEndpointMoveDrag(canvas, pointerEvent(30, 40), store.dispatch, dragRef, createCanvasRefs());

    // result
    const points = getGradientPoints(nodeId);

    expect(points!.end).toEqual({ x: 0.3, y: 0.4 });
    expect(points!.start).toEqual({ x: 0, y: 0.5 });
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
    const dragRef = createGradientEndpointMoveDragRef({ endpoint: 'start', nodeId, paintIndex: 0 });

    // before / result — no crash, and the solid fill is left untouched
    expect(() => continueGradientEndpointMoveDrag(canvas, pointerEvent(30, 40), store.dispatch, dragRef, createCanvasRefs())).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
