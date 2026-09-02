import { RefObject } from 'react';

// store
import { setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin } from '../../../types';
import { TPoint } from 'types/canvas';
import { VECTOR_FILL } from '../../../../../constants';

// utils
import { startNewVectorNetwork } from '../startNewVectorNetwork';

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });

describe('startNewVectorNetwork', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should add a new vector node with a single vertex at the click point and enter Vector Edit Mode on it', () => {
    // mock
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();

    // before
    startNewVectorNetwork({ x: 10, y: 20 }, store.dispatch, store, dragOriginRef, dragStartRef);

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];
    const newNodeId = design.vectorEditingNodeIds[0] as string | undefined;

    expect(newNodeId).not.toBeUndefined();
    expect(page.selectedIds).toEqual([newNodeId]);
    expect(page.nodes[newNodeId as string]).toMatchObject({
      defaultFill: [{ color: VECTOR_FILL, opacity: 100, type: 'solid' }],
      segments: {},
      type: NodeType.vector,
    });

    const vertexId = design.penActiveVertexId as string;
    const node = page.nodes[newNodeId as string];

    expect(node).toMatchObject({ vertices: { [vertexId]: { id: vertexId, x: 10, y: 20 } } });
    expect(dragOriginRef.current).toEqual({ nodeId: newNodeId, segmentId: null, vertexId });
    expect(dragStartRef.current).toEqual({ x: 10, y: 20 });
  });
});
