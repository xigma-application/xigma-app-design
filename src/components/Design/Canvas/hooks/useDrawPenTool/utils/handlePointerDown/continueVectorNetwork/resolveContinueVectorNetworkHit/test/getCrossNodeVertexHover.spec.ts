// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getCrossNodeVertexHover } from '../getCrossNodeVertexHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getCrossNodeVertexHover', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should return null without hit-testing when a same-node hover already matched', () => {
    // result
    expect(getCrossNodeVertexHover({ x: 0, y: 0 }, { vertexId: 'v1' }, [], {}, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should find the closest vertex across the given open nodes when there is no same-node hover', () => {
    // mock
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 500, y: 500 } },
      }),
    );

    const { rootOrder, nodes } = store.getState().design;
    const targetId = rootOrder[rootOrder.length - 1];

    // before
    const hit = getCrossNodeVertexHover({ x: 500, y: 500 }, null, [targetId], nodes, IDENTITY_VIEWPORT);

    // result
    expect(hit).toEqual({ node: nodes[targetId], vertexId: 'a' });
  });

  it('should return null when no vertex on any given open node is within tolerance', () => {
    // result
    expect(getCrossNodeVertexHover({ x: 5000, y: 5000 }, null, [], {}, IDENTITY_VIEWPORT)).toBeNull();
  });
});
