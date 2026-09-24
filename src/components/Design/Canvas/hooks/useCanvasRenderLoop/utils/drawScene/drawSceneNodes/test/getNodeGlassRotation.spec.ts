// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeGlassRotation } from '../getNodeGlassRotation';

describe('getNodeGlassRotation', () => {
  it('should convert the node rotation to radians', () => {
    // action / result
    expect(getNodeGlassRotation({ rotation: 90, type: NodeType.rectangle } as TSceneNode)).toBeCloseTo(Math.PI / 2);
  });
});
