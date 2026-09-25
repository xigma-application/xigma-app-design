// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveSectionNewNodeTarget } from '../resolveSectionNewNodeTarget';

const section = (id: string, x: number, childIds: string[] = []): TSectionNode => ({
  childIds,
  fill: '#444444',
  height: 200,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 200,
  x,
  y: 0,
});

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 200,
  id: 'frame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 500,
  y: 0,
};

describe('resolveSectionNewNodeTarget', () => {
  it('should target the section under the point and append after its children', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before
    const result = resolveSectionNewNodeTarget(canvasRefs, { x: 100, y: 100 }, [section('outer', 0, ['a'])]);

    // result
    expect(result).toEqual({ parentId: 'outer', targetIndex: 1 });
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe('outer');
  });

  it('should return null and clear the highlight over a frame', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.dropTargetFrameIdRef.current = 'stale';

    // before
    const result = resolveSectionNewNodeTarget(canvasRefs, { x: 600, y: 100 }, [frame]);

    // result
    expect(result).toBeNull();
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBeNull();
  });
});
