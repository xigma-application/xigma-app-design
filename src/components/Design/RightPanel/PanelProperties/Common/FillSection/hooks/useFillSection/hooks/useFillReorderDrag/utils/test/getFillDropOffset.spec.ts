// utils
import { getFillDropOffset } from '../getFillDropOffset';

const element = (rect: Partial<DOMRect>): HTMLElement => ({ getBoundingClientRect: () => rect as DOMRect }) as unknown as HTMLElement;
const container = (top: number): HTMLElement => element({ top });

describe('getFillDropOffset', () => {
  it('should return the top row’s own top edge, relative to the container, when dropping before every row', () => {
    const rows = new Map([
      [0, element({ top: 120 })],
      [1, element({ top: 152 })],
    ]);

    expect(getFillDropOffset(rows, container(100), 2, 0)).toBe(20);
  });

  it('should return the middle row’s top edge for an insertion slot between rows', () => {
    const rows = new Map([
      [0, element({ top: 120 })],
      [1, element({ top: 152 })],
      [2, element({ top: 184 })],
    ]);

    expect(getFillDropOffset(rows, container(100), 3, 1)).toBe(52);
  });

  it('should return the last row’s bottom edge when the insertion slot is past every row', () => {
    const rows = new Map([
      [0, element({ bottom: 152, top: 120 })],
      [1, element({ bottom: 184, top: 152 })],
    ]);

    expect(getFillDropOffset(rows, container(100), 2, 2)).toBe(84);
  });

  it('should fall back to 0 when the target row was never measured', () => {
    const rows = new Map<number, HTMLElement>();

    expect(getFillDropOffset(rows, container(100), 2, 0)).toBe(0);
  });
});
