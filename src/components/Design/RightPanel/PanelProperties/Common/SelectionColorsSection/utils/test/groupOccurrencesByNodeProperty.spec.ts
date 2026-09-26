// types
import { TSelectionColorOccurrence } from '../../types';

// utils
import { groupOccurrencesByNodeProperty } from '../groupOccurrencesByNodeProperty';

describe('groupOccurrencesByNodeProperty', () => {
  it('should keep occurrences on different nodes as separate groups', () => {
    // mock
    const occurrences: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 0, nodeId: 'b', property: 'fills' },
    ];

    // result
    expect(groupOccurrencesByNodeProperty(occurrences)).toEqual([
      { indices: new Set([0]), nodeId: 'a', property: 'fills' },
      { indices: new Set([0]), nodeId: 'b', property: 'fills' },
    ]);
  });

  it('should keep the same node’s fills and strokes as separate groups', () => {
    // mock
    const occurrences: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 0, nodeId: 'a', property: 'strokes' },
    ];

    // result
    expect(groupOccurrencesByNodeProperty(occurrences)).toEqual([
      { indices: new Set([0]), nodeId: 'a', property: 'fills' },
      { indices: new Set([0]), nodeId: 'a', property: 'strokes' },
    ]);
  });

  it('should keep the areas of one vector as separate groups', () => {
    // mock
    const occurrences: TSelectionColorOccurrence[] = [
      { faceKey: 'f1', index: 0, nodeId: 'v', property: 'fills' },
      { faceKey: 'f2', index: 0, nodeId: 'v', property: 'fills' },
    ];

    // result
    expect(groupOccurrencesByNodeProperty(occurrences)).toEqual([
      { faceKey: 'f1', indices: new Set([0]), nodeId: 'v', property: 'fills' },
      { faceKey: 'f2', indices: new Set([0]), nodeId: 'v', property: 'fills' },
    ]);
  });

  it('should merge several indices of the same node and property into one group', () => {
    // mock
    const occurrences: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 2, nodeId: 'a', property: 'fills' },
    ];

    // result
    expect(groupOccurrencesByNodeProperty(occurrences)).toEqual([{ indices: new Set([0, 2]), nodeId: 'a', property: 'fills' }]);
  });
});
