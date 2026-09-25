// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isSpacingContainerNode } from '../isSpacingContainerNode';

const node = (overrides: object): TSceneNode => overrides as TSceneNode;

describe('isSpacingContainerNode', () => {
  it('should be true for a group or a free-form frame with children', () => {
    // action / result
    expect(isSpacingContainerNode(node({ childIds: ['a'], type: NodeType.group }))).toBe(true);
    expect(isSpacingContainerNode(node({ childIds: ['a'], layoutMode: LayoutMode.freeForm, type: NodeType.frame }))).toBe(true);
  });

  it('should be false for an empty group, an auto layout frame, another layer or nothing', () => {
    // action / result
    expect(isSpacingContainerNode(node({ childIds: [], type: NodeType.group }))).toBe(false);
    expect(isSpacingContainerNode(node({ childIds: ['a'], layoutMode: LayoutMode.horizontal, type: NodeType.frame }))).toBe(false);
    expect(isSpacingContainerNode(node({ type: NodeType.rectangle }))).toBe(false);
    expect(isSpacingContainerNode(undefined)).toBe(false);
  });
});
