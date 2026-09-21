// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { collectSelectionColorGroups } from '../collectSelectionColorGroups';

const child: TRectangleNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'child',
  name: 'Rectangle',
  parentId: 'frame',
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const hiddenChild: TRectangleNode = {
  ...child,
  fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
  hidden: true,
  id: 'hidden-child',
};

const frame: TFrameNode = {
  childIds: ['child', 'hidden-child'],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

const nodesById: Record<string, TSceneNode> = { child, frame, 'hidden-child': hiddenChild };

describe('collectSelectionColorGroups', () => {
  it('should merge the frame’s own fill with its child’s identical fill into one group', () => {
    // result
    const groups = collectSelectionColorGroups(frame, nodesById);

    expect(groups).toHaveLength(1);
    expect(groups[0].occurrences).toEqual([
      { index: 0, nodeId: 'frame', property: 'fills' },
      { index: 0, nodeId: 'child', property: 'fills' },
    ]);
  });

  it('should exclude a hidden child’s colors', () => {
    // result
    const groups = collectSelectionColorGroups(frame, nodesById);

    expect(groups.some((group) => group.paint.type === 'solid' && group.paint.color === '#00ff00')).toBe(false);
  });

  it('should keep a pinned occurrence from merging with a match it otherwise would', () => {
    // result
    const groups = collectSelectionColorGroups(frame, nodesById, [{ index: 0, nodeId: 'frame', property: 'fills' }]);

    expect(groups).toHaveLength(2);
  });
});
