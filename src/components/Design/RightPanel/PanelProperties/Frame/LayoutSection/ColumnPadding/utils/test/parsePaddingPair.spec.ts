// utils
import { parsePaddingPair } from '../parsePaddingPair';

const fallback = { first: 1, second: 1 };

describe('parsePaddingPair', () => {
  it('should split "5,2" into the two sides', () => {
    expect(parsePaddingPair('5,2', fallback)).toEqual({ first: 5, second: 2 });
  });

  it('should tolerate spaces and stray characters', () => {
    expect(parsePaddingPair(' 5 , 2 px', fallback)).toEqual({ first: 5, second: 2 });
  });

  it('should apply a single number to both sides', () => {
    expect(parsePaddingPair('7', fallback)).toEqual({ first: 7, second: 7 });
  });

  it('should reuse the first number when the second is empty', () => {
    expect(parsePaddingPair('7,', fallback)).toEqual({ first: 7, second: 7 });
  });

  it('should clamp negatives away (the minus is stripped, not parsed)', () => {
    expect(parsePaddingPair('-4', fallback)).toEqual({ first: 4, second: 4 });
  });

  it('should fall back per side when a side is not a number', () => {
    expect(parsePaddingPair('', fallback)).toEqual({ first: 1, second: 1 });
  });
});
