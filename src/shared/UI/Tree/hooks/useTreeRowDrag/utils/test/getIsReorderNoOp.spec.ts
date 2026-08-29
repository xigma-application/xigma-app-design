// utils
import { getIsReorderNoOp } from '../getIsReorderNoOp';

describe('getIsReorderNoOp', () => {
  it('should be a no-op when dropping a single row back on its own slot', () => {
    // action & result
    expect(getIsReorderNoOp([2], 2)).toBe(true);
  });

  it('should be a no-op when dropping a single row on the slot right after itself', () => {
    // action & result
    expect(getIsReorderNoOp([2], 3)).toBe(true);
  });

  it('should not be a no-op when dropping a single row anywhere else', () => {
    // action & result
    expect(getIsReorderNoOp([2], 0)).toBe(false);
    expect(getIsReorderNoOp([2], 5)).toBe(false);
  });

  it('should be a no-op when dropping a contiguous block anywhere within or right after its own span', () => {
    // action & result
    expect(getIsReorderNoOp([2, 3, 4], 2)).toBe(true);
    expect(getIsReorderNoOp([2, 3, 4], 3)).toBe(true);
    expect(getIsReorderNoOp([2, 3, 4], 5)).toBe(true);
  });

  it('should not be a no-op when dropping a contiguous block outside its own span', () => {
    // action & result
    expect(getIsReorderNoOp([2, 3, 4], 0)).toBe(false);
    expect(getIsReorderNoOp([2, 3, 4], 6)).toBe(false);
  });

  it('should never be a no-op for a non-contiguous selection, since any drop collapses the gap', () => {
    // action & result
    expect(getIsReorderNoOp([1, 3], 1)).toBe(false);
    expect(getIsReorderNoOp([1, 3], 2)).toBe(false);
    expect(getIsReorderNoOp([1, 3], 4)).toBe(false);
  });
});
