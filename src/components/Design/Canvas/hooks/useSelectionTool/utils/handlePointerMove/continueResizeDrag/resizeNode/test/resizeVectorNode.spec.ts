// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { resizeVectorNode } from '../resizeVectorNode';

const ORIGIN: TVectorNodeOrigin = {
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 3 } },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: { x: -1, y: 4 }, tangentStart: null },
  },
  vertices: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 }, v3: { x: 10, y: 10 } },
};

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#ffffff',
      name: 'Vector',
      parentId: null,
      segments: ORIGIN.segments,
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 10, y: 0 },
        v3: { id: 'v3', x: 10, y: 10 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resizeVectorNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should scale vertices anchor-relatively via transformCoord, while scaling tangents raw with no anchor offset', () => {
    // mock
    const id = addVectorNode();

    // before — non-trivial, distinct-per-axis anchor and scale so the vertex-vs-tangent formulas can't
    // accidentally agree by coincidence
    resizeVectorNode(id, ORIGIN, store.dispatch, { x: 5, y: 2 }, 2, 3);

    // result — vertices: anchor + (coord - anchor) * scale, then rounded
    const node = store.getState().design.nodes[id];

    expect(node).toMatchObject({
      vertices: {
        v1: { id: 'v1', x: -5, y: -4 },
        v2: { id: 'v2', x: 15, y: -4 },
        v3: { id: 'v3', x: 15, y: 26 },
      },
    });

    // result — tangents: raw x * scaleX / y * scaleY, with no anchor subtraction since they're relative
    // vectors, and null tangents stay null
    expect(node).toMatchObject({
      segments: {
        s1: { tangentEnd: null, tangentStart: { x: 4, y: 9 } },
        s2: { tangentEnd: { x: -2, y: 12 }, tangentStart: null },
      },
    });
  });
});
