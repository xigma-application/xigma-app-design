// utils
import { applyDragPan } from '../applyDragPan';

describe('applyDragPan', () => {
  it('should move the viewport by the same delta as the cursor (direct drag, unlike inverted scroll-pan)', () => {
    // before
    const next = applyDragPan({ x: 0, y: 0, zoom: 1 }, 10, -20);

    // result
    expect(next).toEqual({ x: 10, y: -20, zoom: 1 });
  });

  it('should accumulate on top of an existing offset without touching zoom', () => {
    // before
    const next = applyDragPan({ x: 5, y: -5, zoom: 2 }, -10, 5);

    // result
    expect(next).toEqual({ x: -5, y: 0, zoom: 2 });
  });
});
