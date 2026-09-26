// utils
import { getSelectionColorOccurrenceIdentity } from '../getSelectionColorOccurrenceIdentity';

describe('getSelectionColorOccurrenceIdentity', () => {
  it('should join the node, property and paint index', () => {
    // result
    expect(getSelectionColorOccurrenceIdentity({ index: 2, nodeId: 'n', property: 'strokes' })).toBe('n:strokes:2');
  });

  it('should add the vector area between the property and the paint index', () => {
    // result
    expect(getSelectionColorOccurrenceIdentity({ faceKey: 'f1', index: 0, nodeId: 'n', property: 'fills' })).toBe('n:fills:f1:0');
  });
});
