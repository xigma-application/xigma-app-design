// types
import { TSelectionColorGroup } from '../../types';

// utils
import { getSelectionColorPreview } from '../getSelectionColorPreview';

const buildGroup = (color: string): TSelectionColorGroup => ({
  key: color,
  occurrences: [{ index: 0, nodeId: color, property: 'fills' }],
  paint: { color, opacity: 100, type: 'solid' },
  signature: color,
});

describe('getSelectionColorPreview', () => {
  it('should show every group with no overflow when there are 3 or fewer', () => {
    // mock
    const groups = [buildGroup('#ff0000'), buildGroup('#00ff00')];

    // result
    expect(getSelectionColorPreview(groups)).toEqual({ overflowCount: 0, visibleGroups: groups });
  });

  it('should cap the preview at the first 3 groups and report how many more there are', () => {
    // mock
    const groups = [buildGroup('#ff0000'), buildGroup('#00ff00'), buildGroup('#0000ff'), buildGroup('#ffff00')];

    // result
    expect(getSelectionColorPreview(groups)).toEqual({ overflowCount: 1, visibleGroups: groups.slice(0, 3) });
  });

  it('should return no groups and no overflow for an empty list', () => {
    // result
    expect(getSelectionColorPreview([])).toEqual({ overflowCount: 0, visibleGroups: [] });
  });
});
