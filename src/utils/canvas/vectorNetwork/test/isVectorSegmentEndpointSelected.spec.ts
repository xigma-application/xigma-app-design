// utils
import { isVectorSegmentEndpointSelected } from '../isVectorSegmentEndpointSelected';

describe('isVectorSegmentEndpointSelected', () => {
  it('should be true when the segment’s start vertex is selected', () => {
    // action
    const result = isVectorSegmentEndpointSelected('v1', 'v2', ['v1']);

    // result
    expect(result).toBe(true);
  });

  it('should be true when the segment’s end vertex is selected', () => {
    // action
    const result = isVectorSegmentEndpointSelected('v1', 'v2', ['v2']);

    // result
    expect(result).toBe(true);
  });

  it('should be false when neither of the segment’s endpoints is selected', () => {
    // action
    const result = isVectorSegmentEndpointSelected('v1', 'v2', ['v3']);

    // result
    expect(result).toBe(false);
  });
});
