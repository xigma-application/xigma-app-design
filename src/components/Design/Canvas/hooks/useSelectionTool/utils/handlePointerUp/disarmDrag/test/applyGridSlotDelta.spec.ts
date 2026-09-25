// types
import { TFrameNode } from 'types/design/types';
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';

// utils
import { applyGridSlotDelta } from '../applyGridSlotDelta';

const applyGridDropMock = vi.fn();
const placements = new Map<string, TGridCellPlacement>();

vi.mock('../applyGridDrop', () => ({ applyGridDrop: (...args: unknown[]): unknown => applyGridDropMock(...args) }));
vi.mock('../getGridPlacementsById', () => ({ getGridPlacementsById: (): unknown => ({ columnCount: 3, placements }) }));

const place = (id: string, columnStart: number, rowStart: number, columnSpan = 1, rowSpan = 1): TGridCellPlacement =>
  ({ columnSpan, columnStart, id, rowSpan, rowStart }) as TGridCellPlacement;

const frame = (gridAutoPlacement?: boolean): TFrameNode => ({ gridAutoPlacement, id: 'f' }) as unknown as TFrameNode;

describe('applyGridSlotDelta', () => {
  beforeEach(() => {
    applyGridDropMock.mockClear();
    placements.clear();
    placements
      .set('a', place('a', 0, 0))
      .set('b', place('b', 2, 0))
      .set('wide', place('wide', 0, 2, 2, 1));
  });

  it('should move the dragged cells by the slot delta, clamped to the grid', () => {
    // mock
    const dispatch = vi.fn();

    // before
    applyGridSlotDelta(dispatch, frame(false), ['a'], { steps: null, x: 1, y: -3 }, {});

    // result
    expect(applyGridDropMock).toHaveBeenCalledWith(dispatch, 'f', [{ column: 1, row: 0 }], ['a']);
  });

  it('should clamp a wide cell to the last columns it fits in', () => {
    // before
    applyGridSlotDelta(vi.fn(), frame(false), ['wide'], { steps: null, x: 5, y: 0 }, {});

    // result
    expect(applyGridDropMock).toHaveBeenCalledWith(expect.anything(), 'f', [{ column: 1, row: 2 }], ['wide']);
  });

  it('should not move onto an occupied cell, a missing placement, in place, or under auto placement', () => {
    // before
    applyGridSlotDelta(vi.fn(), frame(false), ['a'], { steps: null, x: 2, y: 0 }, {});
    applyGridSlotDelta(vi.fn(), frame(false), ['missing'], { steps: null, x: 1, y: 0 }, {});
    applyGridSlotDelta(vi.fn(), frame(false), ['a'], { steps: null, x: 0, y: 0 }, {});
    applyGridSlotDelta(vi.fn(), frame(), ['a'], { steps: null, x: 1, y: 0 }, {});

    // result
    expect(applyGridDropMock).not.toHaveBeenCalled();
  });
});
