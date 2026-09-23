// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveFreeformNewNodeTarget } from '../resolveFreeformNewNodeTarget';

const frame = (childIds: string[]): TFrameNode => ({
  childIds,
  clipContent: true,
  fills: [],
  height: 400,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 0,
  y: 0,
});

describe('resolveFreeformNewNodeTarget', () => {
  it('should target the frame and append after its existing children', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.autoLayoutDropTargetRef.current = { frameId: 'stale' } as never;
    canvasRefs.transform.gridDropTargetRef.current = { cells: [], frameId: 'stale' } as never;

    // before
    const result = resolveFreeformNewNodeTarget(canvasRefs, frame(['a', 'b']));

    // result
    expect(result).toEqual({ parentId: 'frame-1', targetIndex: 2 });
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toBeNull();
    expect(canvasRefs.transform.gridDropTargetRef.current).toBeNull();
  });
});
