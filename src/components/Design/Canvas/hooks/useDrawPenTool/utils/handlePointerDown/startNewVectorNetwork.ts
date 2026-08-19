import { nanoid } from '@reduxjs/toolkit';
import { RefObject } from 'react';

// others
import { VECTOR_NAME, VECTOR_STROKE } from '../../../../constants';
import { VECTOR_STROKE_WIDTH } from 'constant/canvas';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin } from '../../types';
import { TPoint } from 'types/canvas';

const activateNewVertex = (
  appStore: AppStore,
  vertexId: string,
  point: TPoint,
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
): void => {
  const { rootOrder } = appStore.getState().design;
  const newNodeId = rootOrder[rootOrder.length - 1];

  dispatch(setSelection([newNodeId]));
  dispatch(setVectorEditingNodeId(newNodeId));
  dispatch(setPenActiveVertexId(vertexId));

  dragOriginRef.current = { nodeId: newNodeId, segmentId: null, vertexId };
  dragStartRef.current = point;
};

export const startNewVectorNetwork = (
  point: TPoint,
  dispatch: AppDispatch,
  appStore: AppStore,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
): void => {
  const vertexId = nanoid();

  dispatch(
    addNode({
      fillColor: null,
      name: VECTOR_NAME,
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: VECTOR_STROKE,
      strokeWidth: VECTOR_STROKE_WIDTH,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { [vertexId]: { id: vertexId, x: point.x, y: point.y } },
    }),
  );
  activateNewVertex(appStore, vertexId, point, dispatch, dragOriginRef, dragStartRef);
};
