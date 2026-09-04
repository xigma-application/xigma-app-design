// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFramePadding } from '../getFramePadding';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getFramePadding', () => {
  it('should default every side to zero when the frame has no padding set', () => {
    expect(getFramePadding(frame())).toEqual({ paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 });
  });

  it('should read whichever sides are explicitly set on the frame', () => {
    const padded = frame({ paddingBottom: 4, paddingLeft: 8, paddingRight: 12, paddingTop: 16 });

    expect(getFramePadding(padded)).toEqual({ paddingBottom: 4, paddingLeft: 8, paddingRight: 12, paddingTop: 16 });
  });
});
