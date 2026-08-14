// utils
import { getScaleFactors } from '../getScaleFactors';

describe('getScaleFactors', () => {
  it('should return the scale anchors alongside the axis scale factors for an edge handle', () => {
    // mock — "n" (top edge) of a 100x50 box, dragged straight up by 100 (doubling both dimensions)
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result
    expect(getScaleFactors('n', bounds, { x: 50, y: -50 }, 2)).toEqual({ anchors: { x: 50, y: 50 }, scaleX: 2, scaleY: 2 });
  });

  it('should return the scale anchors alongside the axis scale factors for a corner handle', () => {
    // mock
    const bounds = { height: 100, width: 100, x: 0, y: 0 };

    // result
    expect(getScaleFactors('se', bounds, { x: 100, y: 20 }, 2)).toEqual({ anchors: { x: 0, y: 0 }, scaleX: 1, scaleY: 0.5 });
  });
});
