// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getCrossNodeEdgeHit } from '../getCrossNodeEdgeHit';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getCrossNodeEdgeHit', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should return null without hit-testing when a same-node vertex hover already matched', () => {
    // result
    expect(getCrossNodeEdgeHit({ x: 0, y: 0 }, { vertexId: 'v1' }, null, null, [], {}, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null without hit-testing when a cross-node vertex hover already matched', () => {
    // result
    expect(getCrossNodeEdgeHit({ x: 0, y: 0 }, null, { node: {} as never, vertexId: 'a' }, null, [], {}, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null without hit-testing when a same-node edge hit already matched', () => {
    // result
    expect(getCrossNodeEdgeHit({ x: 0, y: 0 }, null, null, { segmentId: 's1', t: 0.5 }, [], {}, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should find the segment under the point across the given open nodes when nothing else matched', () => {
    // mock
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { sb: { endId: 'b', id: 'sb', startId: 'a', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 500, y: 0 }, b: { id: 'b', x: 500, y: 100 } },
      }),
    );

    const { rootOrder, nodes } = store.getState().design;
    const targetId = rootOrder[rootOrder.length - 1];

    // before
    const hit = getCrossNodeEdgeHit({ x: 500, y: 50 }, null, null, null, [targetId], nodes, IDENTITY_VIEWPORT);

    // result
    expect(hit).toMatchObject({ hit: { segmentId: 'sb', t: 0.5 }, node: nodes[targetId] });
  });

  it('should return null when no edge on any given open node is within tolerance', () => {
    // result
    expect(getCrossNodeEdgeHit({ x: 5000, y: 5000 }, null, null, null, [], {}, IDENTITY_VIEWPORT)).toBeNull();
  });
});
