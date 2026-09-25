// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isChildAlignmentContainer } from '../isChildAlignmentContainer';

const node = (overrides: object): TSceneNode => overrides as TSceneNode;

describe('isChildAlignmentContainer', () => {
  it('should be true for a free-form frame or a section that has children', () => {
    // result
    expect(isChildAlignmentContainer(node({ childIds: ['a'], type: NodeType.frame }))).toBe(true);
    expect(isChildAlignmentContainer(node({ childIds: ['a'], type: NodeType.section }))).toBe(true);
  });

  it('should be false for an empty section, an auto layout frame, a group or nothing', () => {
    // result
    expect(isChildAlignmentContainer(node({ childIds: [], type: NodeType.section }))).toBe(false);
    expect(isChildAlignmentContainer(node({ childIds: ['a'], layoutMode: LayoutMode.vertical, type: NodeType.frame }))).toBe(false);
    expect(isChildAlignmentContainer(node({ childIds: ['a'], type: NodeType.group }))).toBe(false);
    expect(isChildAlignmentContainer(undefined)).toBe(false);
  });
});
