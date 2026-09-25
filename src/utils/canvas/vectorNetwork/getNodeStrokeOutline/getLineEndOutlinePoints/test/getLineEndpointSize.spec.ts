// others
import { LINE_ENDPOINT_MIN_SIZE } from 'constant/canvas';

// utils
import { getLineEndpointSize } from '../getLineEndpointSize';

describe('getLineEndpointSize', () => {
  it('should keep thin lines at the minimum endpoint size', () => {
    // result
    expect(getLineEndpointSize(0.5, 4)).toBe(LINE_ENDPOINT_MIN_SIZE);
  });

  it('should grow with the line width once the factor outgrows the minimum', () => {
    // result
    expect(getLineEndpointSize(2, 4)).toBe(16);
  });
});
