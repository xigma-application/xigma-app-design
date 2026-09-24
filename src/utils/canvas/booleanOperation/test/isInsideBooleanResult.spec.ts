// types
import { BooleanOperation } from 'types/design/enums';

// utils
import { isInsideBooleanResult } from '../isInsideBooleanResult';

describe('isInsideBooleanResult', () => {
  it.each([
    [BooleanOperation.union, [false, true], true],
    [BooleanOperation.union, [false, false], false],
    [BooleanOperation.subtract, [true, false], true],
    [BooleanOperation.subtract, [true, true], false],
    [BooleanOperation.subtract, [false, true], false],
    [BooleanOperation.intersect, [true, true], true],
    [BooleanOperation.intersect, [true, false], false],
    [BooleanOperation.intersect, [], false],
    [BooleanOperation.exclude, [true, false], true],
    [BooleanOperation.exclude, [true, true], false],
    [BooleanOperation.exclude, [true, true, true], true],
  ])('should resolve %s with memberships %j to %s', (operation, memberships, expected) => {
    // action / result
    expect(isInsideBooleanResult(operation, memberships)).toBe(expected);
  });
});
