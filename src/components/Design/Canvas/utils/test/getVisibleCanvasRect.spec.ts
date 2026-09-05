// types
import { TLayoutRefs } from 'types/design/canvas/types';

// utils
import { getVisibleCanvasRect } from '../getVisibleCanvasRect';

const layout = (leftPanelWidth: number, rightPanelWidth: number): TLayoutRefs => ({
  leftPanelWidthRef: { current: leftPanelWidth },
  rightPanelWidthRef: { current: rightPanelWidth },
});

describe('getVisibleCanvasRect', () => {
  it('should return the full canvas rect when both panels are collapsed', () => {
    // mock
    const canvasRect = { height: 600, width: 1000 } as DOMRect;

    // result
    expect(getVisibleCanvasRect(canvasRect, layout(0, 0))).toEqual({ height: 600, width: 1000, x: 0, y: 0 });
  });

  it('should subtract the left and right panel widths and offset x by the left panel width', () => {
    // mock
    const canvasRect = { height: 600, width: 1000 } as DOMRect;

    // result
    expect(getVisibleCanvasRect(canvasRect, layout(200, 100))).toEqual({ height: 600, width: 700, x: 200, y: 0 });
  });

  it('should clamp the visible width to zero instead of going negative when panels overlap the whole canvas', () => {
    // mock
    const canvasRect = { height: 600, width: 100 } as DOMRect;

    // result
    expect(getVisibleCanvasRect(canvasRect, layout(200, 200)).width).toBe(0);
  });
});
