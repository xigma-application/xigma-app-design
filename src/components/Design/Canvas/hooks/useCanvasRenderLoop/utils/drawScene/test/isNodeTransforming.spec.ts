// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { isNodeTransforming } from '../isNodeTransforming';

describe('isNodeTransforming', () => {
  it('should be false when none of the transform-in-progress id sets are populated', () => {
    // before
    const result = isNodeTransforming(createCanvasRefs(), 'node-1');

    // result
    expect(result).toBe(false);
  });

  it('should be true when the id is in the dragged-node-ids set', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.draggedNodeIdsRef.current = new Set(['node-1']);

    // before
    const result = isNodeTransforming(refs, 'node-1');

    // result
    expect(result).toBe(true);
  });

  it('should be true when the id is in the resized-node-ids set', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.resizedNodeIdsRef.current = new Set(['node-1']);

    // before
    const result = isNodeTransforming(refs, 'node-1');

    // result
    expect(result).toBe(true);
  });

  it('should be true when the id is in the rotated-node-ids set', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.rotatedNodeIdsRef.current = new Set(['node-1']);

    // before
    const result = isNodeTransforming(refs, 'node-1');

    // result
    expect(result).toBe(true);
  });

  it('should be false when the id is absent from every populated set', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.draggedNodeIdsRef.current = new Set(['other-node']);

    // before
    const result = isNodeTransforming(refs, 'node-1');

    // result
    expect(result).toBe(false);
  });
});
