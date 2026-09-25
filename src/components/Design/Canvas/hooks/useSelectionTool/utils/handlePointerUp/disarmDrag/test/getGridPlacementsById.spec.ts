// types
import { TFrameNode } from 'types/design/types';

// utils
import { getGridPlacementsById } from '../getGridPlacementsById';

const placeMock = vi.fn(() => [{ id: 'a' }, { id: 'b' }]);

vi.mock('utils/canvas/gridSlots/getGridTrackLayout', () => ({ getGridTrackLayout: (): unknown => ({ columnCount: 3 }) }));
vi.mock('store/design/utils/autoLayout/getGridPlacementInputs', () => ({ getGridPlacementInputs: (): string => 'inputs' }));
vi.mock('store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells', () => ({
  placeGridCells: (...args: unknown[]): unknown => placeMock(...(args as [])),
}));

describe('getGridPlacementsById', () => {
  it('should place the grid children and index the placements by id', () => {
    // before
    const result = getGridPlacementsById({ childIds: [] } as unknown as TFrameNode, {});

    // result
    expect(result.columnCount).toBe(3);
    expect([...result.placements.keys()]).toEqual(['a', 'b']);
    expect(placeMock).toHaveBeenCalledWith('inputs', 3, true);
  });

  it('should honour a grid without auto placement', () => {
    // before
    getGridPlacementsById({ childIds: [], gridAutoPlacement: false } as unknown as TFrameNode, {});

    // result
    expect(placeMock).toHaveBeenLastCalledWith('inputs', 3, false);
  });
});
