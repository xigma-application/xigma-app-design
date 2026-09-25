// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isFreeformFrame } from '../isFreeformFrame';

describe('isFreeformFrame', () => {
  it('should be true for a frame without a layout mode or in free-form mode', () => {
    // result
    expect(isFreeformFrame({ type: NodeType.frame } as TSceneNode)).toBe(true);
    expect(isFreeformFrame({ layoutMode: LayoutMode.freeForm, type: NodeType.frame } as TSceneNode)).toBe(true);
  });

  it('should be false for an auto layout frame or another layer', () => {
    // result
    expect(isFreeformFrame({ layoutMode: LayoutMode.horizontal, type: NodeType.frame } as TSceneNode)).toBe(false);
    expect(isFreeformFrame({ type: NodeType.section } as TSceneNode)).toBe(false);
  });
});
