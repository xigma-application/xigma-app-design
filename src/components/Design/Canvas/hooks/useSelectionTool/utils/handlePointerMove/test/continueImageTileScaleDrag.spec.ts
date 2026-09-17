import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TImageTileScaleDragState } from 'types/design/canvas/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueImageTileScaleDrag } from '../continueImageTileScaleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createRef = (dragState: TImageTileScaleDragState | null = null): RefObject<TImageTileScaleDragState | null> => ({
  current: dragState,
});

const addImageRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scale: 1, scaleMode: 'tile', type: 'image' }],
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

const getPaint = (nodeId: string): TImagePaint => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;

  return node.fills[0] as TImagePaint;
};

describe('continueImageTileScaleDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no tile-scale drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueImageTileScaleDrag(canvas, pointerEvent(30, 50), store.dispatch, createRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should grow the scale proportionally as the pointer moves away from the anchor corner', () => {
    // mock — anchored to (0,0), started at distance 100 (the (100,0) point) with scale 1
    const nodeId = addImageRectangle();
    const dragRef = createRef({ anchor: { x: 0, y: 0 }, nodeId, paintIndex: 0, startDistance: 100, startScale: 1 });
    const canvas = createCanvas();

    // action — dragging out to (200,0) doubles the distance from the anchor
    continueImageTileScaleDrag(canvas, pointerEvent(200, 0), store.dispatch, dragRef);

    // result
    expect(getPaint(nodeId).scale).toBe(2);
  });

  it('should shrink the scale as the pointer moves toward the anchor corner', () => {
    // mock
    const nodeId = addImageRectangle();
    const dragRef = createRef({ anchor: { x: 0, y: 0 }, nodeId, paintIndex: 0, startDistance: 100, startScale: 1 });
    const canvas = createCanvas();

    // action — halfway to the anchor halves the scale
    continueImageTileScaleDrag(canvas, pointerEvent(50, 0), store.dispatch, dragRef);

    // result
    expect(getPaint(nodeId).scale).toBe(0.5);
  });

  it('should grow the scale again once the pointer crosses past the anchor corner, instead of mirroring', () => {
    // mock — dragging 20px past the anchor on the opposite side is farther than starting at 100
    const nodeId = addImageRectangle();
    const dragRef = createRef({ anchor: { x: 0, y: 0 }, nodeId, paintIndex: 0, startDistance: 100, startScale: 1 });
    const canvas = createCanvas();

    // action
    continueImageTileScaleDrag(canvas, pointerEvent(-120, 0), store.dispatch, dragRef);

    // result — distance from anchor is 120, i.e. bigger than the 100 starting distance
    expect(getPaint(nodeId).scale).toBe(1.2);
  });

  it('should clamp the resulting scale to the configured minimum and maximum', () => {
    // mock
    const nodeId = addImageRectangle();
    const dragRef = createRef({ anchor: { x: 0, y: 0 }, nodeId, paintIndex: 0, startDistance: 100, startScale: 1 });
    const canvas = createCanvas();

    // action — moving almost onto the anchor would compute a near-zero scale
    continueImageTileScaleDrag(canvas, pointerEvent(0.001, 0), store.dispatch, dragRef);

    // result
    expect(getPaint(nodeId).scale).toBe(0.01);
  });
});
