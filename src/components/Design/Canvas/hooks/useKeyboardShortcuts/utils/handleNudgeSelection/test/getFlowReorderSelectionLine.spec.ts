// utils
import { getFlowReorderSelectionLine } from '../getFlowReorderSelectionLine';

describe('getFlowReorderSelectionLine', () => {
  it('should return the line info for a single-node selection', () => {
    const lineGroups = [['a', 'b', 'c']];

    expect(getFlowReorderSelectionLine(lineGroups, ['b'])).toEqual({
      firstIndex: 1,
      lastIndex: 1,
      lineEnd: 2,
      lineIndex: 0,
      lineStart: 0,
    });
  });

  it('should return the line info for a contiguous multi-node selection', () => {
    const lineGroups = [
      ['a', 'b', 'c'],
      ['d', 'e'],
    ];

    expect(getFlowReorderSelectionLine(lineGroups, ['a', 'b'])).toEqual({
      firstIndex: 0,
      lastIndex: 1,
      lineEnd: 2,
      lineIndex: 0,
      lineStart: 0,
    });
  });

  it('should return null when the selection is not contiguous in flow order', () => {
    const lineGroups = [['a', 'b', 'c', 'd']];

    expect(getFlowReorderSelectionLine(lineGroups, ['a', 'c'])).toBeNull();
  });

  it('should return null when a contiguous selection already spans two lines', () => {
    const lineGroups = [
      ['a', 'b'],
      ['c', 'd'],
    ];

    expect(getFlowReorderSelectionLine(lineGroups, ['b', 'c'])).toBeNull();
  });

  it('should return null when a selected id isn’t part of the flow at all', () => {
    const lineGroups = [['a', 'b', 'c']];

    expect(getFlowReorderSelectionLine(lineGroups, ['missing'])).toBeNull();
  });
});
