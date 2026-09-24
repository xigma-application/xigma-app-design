// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { canAlignFrameChildren } from '../canAlignFrameChildren';

const frame = (changes: Partial<TFrameNode>): TSceneNode =>
  ({ childIds: ['child'], parentId: null, type: NodeType.frame, ...changes }) as TFrameNode;

describe('canAlignFrameChildren', () => {
  it('should be true for a top-level free-form frame with children', () => {
    // result
    expect(canAlignFrameChildren(frame({}))).toBe(true);
    expect(canAlignFrameChildren(frame({ layoutMode: LayoutMode.freeForm }))).toBe(true);
  });

  it('should be false for a nested frame', () => {
    // result
    expect(canAlignFrameChildren(frame({ parentId: 'parent' }))).toBe(false);
  });

  it('should be false for an auto-layout or grid frame', () => {
    // result
    expect(canAlignFrameChildren(frame({ layoutMode: LayoutMode.horizontal }))).toBe(false);
    expect(canAlignFrameChildren(frame({ layoutMode: LayoutMode.grid }))).toBe(false);
  });

  it('should be false for a frame without children, a non-frame or nothing', () => {
    // result
    expect(canAlignFrameChildren(frame({ childIds: [] }))).toBe(false);
    expect(canAlignFrameChildren({ childIds: ['child'], parentId: null, type: NodeType.section } as unknown as TSceneNode)).toBe(false);
    expect(canAlignFrameChildren(undefined)).toBe(false);
  });
});
