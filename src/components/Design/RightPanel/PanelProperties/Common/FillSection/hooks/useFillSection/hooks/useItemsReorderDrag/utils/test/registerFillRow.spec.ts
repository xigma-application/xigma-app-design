// utils
import { registerFillRow } from '../registerFillRow';

describe('registerFillRow', () => {
  it('should store the element for the given index', () => {
    const rows = new Map<number, HTMLElement>();
    const element = {} as HTMLElement;

    registerFillRow(rows, 0)(element);

    expect(rows.get(0)).toBe(element);
  });

  it('should remove the index when called with null (unmount)', () => {
    const rows = new Map<number, HTMLElement>([[0, {} as HTMLElement]]);

    registerFillRow(rows, 0)(null);

    expect(rows.has(0)).toBe(false);
  });
});
