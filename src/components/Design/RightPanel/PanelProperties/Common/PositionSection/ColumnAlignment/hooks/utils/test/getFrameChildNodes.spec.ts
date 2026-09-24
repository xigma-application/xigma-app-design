// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getFrameChildNodes } from '../getFrameChildNodes';

describe('getFrameChildNodes', () => {
  it("should resolve the frame's children and skip ids that no longer exist", () => {
    // mock
    const child = { id: 'child', type: NodeType.frame } as unknown as TSceneNode;
    const frame = { childIds: ['child', 'missing'] } as TFrameNode;

    // result
    expect(getFrameChildNodes({ child }, frame)).toEqual([child]);
  });
});
