// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNetworkComponent } from 'utils/canvas/vectorNetwork/cutVectorNetwork/types';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorCutComponents } from '../commitVectorCutComponents';

const addVectorNode = (): TVectorNode => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#00ff00',
      strokeWidth: 3,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    }),
  );

  const { rootOrder } = store.getState().design;

  return store.getState().design.nodes[rootOrder[rootOrder.length - 1]] as TVectorNode;
};

const identity = (component: TVectorNetworkComponent): TVectorNetworkComponent => component;

describe('commitVectorCutComponents', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should return an empty array and dispatch nothing when there is only one component', () => {
    // mock
    const node = addVectorNode();
    const component: TVectorNetworkComponent = {
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };
    const rootOrderBefore = store.getState().design.rootOrder.length;

    // before
    const newNodeIds = commitVectorCutComponents(store.dispatch, node, [component], identity);

    // result
    expect(newNodeIds).toEqual([]);
    expect(store.getState().design.rootOrder).toHaveLength(rootOrderBefore);
  });

  it('should keep the original node id for the largest component and create a new node for every other one, inheriting style', () => {
    // mock — a 2-vertex "small" component and a 3-vertex "large" one
    const node = addVectorNode();
    const smallComponent: TVectorNetworkComponent = {
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };
    const largeComponent: TVectorNetworkComponent = {
      segments: {
        s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
        s3: { endId: 'e', id: 's3', startId: 'd', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: { c: { id: 'c', x: 200, y: 0 }, d: { id: 'd', x: 300, y: 0 }, e: { id: 'e', x: 400, y: 0 } },
    };

    // before
    const newNodeIds = commitVectorCutComponents(store.dispatch, node, [smallComponent, largeComponent], identity);

    // result
    const updatedOriginal = store.getState().design.nodes[node.id] as TVectorNode;

    expect(Object.keys(updatedOriginal.vertices).sort()).toEqual(['c', 'd', 'e']);
    expect(newNodeIds).toHaveLength(1);

    const newNode = store.getState().design.nodes[newNodeIds[0]] as TVectorNode;

    expect(Object.keys(newNode.vertices).sort()).toEqual(['a', 'b']);
    expect(newNode.fillColor).toBe('#ff0000');
    expect(newNode.strokeColor).toBe('#00ff00');
    expect(newNode.strokeWidth).toBe(3);
    expect(newNode.rotation).toBe(0);
  });

  it('should apply the finish step to every component before dispatching', () => {
    // mock
    const node = addVectorNode();
    const componentA: TVectorNetworkComponent = {
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };
    const componentB: TVectorNetworkComponent = {
      segments: { s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { c: { id: 'c', x: 200, y: 0 }, d: { id: 'd', x: 300, y: 0 } },
    };
    const finish = (component: TVectorNetworkComponent): TVectorNetworkComponent => ({
      ...component,
      fillColorOverrideByKey: { tagged: '#ff0000' },
      filledFaceKeys: ['tagged'],
    });

    // before
    const newNodeIds = commitVectorCutComponents(store.dispatch, node, [componentA, componentB], finish);

    // result
    const updatedOriginal = store.getState().design.nodes[node.id] as TVectorNode;
    const newNode = store.getState().design.nodes[newNodeIds[0]] as TVectorNode;

    expect(updatedOriginal.filledFaceKeys).toEqual(['tagged']);
    expect(newNode.filledFaceKeys).toEqual(['tagged']);
    expect(updatedOriginal.fillColorOverrideByKey).toEqual({ tagged: '#ff0000' });
    expect(newNode.fillColorOverrideByKey).toEqual({ tagged: '#ff0000' });
  });

  it('should default to an empty color override map when the finish step omits one', () => {
    // mock
    const node = addVectorNode();
    const componentA: TVectorNetworkComponent = {
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };
    const componentB: TVectorNetworkComponent = {
      segments: { s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { c: { id: 'c', x: 200, y: 0 }, d: { id: 'd', x: 300, y: 0 } },
    };

    // before
    const newNodeIds = commitVectorCutComponents(store.dispatch, node, [componentA, componentB], identity);

    // result
    const updatedOriginal = store.getState().design.nodes[node.id] as TVectorNode;
    const newNode = store.getState().design.nodes[newNodeIds[0]] as TVectorNode;

    expect(updatedOriginal.fillColorOverrideByKey).toEqual({});
    expect(newNode.fillColorOverrideByKey).toEqual({});
  });
});
