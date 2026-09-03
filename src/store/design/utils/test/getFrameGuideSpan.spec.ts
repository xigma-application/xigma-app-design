// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFrameGuideSpan } from '../getFrameGuideSpan';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 100,
  id: 'frame',
  name: 'frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
};

describe('getFrameGuideSpan', () => {
  it("should span the frame's vertical extent for an x-axis (vertical) guide", () => {
    // result
    expect(getFrameGuideSpan(frame, 'x')).toEqual({ from: 20, to: 120 });
  });

  it("should span the frame's horizontal extent for a y-axis (horizontal) guide", () => {
    // result
    expect(getFrameGuideSpan(frame, 'y')).toEqual({ from: 10, to: 210 });
  });
});
