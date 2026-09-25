// utils
import { getTargetNumberTokens } from '../getTargetNumberTokens';

const first = { end: 4, start: 2, value: 12 };
const second = { end: 12, start: 8, value: 3 };
const tokens = [first, second];

describe('getTargetNumberTokens', () => {
  it('should target the number nearest to a caret, before, inside or after it', () => {
    // result
    expect(getTargetNumberTokens(tokens, 0, 0)).toEqual([first]);
    expect(getTargetNumberTokens(tokens, 3, 3)).toEqual([first]);
    expect(getTargetNumberTokens(tokens, 7, 7)).toEqual([second]);
    expect(getTargetNumberTokens(tokens, 20, 20)).toEqual([second]);
  });

  it('should target every number overlapped by a selection', () => {
    // result
    expect(getTargetNumberTokens(tokens, 3, 9)).toEqual([first, second]);
  });

  it('should fall back to the number nearest the selection start when the selection covers none', () => {
    // result
    expect(getTargetNumberTokens(tokens, 5, 7)).toEqual([first]);
  });

  it('should target nothing without numbers', () => {
    // result
    expect(getTargetNumberTokens([], 0, 0)).toEqual([]);
  });
});
