// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isOffsetVectorNode } from '../isOffsetVectorNode';

describe('isOffsetVectorNode', () => {
  it('should offset a line and a polygon', () => {
    // result
    expect(isOffsetVectorNode({ type: NodeType.line } as TSceneNode)).toBe(true);
    expect(isOffsetVectorNode({ type: NodeType.polygon } as TSceneNode)).toBe(true);
  });

  it('should not offset other layers or a missing one', () => {
    // result
    expect(isOffsetVectorNode({ type: NodeType.rectangle } as TSceneNode)).toBe(false);
    expect(isOffsetVectorNode(undefined)).toBe(false);
  });
});
