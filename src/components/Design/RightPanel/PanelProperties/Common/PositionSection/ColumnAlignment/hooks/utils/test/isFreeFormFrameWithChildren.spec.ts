// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isFreeFormFrameWithChildren } from '../isFreeFormFrameWithChildren';

const frame = (patch: object): TSceneNode => ({ childIds: ['c'], type: NodeType.frame, ...patch }) as TSceneNode;

describe('isFreeFormFrameWithChildren', () => {
  it('should accept a free-form frame with children', () => {
    // result
    expect(isFreeFormFrameWithChildren(frame({}))).toBe(true);
    expect(isFreeFormFrameWithChildren(frame({ layoutMode: LayoutMode.freeForm }))).toBe(true);
  });

  it('should reject an auto layout frame, an empty frame or another node', () => {
    // result
    expect(isFreeFormFrameWithChildren(frame({ layoutMode: LayoutMode.vertical }))).toBe(false);
    expect(isFreeFormFrameWithChildren(frame({ childIds: [] }))).toBe(false);
    expect(isFreeFormFrameWithChildren({ type: NodeType.rectangle } as TSceneNode)).toBe(false);
    expect(isFreeFormFrameWithChildren(undefined)).toBe(false);
  });
});
