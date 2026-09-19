// utils
import { getStripScale } from '../getStripScale';

const build = (thicknessByColumn: number[], height: number): Float32Array => {
  const data = new Float32Array(thicknessByColumn.length * height);

  thicknessByColumn.forEach((thickness, column) => {
    for (let row = 0; row < thickness; row += 1) {
      data[row * thicknessByColumn.length + column] = 1;
    }
  });

  return data;
};

describe('getStripScale', () => {
  it('should be half the thickness of a constant band', () => {
    // result
    expect(getStripScale(build([10, 10, 10, 10], 20), 4, 20)).toBe(5);
  });

  it('should ignore empty columns and a single outlier at the 95th percentile', () => {
    // before
    const thicknesses = [0, ...Array.from({ length: 40 }, () => 10), 30];

    // result
    expect(getStripScale(build(thicknesses, 40), thicknesses.length, 40)).toBe(5);
  });

  it('should never go below 1', () => {
    // result
    expect(getStripScale(new Float32Array(20), 4, 5)).toBe(1);
  });
});
