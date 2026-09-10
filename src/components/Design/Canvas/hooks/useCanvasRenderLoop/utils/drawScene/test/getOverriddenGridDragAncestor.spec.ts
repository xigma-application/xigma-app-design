// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getOverriddenGridDragAncestor } from '../getOverriddenGridDragAncestor';

const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
const frame: TFrameNode = { childIds: ['r'], clipContent: true, fill: '#fff', height: 20, id: 'f', name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }; // prettier-ignore

const refsWithGhost = (nodeIds: string[]): TCanvasRefs =>
  createCanvasRefs({ transform: { gridDragGhostRef: { current: { nodeIds, offset: { x: 7, y: -4 } } } } });

describe('getOverriddenGridDragAncestor', () => {
  it('should return the offset when the node itself is in the ghost', () => {
    expect(getOverriddenGridDragAncestor(refsWithGhost(['r']).transform.gridDragGhostRef, rect, { r: rect })).toEqual({ x: 7, y: -4 });
  });

  it('should return the offset when an ancestor is in the ghost, not the node itself', () => {
    const child = { ...rect, parentId: 'f' };

    expect(getOverriddenGridDragAncestor(refsWithGhost(['f']).transform.gridDragGhostRef, child, { f: frame, r: child })).toEqual({
      x: 7,
      y: -4,
    });
  });

  it('should return undefined when there is no active ghost', () => {
    const refs = createCanvasRefs();

    expect(getOverriddenGridDragAncestor(refs.transform.gridDragGhostRef, rect, { r: rect })).toBeUndefined();
  });

  it('should return undefined when neither the node nor any ancestor is in the ghost', () => {
    const child = { ...rect, parentId: 'f' };

    expect(
      getOverriddenGridDragAncestor(refsWithGhost(['other']).transform.gridDragGhostRef, child, { f: frame, r: child }),
    ).toBeUndefined();
  });
});
