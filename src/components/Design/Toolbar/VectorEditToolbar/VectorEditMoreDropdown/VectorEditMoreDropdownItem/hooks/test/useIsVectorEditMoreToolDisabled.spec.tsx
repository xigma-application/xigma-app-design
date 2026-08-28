import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useIsVectorEditMoreToolDisabled } from '../useIsVectorEditMoreToolDisabled';

// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const renderUseIsVectorEditMoreToolDisabled = (
  toolName: ToolName.shapeBuilder | ToolName.variableWidth,
): ReturnType<typeof renderHook<boolean, unknown>> =>
  renderHook(() => useIsVectorEditMoreToolDisabled(toolName), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

const addStraightVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addBranchingVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 50, y: 0 },
        c: { id: 'c', x: 100, y: 0 },
        d: { id: 'd', x: 50, y: 50 },
      },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useIsVectorEditMoreToolDisabled', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should never disable Shape Builder, even with no eligible nodes being edited', () => {
    // before
    const { result } = renderUseIsVectorEditMoreToolDisabled(ToolName.shapeBuilder);

    // result
    expect(result.current).toBe(false);
  });

  it('should disable Variable Width when no node is being edited at all', () => {
    // before
    const { result } = renderUseIsVectorEditMoreToolDisabled(ToolName.variableWidth);

    // result
    expect(result.current).toBe(true);
  });

  it('should disable Variable Width when every edited node is a branching network', () => {
    // mock
    const nodeId = addBranchingVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const { result } = renderUseIsVectorEditMoreToolDisabled(ToolName.variableWidth);

    // result
    expect(result.current).toBe(true);
  });

  it('should enable Variable Width when exactly one edited node is a non-branching chain', () => {
    // mock
    const nodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const { result } = renderUseIsVectorEditMoreToolDisabled(ToolName.variableWidth);

    // result
    expect(result.current).toBe(false);
  });

  it('should disable Variable Width when two nodes are being edited simultaneously, even if both are eligible on their own', () => {
    // mock
    const firstNodeId = addStraightVectorNode();
    const secondNodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([firstNodeId, secondNodeId]));

    // before
    const { result } = renderUseIsVectorEditMoreToolDisabled(ToolName.variableWidth);

    // result
    expect(result.current).toBe(true);
  });
});
