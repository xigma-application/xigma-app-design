// utils
import { toDraftRect } from '../toDraftRect';

describe('toDraftRect', () => {
  it('should normalize the rect when dragging towards the bottom right', () => {
    // before
    const rect = toDraftRect({ x: 10, y: 10 }, { x: 60, y: 40 });

    // result
    expect(rect).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });

  it('should normalize the rect when dragging towards the top left', () => {
    // before
    const rect = toDraftRect({ x: 60, y: 40 }, { x: 10, y: 10 });

    // result
    expect(rect).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });

  it('should round a fractional pointer position to whole pixels', () => {
    // before
    const rect = toDraftRect({ x: 10.2, y: 10.6 }, { x: 60.4, y: 40.5 });

    // result
    expect(rect).toEqual({ height: 30, width: 50, x: 10, y: 11 });
  });

  it('should keep the edge anchored at a fractional start point perfectly stable while dragging toward it, instead of letting x and width drift apart by a whole unit as they round independently', () => {
    // mock — start.x (523.437) rounds to 523; every current.x below must keep x + width === 523
    // exactly, not oscillate to 524 depending on current.x's own fractional part
    const start = { x: 523.437, y: 300 };

    // result
    [523.437, 523.137, 522.837, 522.537, 522.237, 521.937, 521.637, 521.337, 521.037, 520.737, 520.437, 520.137].forEach((x) => {
      const rect = toDraftRect(start, { x, y: 300 });

      expect(rect.x + rect.width).toBe(523);
    });
  });

  it('should keep the edge anchored at a fractional start point stable while dragging up/left simultaneously, on both axes', () => {
    // mock — start (523.437, 300.687) rounds to (523, 301); dragging up-left must keep the bottom-right
    // corner at exactly (523, 301) regardless of current's own fractional part
    const start = { x: 523.437, y: 300.687 };
    const rect = toDraftRect(start, { x: 520.937, y: 297.937 });

    // result
    expect(rect.x + rect.width).toBe(523);
    expect(rect.y + rect.height).toBe(301);
  });
});
