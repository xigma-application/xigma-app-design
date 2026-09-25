// types
import { TFrameNode } from 'types/design/types';
import { TGridDropTargetHover } from 'types/design/canvas/types';

// utils
import { getGridSlotDelta } from '../getGridSlotDelta';

vi.mock('../getGridPlacementsById', () => ({
  getGridPlacementsById: (): unknown => ({ columnCount: 3, placements: new Map([['a', { columnStart: 1, id: 'a', rowStart: 1 }]]) }),
}));

const frame = {} as TFrameNode;
const hover = (extra: object): TGridDropTargetHover => extra as unknown as TGridDropTargetHover;

describe('getGridSlotDelta', () => {
  it('should measure the move to an insert position', () => {
    // result
    expect(getGridSlotDelta(frame, ['a'], 'a', hover({ indicator: {}, insertIndex: 7 }), {})).toEqual({ steps: null, x: 0, y: 1 });
  });

  it('should measure the move to the hovered cell of the grabbed layer', () => {
    // result
    expect(getGridSlotDelta(frame, ['a'], 'a', hover({ cells: [{ column: 2, row: 0 }], insertIndex: 4 }), {})).toEqual({
      steps: null,
      x: 1,
      y: -1,
    });
  });

  it('should not move without a hover, a target cell or a placement', () => {
    // result
    expect(getGridSlotDelta(frame, ['a'], 'a', null, {})).toEqual({ steps: null, x: 0, y: 0 });
    expect(getGridSlotDelta(frame, ['a'], 'a', hover({ cells: [] }), {})).toEqual({ steps: null, x: 0, y: 0 });
    expect(getGridSlotDelta(frame, ['b'], 'b', hover({ cells: [{ column: 0, row: 0 }] }), {})).toEqual({ steps: null, x: 0, y: 0 });
  });
});
