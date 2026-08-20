// utils
import { getVisualSelectedVectorVertexIds } from '../getVisualSelectedVectorVertexIds';

describe('getVisualSelectedVectorVertexIds', () => {
  it('should append the Pen tool active vertex to the selection when one is set', () => {
    // action
    const result = getVisualSelectedVectorVertexIds(['v1'], 'v2');

    // result
    expect(result).toEqual(['v1', 'v2']);
  });

  it('should return the selection as-is when there is no active vertex', () => {
    // mock
    const selectedVertexIds = ['v1', 'v2'];

    // action
    const result = getVisualSelectedVectorVertexIds(selectedVertexIds, null);

    // result
    expect(result).toBe(selectedVertexIds);
  });
});
