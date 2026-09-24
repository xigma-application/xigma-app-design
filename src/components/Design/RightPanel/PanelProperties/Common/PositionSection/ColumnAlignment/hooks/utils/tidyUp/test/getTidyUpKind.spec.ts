// utils
import { getTidyUpKind } from '../getTidyUpKind';

const rect = (x: number, y: number, width = 10, height = 10): { height: number; width: number; x: number; y: number } => ({
  height,
  width,
  x,
  y,
});

describe('getTidyUpKind', () => {
  it('should detect a row when every layer overlaps one horizontal line', () => {
    // result
    expect(getTidyUpKind([rect(0, 0), rect(30, 5), rect(70, 2)])).toBe('row');
  });

  it('should detect a column when every layer overlaps one vertical line', () => {
    // result
    expect(getTidyUpKind([rect(0, 0), rect(5, 30), rect(2, 70)])).toBe('column');
  });

  it('should detect a grid when the layers share neither a row nor a column', () => {
    // result
    expect(getTidyUpKind([rect(0, 0), rect(30, 0), rect(0, 30), rect(30, 30)])).toBe('grid');
  });

  it('should give up on layers piled on top of each other', () => {
    // result
    expect(getTidyUpKind([rect(0, 0), rect(2, 2)])).toBeUndefined();
  });
});
