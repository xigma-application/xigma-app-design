// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getRotatedAnchorSolver } from '../../../getRotatedAnchorSolver';
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
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
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

  const { rootOrder } = selectActivePage(store.getState());

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
    resizeVectorNode(id, ORIGIN, store.dispatch, { x: 5, y: 2 }, 2, 3, null);

    // result — vertices: anchor + (coord - anchor) * scale, then rounded
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[id];

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

  it('should translate the whole shape to keep the anchor corner fixed in world space when rotated', () => {
    // mock — a 100x100 square rotated 90deg; dragging its local "se" handle to grow local width by 1.5x
    // must keep the corner opposite that handle (local "nw", v1) visually pinned at its rotated world
    // position (100, 0) — scaling the local vertices around a fixed LOCAL anchor alone would leave it
    // drifting once the (now wider) shape's bounds-center shifts and rotation is reapplied around that
    const id = addVectorNode();
    const origin: TVectorNodeOrigin = {
      segments: {},
      vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 }, v3: { x: 100, y: 100 }, v4: { x: 0, y: 100 } },
    };
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const rotatedAnchorSolver = getRotatedAnchorSolver(bounds, 'se', 90, 1.5, 1);

    // before
    resizeVectorNode(id, origin, store.dispatch, { x: 0, y: 0 }, 1.5, 1, rotatedAnchorSolver);

    // result — the translation stays unrounded (like a rotated box node's x/y), so exact equality would
    // be flaky against floating-point noise from Math.cos/sin(90deg) not being perfectly 0/1
    const { vertices } = store.getState().design.pages[store.getState().design.activePageId].nodes[id] as TVectorNode;

    expect(vertices.v1.x).toBeCloseTo(-25);
    expect(vertices.v1.y).toBeCloseTo(25);
    expect(vertices.v2.x).toBeCloseTo(125);
    expect(vertices.v2.y).toBeCloseTo(25);
    expect(vertices.v3.x).toBeCloseTo(125);
    expect(vertices.v3.y).toBeCloseTo(125);
    expect(vertices.v4.x).toBeCloseTo(-25);
    expect(vertices.v4.y).toBeCloseTo(125);
  });
});
