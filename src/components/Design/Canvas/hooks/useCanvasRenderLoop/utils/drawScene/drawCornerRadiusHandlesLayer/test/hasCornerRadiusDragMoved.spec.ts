// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { hasCornerRadiusDragMoved } from '../hasCornerRadiusDragMoved';

describe('hasCornerRadiusDragMoved', () => {
  it('should return false when no corner-radius drag ref has a current value', () => {
    // result
    expect(hasCornerRadiusDragMoved(createCanvasRefs())).toBe(false);
  });

  it('should return true when the rectangle corner-radius drag has moved', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: {
        cornerRadiusDragRef: {
          current: {
            bounds: { height: 100, width: 100, x: 0, y: 0 },
            candidates: ['ne'],
            corner: 'ne',
            hasMoved: true,
            nodeId: 'rect-1',
            pointerStart: { x: 0, y: 0 },
            rotation: 0,
          },
        },
      },
    });

    // result
    expect(hasCornerRadiusDragMoved(refs)).toBe(true);
  });

  it('should return true when the polygon corner-radius drag has moved', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: {
        polygonCornerRadiusDragRef: {
          current: {
            bounds: { height: 100, width: 100, x: 0, y: 0 },
            flipX: false,
            flipY: false,
            hasMoved: true,
            nodeId: 'polygon-1',
            rotation: 0,
            sides: 3,
          },
        },
      },
    });

    // result
    expect(hasCornerRadiusDragMoved(refs)).toBe(true);
  });

  it('should return true when the star corner-radius drag has moved', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: {
        starCornerRadiusDragRef: {
          current: {
            bounds: { height: 100, width: 100, x: 0, y: 0 },
            flipX: false,
            flipY: false,
            hasMoved: true,
            nodeId: 'star-1',
            points: 5,
            ratio: 0.5,
            rotation: 0,
          },
        },
      },
    });

    // result
    expect(hasCornerRadiusDragMoved(refs)).toBe(true);
  });

  it('should return false when a corner-radius drag ref has a current value but hasMoved is false', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: {
        cornerRadiusDragRef: {
          current: {
            bounds: { height: 100, width: 100, x: 0, y: 0 },
            candidates: ['ne'],
            corner: 'ne',
            hasMoved: false,
            nodeId: 'rect-1',
            pointerStart: { x: 0, y: 0 },
            rotation: 0,
          },
        },
      },
    });

    // result
    expect(hasCornerRadiusDragMoved(refs)).toBe(false);
  });
});
