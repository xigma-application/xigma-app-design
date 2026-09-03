// utils
import { createCanvasRefs } from '../../hooks/useCanvasRefs/createCanvasRefs';
import { isSmartSelectionGapHandleActive } from '../isSmartSelectionGapHandleActive';

describe('isSmartSelectionGapHandleActive', () => {
  it('should return false when neither hovering nor dragging a gap handle', () => {
    expect(isSmartSelectionGapHandleActive(createCanvasRefs())).toBe(false);
  });

  it('should return true while hovering a gap handle', () => {
    const refs = createCanvasRefs({
      hover: { hoveredSmartSelectionGapRef: { current: { axis: 'x', gapValue: 50, point: { x: 0, y: 0 } } } },
    });

    expect(isSmartSelectionGapHandleActive(refs)).toBe(true);
  });

  it('should return true while dragging a gap handle', () => {
    const refs = createCanvasRefs({
      smartSelection: {
        gapDragRef: {
          current: {
            anchorPosition: 0,
            anchorSize: 50,
            axis: 'x',
            badgeAnchor: { x: 0, y: 0 },
            cascadeGroups: [],
            currentGapValue: 50,
            dispatchThrottle: { frameId: null, run: null },
            gapIndex: 0,
            hasMoved: false,
            nodeOrigins: {},
            originalGapValue: 50,
            pointerStart: { x: 0, y: 0 },
          },
        },
      },
    });

    expect(isSmartSelectionGapHandleActive(refs)).toBe(true);
  });
});
