// types
import { NodeType } from 'types/design/enums';
import { TShapeNode } from '../../../../../../types';

// utils
import { hasShapeCorners } from '../hasShapeCorners';

describe('hasShapeCorners', () => {
  it('should give an ellipse corners only once its arc is cut', () => {
    // result
    expect(hasShapeCorners({ type: NodeType.ellipse } as TShapeNode)).toBe(false);
    expect(hasShapeCorners({ arcEndAngle: 0, type: NodeType.ellipse } as TShapeNode)).toBe(true);
  });

  it('should always give a polygon corners', () => {
    // result
    expect(hasShapeCorners({ type: NodeType.polygon } as TShapeNode)).toBe(true);
  });
});
