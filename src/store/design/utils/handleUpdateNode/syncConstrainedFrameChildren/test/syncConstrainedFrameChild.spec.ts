// types
import { AlignmentHorizontal, NodeType } from 'types/design/enums';
import { TFrameBoxSnapshot } from '../syncConstrainedFrameChildren';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { syncConstrainedFrameChild } from '../syncConstrainedFrameChild';

const frame: TFrameNode = {
  childIds: ['child-1'],
  clipContent: true,
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  height: 200,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 500,
  x: 100,
  y: 100,
};

const previousBox: TFrameBoxSnapshot = { height: 200, rotation: 0, width: 400, x: 100, y: 100 };

const child: TRectangleNode = {
  fills: [],
  height: 20,
  id: 'child-1',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 230,
  y: 130,
};

describe('syncConstrainedFrameChild', () => {
  it('should not move a default (left/top-anchored) child when only the width grows', () => {
    // mock
    const testChild: TRectangleNode = { ...child };
    const nodes: Record<string, TSceneNode> = { [frame.id]: frame, [testChild.id]: testChild };

    // before
    syncConstrainedFrameChild(nodes, frame, previousBox, 100, 0, testChild.id);

    // result
    expect(testChild.x).toBe(230);
    expect(testChild.y).toBe(130);
  });

  it('should carry a right-anchored child along with the full width delta', () => {
    // mock
    const testChild: TRectangleNode = { ...child, alignment: { horizontal: AlignmentHorizontal.right } };
    const nodes: Record<string, TSceneNode> = { [frame.id]: frame, [testChild.id]: testChild };

    // before
    syncConstrainedFrameChild(nodes, frame, previousBox, 100, 0, testChild.id);

    // result
    expect(testChild.x).toBe(330);
  });

  it('should do nothing when the child is not eligible (no matching parent frame)', () => {
    // mock — parentId points at a frame that is not in the nodes map, so it's ineligible
    const testChild: TRectangleNode = { ...child, parentId: 'other-frame' };
    const nodes: Record<string, TSceneNode> = { [frame.id]: frame, [testChild.id]: testChild };

    // before
    syncConstrainedFrameChild(nodes, frame, previousBox, 100, 0, testChild.id);

    // result
    expect(testChild.x).toBe(230);
  });

  it('should do nothing when the child id is not found in nodes', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { [frame.id]: frame };

    // result
    expect(() => syncConstrainedFrameChild(nodes, frame, previousBox, 100, 0, 'missing-id')).not.toThrow();
  });
});
