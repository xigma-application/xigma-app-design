// store
import { selectVectorPointSelection } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorEditRefs } from 'types/design/canvas/types';

// utils
import { syncVectorPointSelection } from '../syncVectorPointSelection';

const makeVectorEditRefs = (vertexIds: string[], segmentIds: string[]): TVectorEditRefs =>
  ({
    selectedVectorHandlesRef: { current: [{ end: 'start', segmentId: 'h' }] },
    selectedVectorSegmentIdsRef: { current: segmentIds },
    selectedVectorVertexIdsRef: { current: vertexIds },
  }) as unknown as TVectorEditRefs;

describe('syncVectorPointSelection', () => {
  it('should copy the selected points and segments into the store', () => {
    // before
    syncVectorPointSelection(makeVectorEditRefs(['v1'], ['s1']));

    // result
    expect(selectVectorPointSelection(store.getState())).toEqual({
      handles: [{ end: 'start', segmentId: 'h' }],
      segmentIds: ['s1'],
      vertexIds: ['v1'],
    });
  });

  it('should not dispatch when the store already holds the same selection', () => {
    // mock
    const previous = selectVectorPointSelection(store.getState());

    // spy
    const dispatch = vi.spyOn(store, 'dispatch');

    // before
    syncVectorPointSelection(makeVectorEditRefs(['v1'], ['s1']));

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(selectVectorPointSelection(store.getState())).toBe(previous);
  });
});
