// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getChildrenFillResetChanges } from '../getChildrenFillResetChanges';

const child = (id: string, widthSizingMode?: SizingMode, heightSizingMode?: SizingMode): TSceneNode =>
  ({ heightSizingMode, id, type: NodeType.rectangle, widthSizingMode, x: 0, y: 0 }) as TSceneNode;

const nodes: Record<string, TSceneNode> = {
  fillBoth: child('fillBoth', SizingMode.fill, SizingMode.fill),
  fillWidth: child('fillWidth', SizingMode.fill, SizingMode.fixed),
  line: { id: 'line', type: NodeType.line } as unknown as TSceneNode,
};

const frame = { childIds: ['fillBoth', 'fillWidth', 'line', 'missing'] } as TFrameNode;

describe('getChildrenFillResetChanges', () => {
  it('should list the box children that fill the frame along the width', () => {
    // result
    expect(getChildrenFillResetChanges(frame, 'width', nodes)).toEqual(['fillBoth', 'fillWidth']);
  });

  it('should list the box children that fill the frame along the height', () => {
    // result
    expect(getChildrenFillResetChanges(frame, 'height', nodes)).toEqual(['fillBoth']);
  });
});
