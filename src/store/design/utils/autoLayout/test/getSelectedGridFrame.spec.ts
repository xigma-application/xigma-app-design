// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getSelectedGridFrame } from '../getSelectedGridFrame';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const rectangle: TRectangleNode = {
  fill: '#000',
  height: 50,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x: 0,
  y: 0,
};

describe('getSelectedGridFrame', () => {
  it('should return the frame when it is the sole selected node in grid layout mode', () => {
    // result
    expect(getSelectedGridFrame([frame])).toBe(frame);
  });

  it('should return null when nothing is selected', () => {
    // result
    expect(getSelectedGridFrame([])).toBeNull();
  });

  it('should return null when more than one node is selected', () => {
    // result
    expect(getSelectedGridFrame([frame, rectangle])).toBeNull();
  });

  it('should return null when the selected node is not a frame', () => {
    // result
    expect(getSelectedGridFrame([rectangle])).toBeNull();
  });

  it('should return null when the selected frame is not in grid layout mode', () => {
    // mock
    const horizontalFrame = { ...frame, layoutMode: LayoutMode.horizontal };

    // result
    expect(getSelectedGridFrame([horizontalFrame])).toBeNull();
  });
});
