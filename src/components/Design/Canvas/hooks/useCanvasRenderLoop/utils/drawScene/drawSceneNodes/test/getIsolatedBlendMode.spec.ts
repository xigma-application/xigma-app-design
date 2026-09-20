// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getIsolatedBlendMode } from '../getIsolatedBlendMode';

const node: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 0,
  y: 0,
};

describe('getIsolatedBlendMode', () => {
  it('should return the node blend mode when it is a real one', () => {
    // result
    expect(getIsolatedBlendMode({ ...node, blendMode: BlendMode.multiply }, createCanvasRefs())).toBe(BlendMode.multiply);
  });

  it('should fall back to Normal when the blend mode is missing or Pass through', () => {
    // result
    expect(getIsolatedBlendMode(node, createCanvasRefs())).toBe(BlendMode.normal);
    expect(getIsolatedBlendMode({ ...node, blendMode: BlendMode.passThrough }, createCanvasRefs())).toBe(BlendMode.normal);
  });
});
