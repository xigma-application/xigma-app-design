// utils
import { getHandleHoverResult } from '../getHandleHoverResult';

describe('getHandleHoverResult', () => {
  it("should return the handle's cursor class and node id when a handle is hit", () => {
    // result
    expect(getHandleHoverResult({ nodeId: 'node-1' }, 'radius')).toEqual({ className: 'radius', cursor: '', nodeId: 'node-1' });
  });

  it('should return undefined when no handle is hit', () => {
    // result
    expect(getHandleHoverResult(null, 'radius')).toBeUndefined();
  });
});
