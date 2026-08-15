// utils
import { getWordRangeAtIndex } from '../getWordRangeAtIndex';

describe('getWordRangeAtIndex', () => {
  it('should return the empty range for empty content', () => {
    // result
    expect(getWordRangeAtIndex('', 0)).toEqual({ end: 0, start: 0 });
  });

  it('should select the whole word when the index lands inside it', () => {
    // result — "hello world", index 3 is inside "hello"
    expect(getWordRangeAtIndex('hello world', 3)).toEqual({ end: 5, start: 0 });
  });

  it('should select the second word when the index lands inside it', () => {
    // result — "hello world", index 8 is inside "world"
    expect(getWordRangeAtIndex('hello world', 8)).toEqual({ end: 11, start: 6 });
  });

  it('should select the whole word when the index sits exactly at its start boundary', () => {
    // result — the boundary between "hello" and " " belongs to "hello" (looks at the char after it)
    expect(getWordRangeAtIndex('hello world', 0)).toEqual({ end: 5, start: 0 });
  });

  it('should select the whole word when the index sits exactly at its end boundary', () => {
    // result — the boundary right after "hello" looks at the space that follows, selecting it instead
    expect(getWordRangeAtIndex('hello world', 5)).toEqual({ end: 6, start: 5 });
  });

  it('should select the run of whitespace when the index lands inside it', () => {
    // result — "a   b", index 2 is inside the run of 3 spaces
    expect(getWordRangeAtIndex('a   b', 2)).toEqual({ end: 4, start: 1 });
  });

  it('should select the whole word when the index is past the end of the content', () => {
    // result — clamps to the content length, landing inside the last word
    expect(getWordRangeAtIndex('hello', 999)).toEqual({ end: 5, start: 0 });
  });

  it('should select the whole word when the index is before the start of the content', () => {
    // result — clamps to 0
    expect(getWordRangeAtIndex('hello', -5)).toEqual({ end: 5, start: 0 });
  });

  it('should select a single-character word on its own', () => {
    // result — "a b c", index 2 is exactly on the lone "b"
    expect(getWordRangeAtIndex('a b c', 2)).toEqual({ end: 3, start: 2 });
  });
});
