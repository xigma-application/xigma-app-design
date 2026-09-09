// types
import { LayoutVersion, NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutPadding } from '../../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { clampAutoLayoutFrameToPadding } from '../clampAutoLayoutFrameToPadding';

const padding: TAutoLayoutPadding = { paddingBottom: 30, paddingLeft: 30, paddingRight: 30, paddingTop: 30 };

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 40,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 40,
  x: 0,
  y: 0,
  ...overrides,
});

describe('clampAutoLayoutFrameToPadding', () => {
  it('should widen and heighten a fixed frame narrower than its padding under the updated layout version', () => {
    const node = frame();

    clampAutoLayoutFrameToPadding(node, SizingMode.fixed, SizingMode.fixed, padding, LayoutVersion.updated);

    expect(node.width).toBe(60);
    expect(node.height).toBe(60);
  });

  it('should leave the frame untouched under the legacy layout version', () => {
    const node = frame();

    clampAutoLayoutFrameToPadding(node, SizingMode.fixed, SizingMode.fixed, padding, LayoutVersion.legacy);

    expect(node.width).toBe(40);
    expect(node.height).toBe(40);
  });

  it('should not clamp an axis whose sizing mode is hug', () => {
    const node = frame();

    clampAutoLayoutFrameToPadding(node, SizingMode.hug, SizingMode.hug, padding, LayoutVersion.updated);

    expect(node.width).toBe(40);
    expect(node.height).toBe(40);
  });

  it('should leave a frame already wider than its padding unchanged', () => {
    const node = frame({ height: 200, width: 200 });

    clampAutoLayoutFrameToPadding(node, SizingMode.fixed, SizingMode.fixed, padding, LayoutVersion.updated);

    expect(node.width).toBe(200);
    expect(node.height).toBe(200);
  });
});
