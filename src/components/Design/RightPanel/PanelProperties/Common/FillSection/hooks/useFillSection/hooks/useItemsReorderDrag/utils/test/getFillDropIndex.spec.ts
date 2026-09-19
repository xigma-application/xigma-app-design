// utils
import { getFillDropIndex } from '../getFillDropIndex';

const rect = (top: number, height = 20): DOMRect => ({ height, top }) as DOMRect;

describe('getFillDropIndex', () => {
  it('should return 0 when the pointer is above every row midpoint', () => {
    const rows = new Map([
      [0, { getBoundingClientRect: () => rect(0) } as unknown as HTMLElement],
      [1, { getBoundingClientRect: () => rect(20) } as unknown as HTMLElement],
    ]);

    expect(getFillDropIndex(2, rows, -5)).toBe(0);
  });

  it('should count how many rows the pointer has passed the midpoint of', () => {
    const rows = new Map([
      [0, { getBoundingClientRect: () => rect(0) } as unknown as HTMLElement],
      [1, { getBoundingClientRect: () => rect(20) } as unknown as HTMLElement],
      [2, { getBoundingClientRect: () => rect(40) } as unknown as HTMLElement],
    ]);

    // past row 0's midpoint (y=10) but not row 1's (y=30)
    expect(getFillDropIndex(3, rows, 15)).toBe(1);
  });

  it('should treat a missing row measurement as never passed', () => {
    const rows = new Map([[1, { getBoundingClientRect: () => rect(20) } as unknown as HTMLElement]]);

    expect(getFillDropIndex(2, rows, 100)).toBe(1);
  });
});
