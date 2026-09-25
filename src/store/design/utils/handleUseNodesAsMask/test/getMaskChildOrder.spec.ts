// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getMaskChildOrder } from '../getMaskChildOrder';

const nodes = {
  frameA: { id: 'frameA', type: NodeType.frame },
  frameB: { id: 'frameB', type: NodeType.section },
  rect: { id: 'rect', type: NodeType.rectangle },
} as unknown as Record<string, TSceneNode>;

describe('getMaskChildOrder', () => {
  it('should keep the order when the last child can act as the mask shape', () => {
    // result
    expect(getMaskChildOrder(['frameA', 'rect'], nodes)).toEqual(['frameA', 'rect']);
  });

  it('should move the topmost plain shape to the end when the last child is a layout container', () => {
    // result
    expect(getMaskChildOrder(['rect', 'frameA', 'frameB'], nodes)).toEqual(['frameA', 'frameB', 'rect']);
  });

  it('should keep the order when every child is a layout container', () => {
    // result
    expect(getMaskChildOrder(['frameA', 'missing', 'frameB'], nodes)).toEqual(['frameA', 'missing', 'frameB']);
  });
});
