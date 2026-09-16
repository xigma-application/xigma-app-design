// utils
import { armImageCropHandleOnPointerDown } from '../armImageCropHandleOnPointerDown';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const canvas = { setPointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
const event = { pointerId: 1 } as PointerEvent;
const viewport = { x: 0, y: 0, zoom: 1 };
const crop = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };

describe('armImageCropHandleOnPointerDown', () => {
  it('should arm a resize drag and claim the event when a resize handle is hit', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before — top-left corner
    const result = armImageCropHandleOnPointerDown(canvas, canvasRefs, event, 'node-a', 0, crop, { x: 0, y: 0 }, viewport);

    // result
    expect(result).toBe(true);
    expect(canvasRefs.imageCrop.imageCropResizeDragRef.current).toEqual({ handle: 'nw', nodeId: 'node-a', origin: crop, paintIndex: 0 });
  });

  it('should arm a rotate drag and claim the event when just outside a corner', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before — a few px outside the nw corner, within the rotate ring
    const result = armImageCropHandleOnPointerDown(canvas, canvasRefs, event, 'node-a', 0, crop, { x: -10, y: -10 }, viewport);

    // result
    expect(result).toBe(true);
    expect(canvasRefs.imageCrop.imageCropRotateDragRef.current).not.toBeNull();
    expect(canvasRefs.imageCrop.imageCropResizeDragRef.current).toBeNull();
  });

  it('should return undefined and arm nothing far from every handle', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before
    const result = armImageCropHandleOnPointerDown(canvas, canvasRefs, event, 'node-a', 0, crop, { x: 20, y: 20 }, viewport);

    // result
    expect(result).toBeUndefined();
    expect(canvasRefs.imageCrop.imageCropResizeDragRef.current).toBeNull();
    expect(canvasRefs.imageCrop.imageCropRotateDragRef.current).toBeNull();
  });
});
