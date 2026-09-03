// hooks
import { getEligibleVectorAtPoint } from '../getEligibleVectorAtPoint';

// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

// each test places its geometry at a distinct offset so leftover nodes from earlier tests in this
// file (the store is a shared singleton) can never overlap and skew a later hit-test
const addStraightVector = (offsetX: number): void => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: offsetX, y: 0 }, b: { id: 'b', x: offsetX + 100, y: 0 } },
    }),
  );
};

describe('getEligibleVectorAtPoint', () => {
  it('should return the vector node when the point lands on its path', () => {
    // mock
    addStraightVector(1000);

    // result
    expect(getEligibleVectorAtPoint({ x: 1050, y: 0 }, IDENTITY_VIEWPORT)?.name).toBe('Vector');
  });

  it('should return null for a point away from any path', () => {
    // mock
    addStraightVector(2000);

    // result
    expect(getEligibleVectorAtPoint({ x: 20500, y: 20500 }, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a non-vector node under the point', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ffffff',
        height: 100,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 100,
        x: 3000,
        y: 0,
      }),
    );

    // result
    expect(getEligibleVectorAtPoint({ x: 3050, y: 50 }, IDENTITY_VIEWPORT)).toBeNull();
  });

  it("should return a plain rectangle too — Enter's same convertible-shape set, not just an already-real vector", () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ffffff',
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 5000,
        y: 0,
      }),
    );

    // result
    expect(getEligibleVectorAtPoint({ x: 5050, y: 50 }, IDENTITY_VIEWPORT)?.name).toBe('Rectangle');
  });

  it('should return null for a vector with no segments to form a chain', () => {
    // mock
    store.dispatch(
      addNode({
        defaultFill: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 4000, y: 0 } },
      }),
    );

    // result
    expect(getEligibleVectorAtPoint({ x: 4000, y: 0 }, IDENTITY_VIEWPORT)).toBeNull();
  });
});
