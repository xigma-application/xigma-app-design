// utils
import { createGlProxy } from 'test/createGlProxy';
import { isGlassRectStable } from '../isGlassRectStable';

describe('isGlassRectStable', () => {
  it('should be unstable the first time a node is seen', () => {
    // result
    expect(isGlassRectStable(createGlProxy(), 'n', { height: 10, width: 10, x: 0, y: 0 })).toBe(false);
  });

  it('should be stable while the raw size stays within the tolerance and unstable once it jumps', () => {
    // mock
    const gl = createGlProxy();

    // before
    isGlassRectStable(gl, 'n', { height: 10, width: 10, x: 0, y: 0 });

    // result
    expect(isGlassRectStable(gl, 'n', { height: 10, rawHeight: 11, rawWidth: 10, width: 10, x: 0, y: 0 })).toBe(true);
    expect(isGlassRectStable(gl, 'n', { height: 10, rawHeight: 11, rawWidth: 20, width: 10, x: 0, y: 0 })).toBe(false);
    expect(isGlassRectStable(gl, 'n', { height: 30, rawWidth: 20, width: 10, x: 0, y: 0 })).toBe(false);
  });
});
