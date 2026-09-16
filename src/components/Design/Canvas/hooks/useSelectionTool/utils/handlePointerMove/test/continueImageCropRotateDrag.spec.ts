import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageCropRotateDragState } from 'types/design/canvas/types';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueImageCropRotateDrag } from '../continueImageCropRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createRef = (dragState: TImageCropRotateDragState | null = null): RefObject<TImageCropRotateDragState | null> => ({
  current: dragState,
});

const addImageRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 40,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
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

describe('continueImageCropRotateDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueImageCropRotateDrag(canvas, pointerEvent(30, 50), store.dispatch, createRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should add the swept angle onto the crop rotation, keeping the center fixed since the pivot is the rect center', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    // start angle 0 (cursor directly right of the pivot/center)
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, pivot: { x: 20, y: 20 }, startAngle: 0 });

    // before — cursor now directly below the pivot: a 90deg sweep
    continueImageCropRotateDrag(canvas, pointerEvent(20, 40), store.dispatch, dragRef);

    // result
    expect(getCropRect(nodeId)).toEqual({ height: 40, rotation: 90, width: 40, x: 0, y: 0 });
  });

  it('should not throw when the dragged node no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ nodeId: 'gone', origin, paintIndex: 0, pivot: { x: 20, y: 20 }, startAngle: 0 });

    // before / result
    expect(() => continueImageCropRotateDrag(canvas, pointerEvent(20, 40), store.dispatch, dragRef)).not.toThrow();
  });

  it('should do nothing when the targeted paint is no longer an image', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 40,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 40,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, pivot: { x: 20, y: 20 }, startAngle: 0 });

    // before / result
    expect(() => continueImageCropRotateDrag(canvas, pointerEvent(20, 40), store.dispatch, dragRef)).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
