import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageCropMoveDragState } from 'types/design/canvas/types';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueImageCropMoveDrag } from '../continueImageCropMoveDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createRef = (dragState: TImageCropMoveDragState | null = null): RefObject<TImageCropMoveDragState | null> => ({
  current: dragState,
});

const addImageRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
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

const getCropRect = (nodeId: string): TImagePaint['crop'] => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;
  const paint = node.fills[0] as TImagePaint;

  return paint.crop;
};

describe('continueImageCropMoveDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no move drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueImageCropMoveDrag(canvas, pointerEvent(30, 50), store.dispatch, createRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should offset the crop rect by the pointer delta from the drag start point', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 10, y: 10 };
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before — cursor moved 5 world units right, 8 down from the drag start
    continueImageCropMoveDrag(canvas, pointerEvent(5, 8), store.dispatch, dragRef);

    // result
    expect(getCropRect(nodeId)).toEqual({ height: 40, rotation: 0, width: 40, x: 15, y: 18 });
  });

  it('should leave the size and rotation of the crop rect untouched while moving', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 25, width: 60, x: 0, y: 0 };
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before
    continueImageCropMoveDrag(canvas, pointerEvent(10, 0), store.dispatch, dragRef);

    // result
    expect(getCropRect(nodeId)).toEqual({ height: 40, rotation: 25, width: 60, x: 10, y: 0 });
  });

  it('should not throw when the dragged node no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ nodeId: 'gone', origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before / result
    expect(() => continueImageCropMoveDrag(canvas, pointerEvent(10, 10), store.dispatch, dragRef)).not.toThrow();
  });

  it('should do nothing when the targeted paint is no longer an image', () => {
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
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before / result — no crash, solid fill left untouched
    expect(() => continueImageCropMoveDrag(canvas, pointerEvent(10, 10), store.dispatch, dragRef)).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
