// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getBooleanOutline } from '../getBooleanOutline';

const vector = { filledFaceKeys: ['f1'], id: 'v', segments: {}, type: NodeType.vector, vertices: {} } as unknown as TVectorNode;

describe('getBooleanOutline', () => {
  it('should drop the filled faces so only the stroke is drawn', () => {
    // action / result
    expect(getBooleanOutline(vector).filledFaceKeys).toEqual([]);
  });

  it('should reuse the outline for the same vector', () => {
    // action / result
    expect(getBooleanOutline(vector)).toBe(getBooleanOutline(vector));
  });
});
