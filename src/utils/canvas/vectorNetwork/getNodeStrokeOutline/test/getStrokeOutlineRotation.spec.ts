// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from '../types';

// utils
import { getStrokeOutlineRotation } from '../getStrokeOutlineRotation';

describe('getStrokeOutlineRotation', () => {
  it('should keep the rotation of a shape whose outline is built in its own unrotated frame', () => {
    // result
    expect(getStrokeOutlineRotation({ rotation: 30, type: NodeType.rectangle } as TStrokeableNode)).toBe(30);
  });

  it('should not rotate a line outline again, since its points are already turned', () => {
    // result
    expect(getStrokeOutlineRotation({ rotation: 30, type: NodeType.line } as TStrokeableNode)).toBe(0);
  });

  it('should not rotate an ellipse outline again, since its stroke band is built turned', () => {
    // result
    expect(getStrokeOutlineRotation({ rotation: 30, type: NodeType.ellipse } as TStrokeableNode)).toBe(0);
  });

  it('should not rotate a polygon or star outline again, since its stroke band is built turned', () => {
    // result
    expect(getStrokeOutlineRotation({ rotation: 30, type: NodeType.polygon } as TStrokeableNode)).toBe(0);
    expect(getStrokeOutlineRotation({ rotation: 30, type: NodeType.star } as TStrokeableNode)).toBe(0);
  });
});
