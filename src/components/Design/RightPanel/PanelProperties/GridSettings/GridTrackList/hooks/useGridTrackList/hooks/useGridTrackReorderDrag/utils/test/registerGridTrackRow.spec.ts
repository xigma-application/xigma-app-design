import { RefObject } from 'react';

// utils
import { registerGridTrackRow } from '../registerGridTrackRow';

describe('registerGridTrackRow', () => {
  it('should store the element under its index', () => {
    const rowsRef: RefObject<Map<number, HTMLElement>> = { current: new Map() };
    const element = {} as HTMLElement;

    registerGridTrackRow(rowsRef, 1)(element);

    expect(rowsRef.current.get(1)).toBe(element);
  });

  it('should forget the index when given a null element', () => {
    const rowsRef: RefObject<Map<number, HTMLElement>> = { current: new Map([[1, {} as HTMLElement]]) };

    registerGridTrackRow(rowsRef, 1)(null);

    expect(rowsRef.current.has(1)).toBe(false);
  });
});
