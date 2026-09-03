// utils
import { getVisibleCanvasRect } from '../getVisibleCanvasRect';

describe('getVisibleCanvasRect', () => {
  it('should return the full canvas rect when both panels are collapsed', () => {
    // mock
    const canvasRect = { height: 600, width: 1000 } as DOMRect;

    // result
    expect(getVisibleCanvasRect(canvasRect, 0, 0)).toEqual({ height: 600, width: 1000, x: 0, y: 0 });
  });

  it('should subtract the left and right panel widths and offset x by the left panel width', () => {
    // mock
    const canvasRect = { height: 600, width: 1000 } as DOMRect;

    // result
    expect(getVisibleCanvasRect(canvasRect, 200, 100)).toEqual({ height: 600, width: 700, x: 200, y: 0 });
  });

  it('should clamp the visible width to zero instead of going negative when panels overlap the whole canvas', () => {
    // mock
    const canvasRect = { height: 600, width: 100 } as DOMRect;

    // result
    expect(getVisibleCanvasRect(canvasRect, 200, 200).width).toBe(0);
  });
});
