// utils
import { applyPan } from '../applyPan';

describe('applyPan', () => {
  it('should shift the viewport opposite to the scroll delta', () => {
    // before
    const next = applyPan({ x: 0, y: 0, zoom: 1 }, 10, 20);

    // result
    expect(next).toEqual({ x: -10, y: -20, zoom: 1 });
  });

  it('should accumulate on top of an existing offset without touching zoom', () => {
    // before
    const next = applyPan({ x: 5, y: -5, zoom: 2 }, -10, 5);

    // result
    expect(next).toEqual({ x: 15, y: -10, zoom: 2 });
  });
});
