// types
import { TAutoLayoutDropTargetHover } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getHoistedDragIds } from '../getHoistedDragIds';

const sceneNodeById = new Map<string, TSceneNode>([
  ['loose', { id: 'loose', parentId: 'origin-frame' } as TSceneNode],
  ['root-node', { id: 'root-node' } as TSceneNode],
  ['frame', { id: 'frame', parentId: 'origin-frame' } as TSceneNode],
  ['frame-child', { id: 'frame-child', parentId: 'frame' } as TSceneNode],
  ['frame-grandchild', { id: 'frame-grandchild', parentId: 'frame-child' } as TSceneNode],
]);

const armDropTarget = (): TAutoLayoutDropTargetHover => ({
  frameId: 'target-frame',
  index: 0,
  indicator: { height: 0, width: 0, x: 0, y: 0 },
  siblingPositions: {},
});

describe('getHoistedDragIds', () => {
  it('returns an empty set when no auto-layout drop target is active', () => {
    const refs = createCanvasRefs();
    refs.transform.draggedNodeIdsRef.current = new Set(['loose']);

    expect(getHoistedDragIds(refs, sceneNodeById).size).toBe(0);
  });

  it('returns an empty set when nothing is being dragged', () => {
    const refs = createCanvasRefs();
    refs.transform.autoLayoutDropTargetRef.current = armDropTarget();

    expect(getHoistedDragIds(refs, sceneNodeById).size).toBe(0);
  });

  it('hoists a loose dragged node (parented or root-level) that exists in the scene, and ignores ids with no scene node', () => {
    const refs = createCanvasRefs();
    refs.transform.autoLayoutDropTargetRef.current = armDropTarget();
    refs.transform.draggedNodeIdsRef.current = new Set(['loose', 'root-node', 'ghost-only']);

    expect(getHoistedDragIds(refs, sceneNodeById)).toEqual(new Set(['loose', 'root-node']));
  });

  it('hoists only the roots of a dragged subtree — a frame, not its own descendants', () => {
    const refs = createCanvasRefs();
    refs.transform.autoLayoutDropTargetRef.current = armDropTarget();
    // a frame drag arms the frame plus every descendant (rigid transform)
    refs.transform.draggedNodeIdsRef.current = new Set(['frame', 'frame-child', 'frame-grandchild']);

    // only 'frame' is hoisted; its descendants stay in the tree so they render inside its own clip
    expect(getHoistedDragIds(refs, sceneNodeById)).toEqual(new Set(['frame']));
  });
});
