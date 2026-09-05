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
  it('should do nothing when the drag has not started', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    handlePointerMove(createCanvas(), pointerEvent(50, 50), refs, IDENTITY_VIEWPORT, { current: null }, { current: [] }, '#ff0000', 5, 0.5);

    // result
    expect(refs.draftRef.current).toBeNull();
  });

  it('should update the draft star and alignment guide as the pointer moves', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(120, 130),
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: [] },
      '#00ff00',
      6,
      0.4,
    );

    // result
    expect(refs.draftRef.current).toMatchObject({
      fill: '#00ff00',
      height: 110,
      points: 6,
      ratio: 0.4,
      type: NodeType.star,
      width: 100,
      x: 20,
      y: 20,
    });
    expect(refs.transform.aspectRatioLockGuideRef.current).toBeNull();
  });

  it('should set a square aspect-ratio-lock guide while Shift is held', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(120, 130, { shiftKey: true }),
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: [] },
      '#00ff00',
      5,
      0.5,
    );

    // result
    expect(refs.transform.aspectRatioLockGuideRef.current).toMatchObject({ rotation: 0 });
  });
});
