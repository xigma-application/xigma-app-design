// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getContrastUnsupportedReason } from '../getContrastUnsupportedReason';

const PAINT: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const node: TRectangleNode = {
  fills: [PAINT],
  height: 10,
  id: 'r',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

describe('getContrastUnsupportedReason', () => {
  it('should be undefined for a simple foreground', () => {
    expect(getContrastUnsupportedReason(PAINT, node)).toBeUndefined();
  });

  it('should report the foreground when the fill itself has a blend mode', () => {
    expect(getContrastUnsupportedReason({ ...PAINT, blendMode: BlendMode.multiply }, node)).toBe('foreground');
  });

  it("should report the foreground when the node's appearance has a blend mode", () => {
    expect(getContrastUnsupportedReason(PAINT, { ...node, blendMode: BlendMode.overlay })).toBe('foreground');
  });

  it('should ignore Normal and Pass through', () => {
    expect(
      getContrastUnsupportedReason({ ...PAINT, blendMode: BlendMode.normal }, { ...node, blendMode: BlendMode.passThrough }),
    ).toBeUndefined();
  });
});
