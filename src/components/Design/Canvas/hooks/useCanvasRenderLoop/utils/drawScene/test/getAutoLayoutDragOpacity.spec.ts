// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getAutoLayoutDragOpacity } from '../getAutoLayoutDragOpacity';

describe('getAutoLayoutDragOpacity', () => {
  it('should return 0.5 when the node is dragged and an auto-layout drop target is active', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['a']) },
      },
    });

    // result
    expect(getAutoLayoutDragOpacity(refs, 'a')).toBe(0.5);
  });

  it('should return 1 when no auto-layout drop target is active', () => {
    // mock
    const refs = createCanvasRefs({ transform: { draggedNodeIdsRef: { current: new Set(['a']) } } });

    // result
    expect(getAutoLayoutDragOpacity(refs, 'a')).toBe(1);
  });

  it('should return 1 for a node other than the one being dragged', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['a']) },
      },
    });

    // result
    expect(getAutoLayoutDragOpacity(refs, 'b')).toBe(1);
  });

  it('should return 1 when no node is currently being dragged at all', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
      },
    });

    // result
    expect(getAutoLayoutDragOpacity(refs, 'a')).toBe(1);
  });
});
