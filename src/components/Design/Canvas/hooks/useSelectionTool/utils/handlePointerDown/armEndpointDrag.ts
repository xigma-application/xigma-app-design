import { RefObject } from 'react';
import { TEndpointDragState, TLineEndpoint } from 'types/design/selectionTool/types';

// types

export const armEndpointDrag = (nodeId: string, endpoint: TLineEndpoint, endpointDragRef: RefObject<TEndpointDragState | null>): void => {
  endpointDragRef.current = { endpoint, nodeId };
};
