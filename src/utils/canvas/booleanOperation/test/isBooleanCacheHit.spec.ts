// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { isBooleanCacheHit } from '../isBooleanCacheHit';

const operand = { id: 'a', type: NodeType.vector } as TVectorNode;

describe('isBooleanCacheHit', () => {
  it('should hit for the same operation and the same operand objects', () => {
    // action / result
    expect(
      isBooleanCacheHit({ operands: [operand], operation: BooleanOperation.union, result: null }, BooleanOperation.union, [operand]),
    ).toBe(true);
  });

  it('should miss when the operation changes', () => {
    // action / result
    expect(
      isBooleanCacheHit({ operands: [operand], operation: BooleanOperation.union, result: null }, BooleanOperation.subtract, [operand]),
    ).toBe(false);
  });

  it('should miss when an operand is a new object or the count differs', () => {
    // action / result
    expect(
      isBooleanCacheHit({ operands: [operand], operation: BooleanOperation.union, result: null }, BooleanOperation.union, [{ ...operand }]),
    ).toBe(false);
    expect(isBooleanCacheHit({ operands: [operand], operation: BooleanOperation.union, result: null }, BooleanOperation.union, [])).toBe(
      false,
    );
  });

  it('should miss without a cached entry', () => {
    // action / result
    expect(isBooleanCacheHit(undefined, BooleanOperation.union, [])).toBe(false);
  });
});
