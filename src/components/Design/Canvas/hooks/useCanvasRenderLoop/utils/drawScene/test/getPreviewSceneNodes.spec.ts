// types
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getPreviewSceneNodes } from '../getPreviewSceneNodes';

const NODES = [
  { id: 'a', type: 'rectangle' },
  { id: 'b', type: 'rectangle' },
] as unknown as TSceneNode[];

describe('getPreviewSceneNodes', () => {
  it('should hand the very same array back when nothing is being edited or dragged', () => {
    // before
    const result = getPreviewSceneNodes(NODES, null, createCanvasRefs());

    // result
    expect(result).toBe(NODES);
  });

  it('should leave out the node currently being edited', () => {
    // before
    const result = getPreviewSceneNodes(NODES, 'a', createCanvasRefs());

    // result
    expect(result).toEqual([NODES[1]]);
  });

  it('should still merge previews while a width point is being dragged', () => {
    // mock
    const refs = createCanvasRefs();

    refs.vectorWidth.vectorWidthPointDragRef.current = { groupTargets: [], nodeId: 'zzz', point: { id: 'p' } } as never;

    // before
    const result = getPreviewSceneNodes(NODES, null, refs);

    // result
    expect(result).not.toBe(NODES);
    expect(result).toEqual(NODES);
  });
});
