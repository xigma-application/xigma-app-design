import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
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

const addImageRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
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
      ...overrides,
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
    continueImageCropMoveDrag(canvas, pointerEvent(30, 50), store.dispatch, createRef(), createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should offset the crop rect by the pointer delta from the drag start point', () => {
    // mock — well clear of any frame edge/center so nothing snaps
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 10, rotation: 0, width: 10, x: 60, y: 60 };
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before — cursor moved 5 world units right, 8 down from the drag start
    continueImageCropMoveDrag(canvas, pointerEvent(5, 8), store.dispatch, dragRef, createCanvasRefs());

    // result
    expect(getCropRect(nodeId)).toEqual({ height: 10, rotation: 0, width: 10, x: 65, y: 68 });
  });

  it('should leave the size and rotation of the crop rect untouched while moving', () => {
    // mock
    const nodeId = addImageRectangle();
    const canvas = createCanvas();
    const origin = { height: 10, rotation: 25, width: 10, x: 60, y: 60 };
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before
    continueImageCropMoveDrag(canvas, pointerEvent(10, 0), store.dispatch, dragRef, createCanvasRefs());

    // result
    expect(getCropRect(nodeId)).toEqual({ height: 10, rotation: 25, width: 10, x: 70, y: 60 });
  });

  it('should not throw when the dragged node no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const origin = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };
    const dragRef = createRef({ nodeId: 'gone', origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before / result
    expect(() => continueImageCropMoveDrag(canvas, pointerEvent(10, 10), store.dispatch, dragRef, createCanvasRefs())).not.toThrow();
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
    expect(() => continueImageCropMoveDrag(canvas, pointerEvent(10, 10), store.dispatch, dragRef, createCanvasRefs())).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });

  describe('smart guides', () => {
    it("should snap the crop to the frame's center on both axes when the raw drag lands within tolerance, and draw a guide spanning the frame", () => {
      // mock — a 40x40 crop on a 100x100 frame at (0,0); dragging so its center lands 1 unit off (50,50)
      const nodeId = addImageRectangle();
      const canvas = createCanvas();
      const origin = { height: 40, rotation: 0, width: 40, x: 8, y: 8 };
      const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });
      const canvasRefs = createCanvasRefs();

      // before
      continueImageCropMoveDrag(canvas, pointerEvent(21, 21), store.dispatch, dragRef, canvasRefs);

      // result — snapped so the crop's own center lands exactly on the frame's center (50,50)
      expect(getCropRect(nodeId)).toEqual({ height: 40, rotation: 0, width: 40, x: 30, y: 30 });
      expect(canvasRefs.transform.alignmentGuideRef.current).toEqual({
        horizontal: { anchor: { x: 0, y: 50 }, match: { x: 100, y: 50 } },
        vertical: { anchor: { x: 50, y: 0 }, match: { x: 50, y: 100 } },
      });
    });

    it("should snap flush to the frame's own edge on a single axis, without touching the other", () => {
      // mock — dragging the crop's left edge to just inside the frame's own left edge (x=0)
      const nodeId = addImageRectangle();
      const canvas = createCanvas();
      const origin = { height: 40, rotation: 0, width: 40, x: 5, y: 55 };
      const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });
      const canvasRefs = createCanvasRefs();

      // before
      continueImageCropMoveDrag(canvas, pointerEvent(-4, 0), store.dispatch, dragRef, canvasRefs);

      // result — x snapped flush to the frame's left edge, y moved by the raw (unsnapped) delta
      expect(getCropRect(nodeId)).toEqual({ height: 40, rotation: 0, width: 40, x: 0, y: 55 });
      expect(canvasRefs.transform.alignmentGuideRef.current).toEqual({
        horizontal: null,
        vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 100 } },
      });
    });

    it('should not snap or draw a guide when the crop rect has its own independent rotation', () => {
      // mock — same near-center-alignment setup as the center-snap test, but the crop is rotated
      const nodeId = addImageRectangle();
      const canvas = createCanvas();
      const origin = { height: 40, rotation: 25, width: 40, x: 8, y: 8 };
      const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });
      const canvasRefs = createCanvasRefs();

      // before
      continueImageCropMoveDrag(canvas, pointerEvent(21, 21), store.dispatch, dragRef, canvasRefs);

      // result — the raw, unsnapped delta is applied as-is
      expect(getCropRect(nodeId)).toEqual({ height: 40, rotation: 25, width: 40, x: 29, y: 29 });
      expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
    });

    it('should not snap or draw a guide when the frame itself is rotated', () => {
      // mock — same near-center-alignment setup, but the frame is rotated
      const nodeId = addImageRectangle({ rotation: 25 });
      const canvas = createCanvas();
      const origin = { height: 40, rotation: 0, width: 40, x: 8, y: 8 };
      const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });
      const canvasRefs = createCanvasRefs();

      // before
      continueImageCropMoveDrag(canvas, pointerEvent(21, 21), store.dispatch, dragRef, canvasRefs);

      // result
      expect(getCropRect(nodeId)).toEqual({ height: 40, rotation: 0, width: 40, x: 29, y: 29 });
      expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
    });

    it('should clear a previously drawn guide once the drag moves out of snapping range', () => {
      // mock — start with a stale guide left over from an earlier, snapped tick
      const nodeId = addImageRectangle();
      const canvas = createCanvas();
      const origin = { height: 10, rotation: 0, width: 10, x: 60, y: 60 };
      const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });
      const canvasRefs = createCanvasRefs();

      canvasRefs.transform.alignmentGuideRef.current = {
        horizontal: { anchor: { x: 0, y: 0 }, match: { x: 1, y: 0 } },
        vertical: null,
      };

      // before — moved well clear of any frame edge/center
      continueImageCropMoveDrag(canvas, pointerEvent(5, 8), store.dispatch, dragRef, canvasRefs);

      // result
      expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
    });
  });

  it('should move the crop of the image stroke being edited, leaving the fills untouched', () => {
    // mock
    const nodeId = addImageRectangle({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      strokes: [{ opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' }],
    });
    const canvas = createCanvas();
    const origin = { height: 10, rotation: 0, width: 10, x: 60, y: 60 };
    const dragRef = createRef({ nodeId, origin, paintIndex: 0, startPoint: { x: 0, y: 0 } });

    // before
    store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex: 0, property: 'strokes' }));
    continueImageCropMoveDrag(canvas, pointerEvent(5, 8), store.dispatch, dragRef, createCanvasRefs());

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;

    expect((node.strokes?.[0] as TImagePaint).crop).toEqual({ height: 10, rotation: 0, width: 10, x: 65, y: 68 });
    expect(node.fills[0]).toEqual({ color: '#ff0000', opacity: 100, type: 'solid' });

    store.dispatch(setImageEditor(null));
  });
});
