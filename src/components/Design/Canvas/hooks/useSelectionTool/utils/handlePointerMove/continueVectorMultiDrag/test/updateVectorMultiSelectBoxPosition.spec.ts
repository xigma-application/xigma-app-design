// types
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { updateVectorMultiSelectBoxPosition } from '../updateVectorMultiSelectBoxPosition';

const dragState = (boxOrigin: TVectorMultiDragState['boxOrigin']): TVectorMultiDragState => ({
  boxOrigin,
  dispatchThrottle: { frameId: null, run: null },
  handleOrigins: {},
  hasMoved: false,
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
  vertexOrigins: {},
});

describe('updateVectorMultiSelectBoxPosition', () => {
  it('should translate the canonical box’s bounds by the delta, preserving its rotation and selection key', () => {
    // mock
    const refs = createCanvasRefs();

    refs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1,v2',
    };

    // before
    updateVectorMultiSelectBoxPosition(refs, dragState({ height: 0, width: 100, x: 0, y: 0 }), 10, 4);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toEqual({
      bounds: { height: 0, width: 100, x: 10, y: 4 },
      rotation: 0,
      selectionKey: 'v1,v2',
    });
  });

  it('should do nothing when this drag never snapshotted a box origin', () => {
    // mock
    const refs = createCanvasRefs();

    refs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1',
    };

    // before
    updateVectorMultiSelectBoxPosition(refs, dragState(null), 10, 4);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toEqual({
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1',
    });
  });

  it('should do nothing when there is no canonical box to update', () => {
    // mock
    const refs = createCanvasRefs();

    // before & result — must not throw
    expect(() => updateVectorMultiSelectBoxPosition(refs, dragState({ height: 0, width: 100, x: 0, y: 0 }), 10, 4)).not.toThrow();
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toBeNull();
  });
});
