import { RefObject } from 'react';

// types
import { TEndpointDragState, TLineEndpoint } from '../../types';

export const armEndpointDrag = (nodeId: string, endpoint: TLineEndpoint, endpointDragRef: RefObject<TEndpointDragState | null>): void => {
  endpointDragRef.current = { endpoint, nodeId };
};
