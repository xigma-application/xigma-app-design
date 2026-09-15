// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { doesNodeHavePatternInSubtree } from '../doesNodeHavePatternInSubtree';

const SOLID_RECTANGLE: TRectangleNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'solid-rect',
  locked: false,
  name: 'Rectangle',
  opacity: 100,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
};

const PATTERN_RECTANGLE: TRectangleNode = {
  ...SOLID_RECTANGLE,
  fills: [
    {
      alignmentIndex: 0,
      direction: 'horizontal',
      opacity: 100,
      scale: 100,
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    },
  ],
  id: 'pattern-rect',
};

describe('doesNodeHavePatternInSubtree', () => {
  it('should return false for a leaf node with only solid fills', () => {
    // before
    const result = doesNodeHavePatternInSubtree(SOLID_RECTANGLE, { [SOLID_RECTANGLE.id]: SOLID_RECTANGLE });

    // result
    expect(result).toBe(false);
  });

  it('should return true when the node itself has a pattern fill', () => {
    // before
    const result = doesNodeHavePatternInSubtree(PATTERN_RECTANGLE, { [PATTERN_RECTANGLE.id]: PATTERN_RECTANGLE });

    // result
    expect(result).toBe(true);
  });

  it('should return true when a descendant deep inside a frame has a pattern fill, not just the frame itself', () => {
    // mock — Frame > Frame > Rectangle-with-pattern
    const innerFrame: TFrameNode = {
      childIds: [PATTERN_RECTANGLE.id],
      clipContent: false,
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height: 40,
      id: 'inner-frame',
      locked: false,
      name: 'Inner frame',
      opacity: 100,
      parentId: 'outer-frame',
      rotation: 0,
      type: NodeType.frame,
      width: 40,
      x: 0,
      y: 0,
    };
    const outerFrame: TFrameNode = {
      ...innerFrame,
      childIds: [innerFrame.id],
      id: 'outer-frame',
      name: 'Outer frame',
      parentId: null,
    };
    const nodesById: Record<string, TSceneNode> = {
      [PATTERN_RECTANGLE.id]: { ...PATTERN_RECTANGLE, parentId: innerFrame.id },
      [innerFrame.id]: innerFrame,
      [outerFrame.id]: outerFrame,
    };

    // before
    const result = doesNodeHavePatternInSubtree(outerFrame, nodesById);

    // result
    expect(result).toBe(true);
  });

  it('should return false for a frame whose children are all pattern-free', () => {
    // mock
    const frame: TFrameNode = {
      childIds: [SOLID_RECTANGLE.id],
      clipContent: false,
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height: 40,
      id: 'plain-frame',
      locked: false,
      name: 'Frame',
      opacity: 100,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 40,
      x: 0,
      y: 0,
    };
    const nodesById: Record<string, TSceneNode> = {
      [SOLID_RECTANGLE.id]: { ...SOLID_RECTANGLE, parentId: frame.id },
      [frame.id]: frame,
    };

    // before
    const result = doesNodeHavePatternInSubtree(frame, nodesById);

    // result
    expect(result).toBe(false);
  });
});
