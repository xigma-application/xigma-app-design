// types
import { TSelectionColorGroup } from '../../../../types';

// utils
import { getNextOpenGroup } from '../getNextOpenGroup';

const RED_GROUP: TSelectionColorGroup = {
  key: 'a:fills:0',
  occurrences: [{ index: 0, nodeId: 'a', property: 'fills' }],
  paint: { color: '#ff0000', opacity: 100, type: 'solid' },
  signature: 'red',
};

const BLUE_GROUP: TSelectionColorGroup = {
  key: 'b:fills:0',
  occurrences: [{ index: 0, nodeId: 'b', property: 'fills' }],
  paint: { color: '#0000ff', opacity: 100, type: 'solid' },
  signature: 'blue',
};

describe('getNextOpenGroup', () => {
  it('should open the given group, replacing whatever was open', () => {
    // result
    expect(getNextOpenGroup(null, RED_GROUP, true)).toEqual({ key: RED_GROUP.key, occurrences: RED_GROUP.occurrences });
    expect(getNextOpenGroup({ key: BLUE_GROUP.key, occurrences: BLUE_GROUP.occurrences }, RED_GROUP, true)).toEqual({
      key: RED_GROUP.key,
      occurrences: RED_GROUP.occurrences,
    });
  });

  it('should clear the open group when closing the one that is currently open', () => {
    // result
    expect(getNextOpenGroup({ key: RED_GROUP.key, occurrences: RED_GROUP.occurrences }, RED_GROUP, false)).toBeNull();
  });

  it('should leave the open group untouched when a different, already-closed group reports closing', () => {
    // mock
    const current = { key: BLUE_GROUP.key, occurrences: BLUE_GROUP.occurrences };

    // result
    expect(getNextOpenGroup(current, RED_GROUP, false)).toBe(current);
  });

  it('should stay null when nothing is open and told to close', () => {
    // result
    expect(getNextOpenGroup(null, RED_GROUP, false)).toBeNull();
  });
});
