// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getGridSlotMoveCandidates } from '../getGridSlotMoveCandidates';

const placement = (overrides: Partial<TGridCellPlacement> = {}): TGridCellPlacement => ({
  columnSpan: 1,
  columnStart: 0,
  id: 'a',
  rowSpan: 1,
  rowStart: 0,
  ...overrides,
});

const node = (id: string): TSceneNode => ({ id }) as unknown as TSceneNode;

describe('getGridSlotMoveCandidates', () => {
  it('should shift every selected node by one slot when nothing blocks any of them', () => {
    const placements = [placement({ columnStart: 0, id: 'a' }), placement({ columnStart: 1, id: 'b' })];

    expect(getGridSlotMoveCandidates(placements, [node('a'), node('b')], { axis: 'column', step: 1 }, 4, 4)).toEqual([
      { columnStart: 1, id: 'a', rowStart: 0 },
      { columnStart: 2, id: 'b', rowStart: 0 },
    ]);
  });

  it('should exclude the selected nodes themselves from the occupancy check, so they never block each other', () => {
    // two selected nodes sit side by side; moving them both right by one would have each land on
    // where the other used to be if selected nodes weren't excluded from their own occupancy
    const placements = [placement({ columnStart: 0, id: 'a' }), placement({ columnStart: 1, id: 'b' })];

    const candidates = getGridSlotMoveCandidates(placements, [node('a'), node('b')], { axis: 'column', step: 1 }, 4, 4);

    expect(candidates.every((candidate) => candidate !== null)).toBe(true);
  });

  it('should block the candidate whose target slot is occupied by a non-selected node', () => {
    const placements = [placement({ columnStart: 0, id: 'a' }), placement({ columnStart: 1, id: 'occupant' })];

    expect(getGridSlotMoveCandidates(placements, [node('a')], { axis: 'column', step: 1 }, 4, 4)).toEqual([null]);
  });

  it('should return null for a selected node with no resolvable placement', () => {
    expect(getGridSlotMoveCandidates([], [node('missing')], { axis: 'column', step: 1 }, 4, 4)).toEqual([null]);
  });
});
