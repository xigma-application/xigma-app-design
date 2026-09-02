// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getEdgeHit } from '../getEdgeHit';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const addVectorNodeWithEdge = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { sb: { endId: 'b', id: 'sb', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 200, y: 0 }, b: { id: 'b', x: 300, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('getEdgeHit', () => {
  it('should return null without hit-testing when a same-node vertex hover already matched', () => {
    // mock
    const nodeId = addVectorNodeWithEdge();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    // result
    expect(getEdgeHit({ x: 250, y: 0 }, node, { vertexId: 'a' }, null, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null without hit-testing when a cross-node vertex hover already matched', () => {
    // mock
    const nodeId = addVectorNodeWithEdge();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const targetNode = node;

    // result
    expect(getEdgeHit({ x: 250, y: 0 }, node, null, { node: targetNode, vertexId: 'a' }, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should find the segment under the point when nothing else matched', () => {
    // mock
    const nodeId = addVectorNodeWithEdge();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    // before
    const hit = getEdgeHit({ x: 250, y: 0 }, node, null, null, IDENTITY_VIEWPORT);

    // result
    expect(hit).toMatchObject({ segmentId: 'sb', t: 0.5 });
  });
});
