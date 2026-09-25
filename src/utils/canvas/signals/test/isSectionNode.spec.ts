// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isSectionNode } from '../isSectionNode';

describe('isSectionNode', () => {
  it('should be true only for a section', () => {
    // action / result
    expect(isSectionNode({ type: NodeType.section } as TSceneNode)).toBe(true);
    expect(isSectionNode({ type: NodeType.frame } as TSceneNode)).toBe(false);
    expect(isSectionNode(undefined)).toBe(false);
  });
});
