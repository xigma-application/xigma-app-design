import { RefObject } from 'react';

// types
import { TEndpointDragState } from '../../../types';

// utils
import { armEndpointDrag } from '../armEndpointDrag';

const createEndpointDragRef = (): RefObject<TEndpointDragState | null> => ({ current: null });

describe('armEndpointDrag', () => {
  it('should record the node id and endpoint being dragged', () => {
    // mock
    const endpointDragRef = createEndpointDragRef();

    // before
    armEndpointDrag('line-1', 'a', endpointDragRef);

    // result
    expect(endpointDragRef.current).toEqual({ endpoint: 'a', nodeId: 'line-1' });
  });
});
