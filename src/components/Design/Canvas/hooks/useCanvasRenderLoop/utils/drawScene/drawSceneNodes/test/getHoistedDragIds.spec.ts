// types
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getHoistedDragIds } from '../getHoistedDragIds';

const sceneNodeById = new Map<string, TSceneNode>([
  ['a', { id: 'a' } as TSceneNode],
  ['b', { id: 'b' } as TSceneNode],
]);

describe('getHoistedDragIds', () => {
  it('returns an empty set when no auto-layout drop target is active', () => {
    const refs = createCanvasRefs();
    refs.transform.draggedNodeIdsRef.current = new Set(['a']);

    expect(getHoistedDragIds(refs, sceneNodeById).size).toBe(0);
  });

  it('returns an empty set when nothing is being dragged', () => {
    const refs = createCanvasRefs();
    refs.transform.autoLayoutDropTargetRef.current = {
      frameId: 'frame-1',
      index: 0,
      indicator: { height: 0, width: 0, x: 0, y: 0 },
      siblingPositions: {},
    };

    expect(getHoistedDragIds(refs, sceneNodeById).size).toBe(0);
  });

  it('returns the dragged ids that exist in the scene while a drop target is armed', () => {
    const refs = createCanvasRefs();
    refs.transform.autoLayoutDropTargetRef.current = {
      frameId: 'frame-1',
      index: 0,
      indicator: { height: 0, width: 0, x: 0, y: 0 },
      siblingPositions: {},
    };
    refs.transform.draggedNodeIdsRef.current = new Set(['a', 'ghost-only']);

    expect(getHoistedDragIds(refs, sceneNodeById)).toEqual(new Set(['a']));
  });
});
