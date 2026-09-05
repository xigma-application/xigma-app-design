// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerMove } from '../handlePointerMove';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerMove', () => {
  it('should track the pointer’s client position even before a drag has started', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: null };
    const lastPointerClientPositionRef = { current: null };
    const refs = createCanvasRefs();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(20, 20),
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
      'default',
      'default',
      '#000000',
    );

    // result
    expect(lastPointerClientPositionRef.current).toEqual({ x: 20, y: 20 });
    expect(refs.draftRef.current).toBeNull();
  });

  it('should write a rounded, angle-snapped draft line while dragging', () => {
    // mock — near-horizontal drag, softly snaps flat even without Shift
    const canvas = createCanvas();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: null };
    const refs = createCanvasRefs();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(150, 5),
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
      'arrow',
      'default',
      '#00ff00',
    );

    // result
    expect(refs.draftRef.current).toEqual({
      endPoint: 'arrow',
      startPoint: 'default',
      stroke: '#00ff00',
      type: NodeType.line,
      x1: 0,
      x2: 150,
      y1: 0,
      y2: 0,
    });
  });

  it('should hard-snap to the nearest 15° increment while Shift is held', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: null };
    const refs = createCanvasRefs();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(100, 20, { shiftKey: true }),
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
      'default',
      'default',
      '#000000',
    );

    // result
    expect(refs.draftRef.current).toMatchObject({ x2: 98, y2: 26 });
  });
});
