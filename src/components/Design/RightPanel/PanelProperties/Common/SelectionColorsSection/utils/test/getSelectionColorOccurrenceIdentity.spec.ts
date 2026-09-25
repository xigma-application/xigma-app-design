// utils
import { getSelectionColorOccurrenceIdentity } from '../getSelectionColorOccurrenceIdentity';

describe('getSelectionColorOccurrenceIdentity', () => {
  it('should join the node, property and paint index', () => {
    // result
    expect(getSelectionColorOccurrenceIdentity({ index: 2, nodeId: 'n', property: 'strokes' })).toBe('n:strokes:2');
  });
});
