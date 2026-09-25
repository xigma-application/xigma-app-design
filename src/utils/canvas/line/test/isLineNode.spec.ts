// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isLineNode } from '../isLineNode';

describe('isLineNode', () => {
  it('should accept a line only', () => {
    // result
    expect(isLineNode({ type: NodeType.line } as TSceneNode)).toBe(true);
    expect(isLineNode({ type: NodeType.rectangle } as TSceneNode)).toBe(false);
    expect(isLineNode(undefined)).toBe(false);
  });
});
