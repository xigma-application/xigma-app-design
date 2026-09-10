// utils
import { readGridTrackRects } from '../readGridTrackRects';

const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 20, top }) }) as unknown as HTMLElement;

describe('readGridTrackRects', () => {
  it('should read every registered row rect in index order', () => {
    const rows = new Map<number, HTMLElement>([
      [0, rowAt(0)],
      [1, rowAt(20)],
    ]);

    const rects = readGridTrackRects(2, rows);

    expect(rects).toEqual([
      { height: 20, top: 0 },
      { height: 20, top: 20 },
    ]);
  });

  it('should report null for a track with no registered row', () => {
    const rows = new Map<number, HTMLElement>([[0, rowAt(0)]]);

    const rects = readGridTrackRects(2, rows);

    expect(rects).toEqual([{ height: 20, top: 0 }, null]);
  });
});
