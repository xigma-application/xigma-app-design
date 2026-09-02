// store
import { deleteNode, updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitCrossingVectorNodeGroup } from '../commitCrossingVectorNodeGroup';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { groupCrossingVectorNodes } from 'utils/canvas/vectorNetwork/mergeVectorNodes/groupCrossingVectorNodes';

// two 150x200 rectangles staggered by (75,100) — proven (mergeVectorFaces.spec.ts's own
// crossingRectanglesNode fixture) to planarize into exactly 3 faces once combined
const buildRectangleNode = (id: string, offsetX: number, offsetY: number): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id,
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    [`${id}s1`]: { endId: `${id}v2`, id: `${id}s1`, startId: `${id}v1`, tangentEnd: null, tangentStart: null },
    [`${id}s2`]: { endId: `${id}v3`, id: `${id}s2`, startId: `${id}v2`, tangentEnd: null, tangentStart: null },
    [`${id}s3`]: { endId: `${id}v4`, id: `${id}s3`, startId: `${id}v3`, tangentEnd: null, tangentStart: null },
    [`${id}s4`]: { endId: `${id}v1`, id: `${id}s4`, startId: `${id}v4`, tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    [`${id}v1`]: { id: `${id}v1`, x: offsetX, y: offsetY },
    [`${id}v2`]: { id: `${id}v2`, x: offsetX + 150, y: offsetY },
    [`${id}v3`]: { id: `${id}v3`, x: offsetX + 150, y: offsetY + 200 },
    [`${id}v4`]: { id: `${id}v4`, x: offsetX, y: offsetY + 200 },
  },
});

describe('commitCrossingVectorNodeGroup', () => {
  it('should merge every face the freeform path touches, dispatch one updateNode for the survivor, and delete every absorbed id', () => {
    // mock
    const [group] = groupCrossingVectorNodes([buildRectangleNode('n1', 0, 0), buildRectangleNode('n2', 75, 100)]);
    const dispatch = vi.fn();
    const path = [
      { x: 25, y: 25 },
      { x: 100, y: 150 },
      { x: 200, y: 250 },
    ];

    // action
    const absorbed = commitCrossingVectorNodeGroup(dispatch, group, path, false, false);

    // result
    expect(absorbed).toEqual(['n2']);

    const updateAction = dispatch.mock.calls.find((call) => call[0].type === updateNode.type)![0] as ReturnType<typeof updateNode>;
    const deleteAction = dispatch.mock.calls.find((call) => call[0].type === deleteNode.type)![0] as ReturnType<typeof deleteNode>;
    const changes = updateAction.payload.changes as Partial<TVectorNode>;

    expect(updateAction.payload.id).toBe('n1');
    expect(deleteAction.payload).toBe('n2');
    expect(changes.rotation).toBe(0);
    expect(changes.filledFaceKeys).toHaveLength(1);
  });

  it('should forward the merged face’s own picked color in the dispatched changes', () => {
    // mock — n1's own single face has an explicit paint-tool color before the two nodes ever cross
    const bareN1 = buildRectangleNode('n1', 0, 0);
    const [faceN1] = deriveVectorFaces(bareN1);
    const paintedN1 = {
      ...bareN1,
      fillByKey: { [getVectorFillLoopKey(faceN1.pieceKeys)]: [{ color: '#00ff00', opacity: 100, type: 'solid' as const }] },
      filledFaceKeys: [getVectorFillLoopKey(faceN1.pieceKeys)],
    };
    const [group] = groupCrossingVectorNodes([paintedN1, buildRectangleNode('n2', 75, 100)]);
    const dispatch = vi.fn();
    const path = [
      { x: 25, y: 25 },
      { x: 100, y: 150 },
      { x: 200, y: 250 },
    ];

    // action
    commitCrossingVectorNodeGroup(dispatch, group, path, false, false);

    // result — n1's original face key is now stale (its geometry changed once it crossed n2), but the
    // freshly-merged face still inherits its picked color, not a hash-derived one
    const updateAction = dispatch.mock.calls.find((call) => call[0].type === updateNode.type)![0] as ReturnType<typeof updateNode>;
    const changes = updateAction.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys!.length).toBeGreaterThan(0);
    expect(Object.values(changes.fillByKey ?? {})).toContainEqual([{ color: '#00ff00', opacity: 100, type: 'solid' as const }]);
  });

  it('should merge via a box (isBoxMode) instead of the freeform path, using only the path’s first/last point as corners', () => {
    // mock — same pair, box spanning first→last corner covers all 3 sub-regions too
    const [group] = groupCrossingVectorNodes([buildRectangleNode('n1', 0, 0), buildRectangleNode('n2', 75, 100)]);
    const dispatch = vi.fn();
    const path = [
      { x: 10, y: 10 },
      { x: 215, y: 290 },
    ];

    // action
    const absorbed = commitCrossingVectorNodeGroup(dispatch, group, path, true, false);

    // result
    expect(absorbed).toEqual(['n2']);
  });

  it('should subtract instead of merge when isSubtract is true', () => {
    // mock
    const [group] = groupCrossingVectorNodes([buildRectangleNode('n1', 0, 0), buildRectangleNode('n2', 75, 100)]);
    const dispatch = vi.fn();
    const path = [{ x: 100, y: 150 }]; // dead center of the overlap only

    // action
    const absorbed = commitCrossingVectorNodeGroup(dispatch, group, path, false, true);

    // result
    expect(absorbed).toEqual(['n2']);

    const updateAction = dispatch.mock.calls.find((call) => call[0].type === updateNode.type)![0] as ReturnType<typeof updateNode>;
    const changes = updateAction.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual([]);
  });

  it('should dispatch nothing and return no absorbed ids when the path never actually touches any of the combined node’s faces', () => {
    // mock — path lands far outside either rectangle
    const [group] = groupCrossingVectorNodes([buildRectangleNode('n1', 0, 0), buildRectangleNode('n2', 75, 100)]);
    const dispatch = vi.fn();
    const path = [{ x: 5000, y: 5000 }];

    // action
    const absorbed = commitCrossingVectorNodeGroup(dispatch, group, path, false, false);

    // result
    expect(absorbed).toEqual([]);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
