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
    handlePointerMove(createCanvas(), pointerEvent(50, 50), refs, IDENTITY_VIEWPORT, { current: null }, { current: [] });

    // result
    expect(refs.draftRef.current).toBeNull();
  });

  it('should update the draft text box and alignment guide as the pointer moves', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    handlePointerMove(createCanvas(), pointerEvent(120, 130), refs, IDENTITY_VIEWPORT, { current: { x: 20, y: 20 } }, { current: [] });

    // result
    expect(refs.draftRef.current).toMatchObject({
      height: 110,
      type: NodeType.text,
      width: 100,
      x: 20,
      y: 20,
    });
  });
});
